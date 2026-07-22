// Cloudflare Worker: records SMS consent evidence for two separate A2P 10DLC
// programs hosted on this domain:
//   POST /sms-consent         — Buffet Lucia's Fiesta Mexicana "Receipt and
//                                Order Notifications" (BLFM brand)
//   POST /julio-sms-consent   — "Julio Salas SMS Testing" (personal sole
//                                proprietor brand, unrelated to BLFM)
//
// Each program has its own canonical disclosure text, Privacy/Terms URLs,
// and (optionally) its own Twilio Messaging Service SID, so a message never
// goes out under the wrong brand's registered campaign.
//
// Nothing here trusts client-side validation — every field is re-checked.
// Twilio/D1 credentials are Worker secrets and are never sent to the browser.

const RATE_LIMIT_MAX = 5; // max submissions per IP per window
const RATE_LIMIT_WINDOW_MIN = 60;
const MAX_NAME_LEN = 100;
const MAX_REFERENCE_LEN = 64;

const BLFM_DISCLOSURE_TEXT =
  "I agree to receive transactional text messages from Buffet Lucia's Fiesta Mexicana regarding my food order, " +
  "catering service, payment confirmation, receipt, or order status. Message frequency varies. Message and data " +
  "rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not a condition of purchase.";

const BLFM_OPT_IN_CONFIRMATION_SMS =
  "Buffet Lucia's Fiesta Mexicana: You're confirmed to receive order, payment, and receipt texts. Msg frequency " +
  "varies. Msg & data rates may apply. Reply STOP to unsubscribe or HELP for assistance.";

const JULIO_DISCLOSURE_TEXT =
  "I agree to receive low-volume transactional software-test text messages from Julio Salas regarding test food " +
  "orders, catering requests, payment confirmations, receipt notifications, and application-status updates. " +
  "Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. " +
  "Consent is not a condition of purchase.";

const JULIO_OPT_IN_CONFIRMATION_SMS =
  "Julio Salas SMS Testing: You're confirmed to receive test order, payment, and receipt texts. Msg frequency " +
  "varies. Msg & data rates may apply. Reply STOP to unsubscribe or HELP for assistance.";

// Per-program configuration. Each program is fully self-contained: its own
// disclosure text, its own Privacy/Terms/consent-page URLs (read from env
// so they're not hardcoded twice), and its own optional Twilio Messaging
// Service SID env var — so a confirmation text can never be sent under the
// wrong registered campaign.
function programConfig(pathname, env) {
  if (pathname === "/sms-consent") {
    return {
      id: "blfm_receipt_notifications",
      disclosureText: BLFM_DISCLOSURE_TEXT,
      confirmationSms: BLFM_OPT_IN_CONFIRMATION_SMS,
      privacyUrl: env.PRIVACY_URL,
      termsUrl: env.TERMS_URL,
      consentPageUrl: env.CONSENT_PAGE_URL,
      policyVersion: env.POLICY_VERSION,
      messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
    };
  }
  if (pathname === "/julio-sms-consent") {
    return {
      id: "julio_sms_testing",
      disclosureText: JULIO_DISCLOSURE_TEXT,
      confirmationSms: JULIO_OPT_IN_CONFIRMATION_SMS,
      privacyUrl: env.JULIO_PRIVACY_URL,
      termsUrl: env.JULIO_TERMS_URL,
      consentPageUrl: env.JULIO_CONSENT_PAGE_URL,
      policyVersion: env.JULIO_POLICY_VERSION,
      messagingServiceSid: env.JULIO_TWILIO_MESSAGING_SERVICE_SID,
    };
  }
  return null;
}

function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim());
  const origin = request.headers.get("Origin") || "";
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// Strips tags/control chars and trims to a max length.
function sanitize(value, maxLen) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function isValidE164Us(phone) {
  return typeof phone === "string" && /^\+1\d{10}$/.test(phone);
}

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isRateLimited(env, ipHash) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM rate_limit_log
     WHERE ip_hash = ? AND created_at > datetime('now', ?)`
  )
    .bind(ipHash, `-${RATE_LIMIT_WINDOW_MIN} minutes`)
    .first();
  return (row?.n || 0) >= RATE_LIMIT_MAX;
}

async function sendOptInConfirmation(env, program, phoneE164) {
  if (env.SEND_OPT_IN_CONFIRMATION !== "true") return false;
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !program.messagingServiceSid) return false;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const body = new URLSearchParams({
    To: phoneE164,
    MessagingServiceSid: program.messagingServiceSid,
    Body: program.confirmationSms,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return response.ok;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const program = programConfig(url.pathname, env);
    if (!program) {
      return json({ ok: false, error: "Not found" }, 404, cors);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request body" }, 400, cors);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await hashIp(ip, env.TWILIO_AUTH_TOKEN || "blfm-sms-consent");

    // Rate limit before doing any other work.
    try {
      if (await isRateLimited(env, ipHash)) {
        return json({ ok: false, error: "Too many requests. Please try again later." }, 429, cors);
      }
      await env.DB.prepare(`INSERT INTO rate_limit_log (ip_hash) VALUES (?)`).bind(ipHash).run();
    } catch (err) {
      return json({ ok: false, error: "Server error" }, 500, cors);
    }

    // Honeypot: bots that fill this field get a fake success with nothing stored.
    if (payload && typeof payload.company_website === "string" && payload.company_website.trim() !== "") {
      return json({ ok: true }, 200, cors);
    }

    const fullName = sanitize(payload?.full_name, MAX_NAME_LEN);
    const phoneE164 = typeof payload?.phone === "string" ? payload.phone.trim() : "";
    const referenceNumber = payload?.reference_number ? sanitize(payload.reference_number, MAX_REFERENCE_LEN) : null;
    const smsConsent = payload?.sms_consent === true;

    if (!fullName) {
      return json({ ok: false, error: "Full name is required." }, 400, cors);
    }
    if (!isValidE164Us(phoneE164)) {
      return json({ ok: false, error: "A valid U.S. mobile number is required." }, 400, cors);
    }
    if (!smsConsent) {
      return json({ ok: false, error: "SMS consent must be actively selected." }, 400, cors);
    }

    const id = crypto.randomUUID();
    const consentTimestampUtc = new Date().toISOString();
    const userAgent = sanitize(request.headers.get("User-Agent") || "", 256);

    try {
      await env.DB.prepare(
        `INSERT INTO consent_records (
          id, program, full_name, phone_e164, consent_status, consent_timestamp_utc,
          page_url, disclosure_text, privacy_policy_url, terms_url, policy_version,
          reference_number, ip_hash, user_agent
        ) VALUES (?, ?, ?, ?, 'granted', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          program.id,
          fullName,
          phoneE164,
          consentTimestampUtc,
          program.consentPageUrl,
          program.disclosureText,
          program.privacyUrl,
          program.termsUrl,
          program.policyVersion,
          referenceNumber,
          ipHash,
          userAgent
        )
        .run();
    } catch (err) {
      return json({ ok: false, error: "Unable to record consent. Please try again." }, 500, cors);
    }

    // Consent is now durably recorded. Only after that do we attempt to
    // send the opt-in confirmation text — a failed send never undoes
    // the recorded consent, and we never send anything before this point.
    try {
      const sent = await sendOptInConfirmation(env, program, phoneE164);
      if (sent) {
        await env.DB.prepare(`UPDATE consent_records SET confirmation_sms_sent = 1 WHERE id = ?`).bind(id).run();
      }
    } catch {
      // Delivery failure doesn't affect the recorded consent.
    }

    return json({ ok: true }, 200, cors);
  },
};
