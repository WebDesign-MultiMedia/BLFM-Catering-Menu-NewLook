// Cloudflare Worker: records SMS consent evidence for Buffet Lucia's Fiesta
// Mexicana's A2P 10DLC program:
//   POST /sms-consent         — "SMS Notifications and Specials" (BLFM brand,
//                                BLFM's own Twilio account)
//
// Two-checkbox design for /sms-consent: BLFM's single A2P campaign covers
// both order/receipt texts AND promotional specials, but each is a
// separate, independent opt-in on the page (order_consent and
// specials_consent). We record one consent_records row per sub-program the
// customer actually checked, each with that checkbox's exact disclosure
// text, so the evidence shows precisely what they agreed to. At least one
// must be true. Only one opt-in confirmation SMS is sent per sign-up.
//
// Nothing here trusts client-side validation — every field is re-checked.
// Twilio/D1 credentials are Worker secrets and are never sent to the browser.

const RATE_LIMIT_MAX = 5; // max submissions per IP per window
const RATE_LIMIT_WINDOW_MIN = 60;
const MAX_NAME_LEN = 100;
const MAX_REFERENCE_LEN = 64;

// Must match the checkbox labels on /sms-consent/ word for word.
const BLFM_ORDER_DISCLOSURE_TEXT =
  "I agree to receive transactional text messages from Buffet Lucia's Fiesta Mexicana regarding my food order, " +
  "catering service, payment confirmation, receipt, or order status. Message frequency varies. Message and data " +
  "rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not a condition of purchase.";

const BLFM_SPECIALS_DISCLOSURE_TEXT =
  "I agree to receive promotional text messages from Buffet Lucia's Fiesta Mexicana about weekend specials, " +
  "menu updates, catering availability, and events. Message frequency varies, up to 4 messages per month. " +
  "Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not a " +
  "condition of purchase.";

// Must match the campaign's registered Opt-in Message exactly.
const BLFM_OPT_IN_CONFIRMATION_SMS =
  "Buffet Lucia's Fiesta Mexicana: You're signed up for texts from us! Msg frequency varies. Msg & data rates " +
  "may apply. Reply HELP for help, STOP to unsubscribe.";

// Per-program configuration. Each program is fully self-contained: its own
// disclosure text, its own Privacy/Terms/consent-page URLs (read from env
// so they're not hardcoded twice), and its own optional Twilio Messaging
// Service SID env var — so a confirmation text can never be sent under the
// wrong registered campaign.
function programConfig(pathname, env) {
  if (pathname === "/sms-consent") {
    return {
      id: "blfm",
      // One row is recorded per sub-program the customer checked.
      subPrograms: [
        { id: "blfm_receipt_notifications", field: "order_consent", disclosureText: BLFM_ORDER_DISCLOSURE_TEXT },
        { id: "blfm_specials", field: "specials_consent", disclosureText: BLFM_SPECIALS_DISCLOSURE_TEXT },
      ],
      confirmationSms: BLFM_OPT_IN_CONFIRMATION_SMS,
      privacyUrl: env.PRIVACY_URL,
      termsUrl: env.TERMS_URL,
      consentPageUrl: env.CONSENT_PAGE_URL,
      policyVersion: env.POLICY_VERSION,
      // BLFM has its own Twilio account, separate from the shared one.
      twilioAccountSid: env.BLFM_TWILIO_ACCOUNT_SID,
      twilioAuthToken: env.BLFM_TWILIO_AUTH_TOKEN,
      messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
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
  if (!program.twilioAccountSid || !program.twilioAuthToken || !program.messagingServiceSid) return false;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${program.twilioAccountSid}/Messages.json`;
  const auth = btoa(`${program.twilioAccountSid}:${program.twilioAuthToken}`);
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

// HMAC-SHA256 as hex, used to sign the Google Sheet copy of each sign-up.
async function hmacHex(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Copies a BLFM sign-up into the "SMSSignups" tab of the orders Google Sheet
// (via SheetDB) so the owner can see the list and the POS broadcast can read
// it. D1 stays the authoritative consent record; this is a convenience copy.
//
// Anyone with the sheet open could type a row in by hand, so each row carries
// a Signature (HMAC of ConsentId|phone|Specials with SIGNUP_SIGNING_KEY, a
// secret shared with the POS). The broadcast skips rows whose signature
// doesn't verify, so only form sign-ups ever get texted.
//
// The phone is written as (347) 555-0100 rather than +1… because Sheets would
// turn a leading + into a number.
async function copySignupToSheet(env, { consentId, fullName, phoneE164, referenceNumber, orders, specials, timestamp }) {
  if (!env.SHEETDB_ID || !env.SIGNUP_SIGNING_KEY) return false;

  const digits = phoneE164.slice(2);
  const phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  const specialsValue = specials ? "Yes" : "No";
  const signature = await hmacHex(env.SIGNUP_SIGNING_KEY, `${consentId}|${phoneE164}|${specialsValue}`);

  const headers = { "Content-Type": "application/json" };
  if (env.SHEETDB_USER && env.SHEETDB_PASS) {
    headers.Authorization = `Basic ${btoa(`${env.SHEETDB_USER}:${env.SHEETDB_PASS}`)}`;
  }
  const response = await fetch(`https://sheetdb.io/api/v1/${encodeURIComponent(env.SHEETDB_ID)}?sheet=SMSSignups`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: [
        {
          Date: timestamp,
          Name: fullName,
          Phone: phone,
          Reference: referenceNumber || "",
          Orders: orders ? "Yes" : "No",
          Specials: specialsValue,
          ConsentId: consentId,
          Signature: signature,
        },
      ],
    }),
  });
  return response.ok;
}

