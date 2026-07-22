# Buffet Lucia's Fiesta Mexicana

Static site for Buffet Lucia's Fiesta Mexicana (Mexican food & catering, Bronx, NY), hosted on GitHub Pages at
[buffetluciasfiestamexicana.com](https://buffetluciasfiestamexicana.com/).

Preview build: https://webdesign-multimedia.github.io/BLFM-Catering-Menu-NewLook/

## Structure

- `home.html` — landing page (link-in-bio style)
- `index.html` — catering menu
- `cotizacion.html` — quote request form (Formspree)
- `privacy/`, `terms/` — legal pages for the BLFM "Receipt and Order Notifications" SMS program
- `sms-consent/` — public SMS opt-in page for BLFM (Twilio A2P 10DLC)
- `julio-sms-consent/`, `julio-sms-privacy/`, `julio-sms-terms/` — public pages for the separate, personal
  "Julio Salas SMS Testing" A2P 10DLC brand/campaign (unrelated to BLFM as the registered sender)
- `src/` — JS (`i18n.js`, `app.js`, `quoteForm.js`, `smsConsent.js`, `julioSmsConsent.js`) and Tailwind input/output CSS
- `worker/` — Cloudflare Worker + D1 backend that records consent evidence for both `/sms-consent` and
  `/julio-sms-consent`, each with its own disclosure text and (optionally) its own Twilio Messaging Service SID

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

---

## Twilio A2P 10DLC — Julio Salas SMS Testing

This is a **separate program from BLFM's**, registered under the personal Sole Proprietor Twilio Brand "Julio
Salas," not under BLFM as a business. The public pages are hosted on this same site but never identify BLFM as the
SMS sender or registered Brand — every page states that Julio Salas personally operates this software-testing
program.

**Consent:** https://buffetluciasfiestamexicana.com/julio-sms-consent/
**Privacy:** https://buffetluciasfiestamexicana.com/julio-sms-privacy/
**Terms:** https://buffetluciasfiestamexicana.com/julio-sms-terms/

**Campaign description**

> Julio Salas uses this campaign to send low-volume transactional SMS notifications for personal
> software-development testing. Messages are sent only to users who voluntarily opt in through a publicly
> accessible consent form. Messages may include test food-order confirmations, catering-request confirmations,
> test payment and receipt notifications, and application-status updates. No advertising, marketing, promotional,
> sales, or third-party messages are sent through this campaign.

**Sample message 1**

> Julio Salas SMS Testing: Your test food-order payment of $[amount] was recorded on [date]. Reply STOP to opt out
> or HELP for assistance.

**Sample message 2**

> Julio Salas SMS Testing: Your test catering request for [event date] was received. Reference: [reference
> number]. Reply STOP to opt out or HELP for assistance.

**Message flow / call to action**

> End users voluntarily enroll through the publicly accessible SMS consent form at
> https://buffetluciasfiestamexicana.com/julio-sms-consent/.
>
> Julio Salas operates this personal software-testing SMS program. Enrollment is completely optional and is not
> required to access the website, make a purchase, submit an inquiry, complete a transaction, or use available
> services.
>
> To enroll, the user voluntarily enters a mobile phone number and actively selects a separate SMS consent
> checkbox that is unchecked by default. The mobile phone number is only required after the user chooses to
> enroll.
>
> The checkbox states: "I agree to receive low-volume transactional software-test text messages from Julio Salas
> regarding test food orders, catering requests, payment confirmations, receipt notifications, and
> application-status updates. Message frequency varies. Message and data rates may apply. Reply STOP to
> unsubscribe or HELP for assistance. Consent is not a condition of purchase."
>
> Users who do not want text messages may select "No thanks — continue without SMS" and continue using the
> website without entering a mobile number or providing messaging consent.
>
> No SMS is sent and no SMS consent record is created unless the user voluntarily selects the checkbox and
> submits the SMS enrollment form.
>
> Privacy Policy: https://buffetluciasfiestamexicana.com/julio-sms-privacy/
> Terms and Conditions: https://buffetluciasfiestamexicana.com/julio-sms-terms/

**Keyword opt-in:** website-form opt-in only. Leave Twilio's Opt-in Keywords and Opt-in Message fields blank when
submitting this campaign — there is no START/YES/JOIN/SUBSCRIBE keyword flow implemented or documented.

**Backend:** shares the same Worker and D1 database as BLFM's program (see above), routed separately at
`POST /julio-sms-consent`. It uses its own disclosure text, its own Privacy/Terms/consent-page URLs
(`JULIO_PRIVACY_URL`, `JULIO_TERMS_URL`, `JULIO_CONSENT_PAGE_URL` in `worker/wrangler.toml`), and — once Julio's
Messaging Service SID is approved — its own `JULIO_TWILIO_MESSAGING_SERVICE_SID` secret, so a confirmation text is
never sent under the wrong registered campaign:

```bash
cd worker
npx wrangler secret put JULIO_TWILIO_MESSAGING_SERVICE_SID
npx wrangler deploy
```

Until that secret is set, consent still records normally for this program — the Worker just skips sending a
confirmation text.

Approval is not guaranteed by any of the above; this only documents what the program actually does and how to
verify it.

