# Buffet Lucia's Fiesta Mexicana

Static site for Buffet Lucia's Fiesta Mexicana (Mexican food & catering, Bronx, NY), hosted on GitHub Pages at
[buffetluciasfiestamexicana.com](https://buffetluciasfiestamexicana.com/).

Preview build: https://webdesign-multimedia.github.io/BLFM-Catering-Menu-NewLook/

## Structure

- `home.html` — landing page (link-in-bio style)
- `index.html` — catering menu
- `cotizacion.html` — quote request form (Formspree)
- `privacy/`, `terms/` — legal pages
- `sms-consent/` — public SMS opt-in page (Twilio A2P 10DLC)
- `src/` — JS (`i18n.js`, `app.js`, `quoteForm.js`, `smsConsent.js`) and Tailwind input/output CSS
- `worker/` — Cloudflare Worker + D1 backend that records SMS consent evidence for `sms-consent/`

### Rebuilding CSS

```bash
npx tailwindcss -i src/input.css -o src/output.css --minify
```

---

## Twilio A2P Campaign Information

Reference material for Twilio's A2P 10DLC campaign registration/review of the "Buffet Lucia's Fiesta Mexicana
Receipt and Order Notifications" program.

**1. Public opt-in page URL**
https://buffetluciasfiestamexicana.com/sms-consent/

**2. Privacy Policy URL**
https://buffetluciasfiestamexicana.com/privacy/

**3. Terms and Conditions URL**
https://buffetluciasfiestamexicana.com/terms/

**4. Exact checkbox disclosure**

> I agree to receive transactional text messages from Buffet Lucia's Fiesta Mexicana regarding my food order,
> catering service, payment confirmation, receipt, or order status. Message frequency varies. Message and data
> rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not a condition of purchase.

**5. Opt-in process**

1. Customer navigates to the public, unauthenticated `/sms-consent/` page (no login, password, or account required).
2. Customer fills in **Full Name** and **Mobile Phone Number** (required), and an optional **Order or Catering
   Reference Number**.
3. Customer sees an **unchecked** SMS-consent checkbox with the exact disclosure text above, plus a separate
   link to the Privacy Policy and Terms and Conditions. Checking the box requires an affirmative click/tap — it is
   never pre-checked and is not required to submit an order elsewhere on the site.
4. On submit, client-side JS blocks the request unless the phone number is a valid U.S. mobile number and the
   consent checkbox is actively checked. The phone number is converted to E.164 (`+1XXXXXXXXXX`) before it's sent.
5. The form POSTs JSON to the Cloudflare Worker (a `*.workers.dev` URL — see "Configuring environment variables"
   below), which independently re-validates every field (never trusting the client), sanitizes input, rate-limits
   by IP, and rejects honeypot-flagged bot submissions. CORS restricts callers to `buffetluciasfiestamexicana.com`.
6. Only after the consent record is successfully written to the D1 database does the Worker optionally send a
   one-time opt-in confirmation text via Twilio — consent is recorded first, and a failed send never fabricates or
   removes a consent record.
7. The consent record stores: full name, phone in E.164, consent status, UTC timestamp, the page URL, the exact
   disclosure text shown, the Privacy Policy and Terms URLs, the policy version, and the optional reference number.
8. The customer sees: *"Thank you. Your SMS consent has been recorded. You may receive transactional messages
   concerning your food order, catering service, payment, receipt, or order status. Reply STOP at any time to
   unsubscribe."*

**6. Sample transactional messages**

> Buffet Lucia's Fiesta Mexicana: We received your payment of $[amount] for your food order on [date]. Reply STOP
> to unsubscribe or HELP for assistance.

> Buffet Lucia's Fiesta Mexicana: Your catering order for [event date] has been confirmed. Order reference:
> [reference number]. Reply STOP to unsubscribe or HELP for assistance.

**7. Testing the form**

Local static site:

```bash
python3 -m http.server 8123
# visit http://localhost:8123/sms-consent/
```

Local Worker (in a separate terminal, from `worker/`):

```bash
cd worker
npm install
npx wrangler d1 execute blfm_sms_consent --local --file=./schema.sql
npx wrangler dev   # listens on http://localhost:8787 by default
```

`src/smsConsent.js` automatically targets `http://localhost:8787/sms-consent` when the page is served from
`localhost`/`127.0.0.1`, and the production Worker URL otherwise — no manual switch needed.

Manual checks:
- Load `/sms-consent/`, confirm the checkbox renders **unchecked**.
- Try submitting with the checkbox unchecked → blocked, inline error shown, nothing sent.
- Try submitting with an invalid phone (e.g. `123`) → blocked, inline error shown.
- Submit with a valid name, valid 10-digit phone, and checkbox checked → success message appears and the row lands
  in D1:
  ```bash
  npx wrangler d1 execute blfm_sms_consent --local --command "SELECT * FROM consent_records;"
  ```
- `curl` the endpoint directly to confirm server-side validation isn't bypassable:
  ```bash
  curl -i -X POST http://localhost:8787/sms-consent \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Test User","phone":"+13476862462","sms_consent":false}'
  # expect 400 — consent must be true
  ```

**8. Configuring environment variables**

Public config lives in `worker/wrangler.toml` under `[vars]` (`ALLOWED_ORIGINS`, `PRIVACY_URL`, `TERMS_URL`,
`CONSENT_PAGE_URL`, `POLICY_VERSION`, `SEND_OPT_IN_CONFIRMATION`). Secrets are **never** committed — set them with
Wrangler, and they're only readable inside the Worker, never sent to the browser:

```bash
cd worker
npx wrangler login

# One-time setup
npx wrangler d1 create blfm_sms_consent        # paste the returned database_id into wrangler.toml
npx wrangler d1 execute blfm_sms_consent --remote --file=./schema.sql

# Secrets (values from your Twilio Console)
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_MESSAGING_SERVICE_SID

# Deploy
npx wrangler deploy
```

`wrangler deploy` prints a `*.workers.dev` URL (e.g.
`https://blfm-sms-consent.<your-account-subdomain>.workers.dev`) — no DNS or domain changes needed, since this
domain's DNS stays with its current registrar and the site stays on GitHub Pages unchanged. Copy that URL into
`PROD_ENDPOINT` in `src/smsConsent.js` (append `/sms-consent`), then redeploy the static site. Set
`SEND_OPT_IN_CONFIRMATION = "false"` in `wrangler.toml` to record consent without sending any confirmation text.