// Emails the owner when someone signs up on /sms-consent, so they don't have
// to keep checking the sheet. Off unless RESEND_API_KEY (secret) and
// SIGNUP_ALERT_TO (var) are set. Plain-text only, and it carries just the
// first name, last 4 phone digits and what they opted into; the full row is
// in the sheet's SMSSignups tab. Never affects the recorded consent.
async function sendSignupAlert(env, { fullName, phoneE164, orders, specials, timestamp }) {
  if (!env.RESEND_API_KEY || !env.SIGNUP_ALERT_TO) return false;

  const firstName = fullName.split(/\s+/)[0] || "Someone";
  const last4 = phoneE164.slice(-4);
  const optedInto = [specials && "weekend specials", orders && "order texts"].filter(Boolean).join(" and ");
  const when = new Date(timestamp).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.SIGNUP_ALERT_FROM || "BLFM Sign-ups <onboarding@resend.dev>",
      to: env.SIGNUP_ALERT_TO.split(",").map((a) => a.trim()).filter(Boolean),
      subject: `New SMS sign-up: ${firstName} (…${last4})`,
      text:
        `${firstName} (phone ending ${last4}) signed up for ${optedInto} on ${when}.\n\n` +
        `Full details are in the SMSSignups tab of the orders sheet. ` +
        `The POS "Text Customers" page shows the current number of subscribers.`,
    }),
  });
  return response.ok;
}

export default {
  async fetch(request, env, ctx) {
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
    // Only an explicit boolean `true` counts as consent for a sub-program.
    const consented = program.subPrograms.filter((sp) => payload?.[sp.field] === true);

    if (!fullName) {
      return json({ ok: false, error: "Full name is required." }, 400, cors);
    }
    if (!isValidE164Us(phoneE164)) {
      return json({ ok: false, error: "A valid U.S. mobile number is required." }, 400, cors);
    }
    if (consented.length === 0) {
      return json({ ok: false, error: "SMS consent must be actively selected." }, 400, cors);
    }

    const ids = consented.map(() => crypto.randomUUID());
    const consentTimestampUtc = new Date().toISOString();
    const userAgent = sanitize(request.headers.get("User-Agent") || "", 256);

    try {
      const insert = env.DB.prepare(
        `INSERT INTO consent_records (
          id, program, full_name, phone_e164, consent_status, consent_timestamp_utc,
          page_url, disclosure_text, privacy_policy_url, terms_url, policy_version,
          reference_number, ip_hash, user_agent
        ) VALUES (?, ?, ?, ?, 'granted', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      // One row per sub-program consented to, written atomically.
      await env.DB.batch(
        consented.map((sp, i) =>
          insert.bind(
            ids[i],
            sp.id,
            fullName,
            phoneE164,
            consentTimestampUtc,
            program.consentPageUrl,
            sp.disclosureText,
            program.privacyUrl,
            program.termsUrl,
            program.policyVersion,
            referenceNumber,
            ipHash,
            userAgent
          )
        )
      );
    } catch (err) {
      return json({ ok: false, error: "Unable to record consent. Please try again." }, 500, cors);
    }

    // Consent is now durably recorded. Only after that do we attempt to
    // send the opt-in confirmation text — a failed send never undoes
    // the recorded consent, and we never send anything before this point.
    // Exactly one confirmation SMS per sign-up, even if both boxes were checked.
    try {
      const sent = await sendOptInConfirmation(env, program, phoneE164);
      if (sent) {
        await env.DB.batch(
          ids.map((rowId) =>
            env.DB.prepare(`UPDATE consent_records SET confirmation_sms_sent = 1 WHERE id = ?`).bind(rowId)
          )
        );
      }
    } catch {
      // Delivery failure doesn't affect the recorded consent.
    }

    if (program.id === "blfm") {
      try {
        const ok = await copySignupToSheet(env, {
          consentId: ids[0],
          fullName,
          phoneE164,
          referenceNumber,
          orders: consented.some((sp) => sp.id === "blfm_receipt_notifications"),
          specials: consented.some((sp) => sp.id === "blfm_specials"),
          timestamp: consentTimestampUtc,
        });
        if (!ok) console.error("sms-consent: Google Sheet copy was not written");
      } catch (err) {
        // The sheet is only a copy; consent is already recorded in D1.
        console.error("sms-consent: Google Sheet copy failed", err);
      }

      // Owner alert runs after the response is sent (waitUntil), so a slow
      // or failed email never delays or breaks the customer's sign-up.
      const alert = sendSignupAlert(env, {
        fullName,
        phoneE164,
        orders: consented.some((sp) => sp.id === "blfm_receipt_notifications"),
        specials: consented.some((sp) => sp.id === "blfm_specials"),
        timestamp: consentTimestampUtc,
      })
        .then((ok) => {
          if (!ok && env.RESEND_API_KEY && env.SIGNUP_ALERT_TO) console.error("sms-consent: sign-up alert email was not sent");
        })
        .catch((err) => console.error("sms-consent: sign-up alert failed", err));
      if (ctx?.waitUntil) ctx.waitUntil(alert);
      else await alert;
    }

    return json({ ok: true }, 200, cors);
  },
};
