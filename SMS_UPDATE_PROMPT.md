# Task: Update BLFM's existing SMS pages to cover promotional texts (for a new Twilio A2P campaign)

## Context
This repo is the Buffet Lucia's Fiesta Mexicana (BLFM) website, served on GitHub Pages at https://buffetluciasfiestamexicana.com (CNAME). It has a Cloudflare Worker in `worker/` (D1 database `blfm_sms_consent`) that records SMS consent per program. The form at `/sms-consent/` posts to `https://blfm-sms-consent.salasjulio386.workers.dev/sms-consent` via `src/smsConsent.js`.

BLFM is registering a **new Twilio A2P 10DLC Sole Proprietor campaign** in BLFM's **own new Twilio account**. The campaign covers BOTH order/receipt texts AND promotional texts (weekend specials, menu updates, catering availability, events). Twilio reviewers will visit these three URLs, so they must accurately describe both kinds of messages:
- https://buffetluciasfiestamexicana.com/sms-consent/
- https://buffetluciasfiestamexicana.com/privacy/
- https://buffetluciasfiestamexicana.com/terms/

Right now those pages say "no marketing or promotional messages are sent." That must change.

The campaign form has already been filled in with the exact checkbox wording below, so **the two checkbox texts must match word for word**.

## Step 0: Clean up the previous attempt (uncommitted, never pushed)
A previous session left **uncommitted** changes adding a separate "SMS Specials" program. Run `git status`, confirm these are uncommitted, then remove them:
- Delete the directories `sms-specials/`, `sms-specials-privacy/`, `sms-specials-terms/` and the file `src/smsSpecialsConsent.js`.
- Revert the uncommitted edits in `home.html`, `index.html`, `privacy/index.html`, `terms/index.html`, `sms-consent/index.html`, `sitemap.xml`, `worker/src/index.js`, `worker/wrangler.toml` (`git restore <files>`).
- Leave this prompt file (`SMS_UPDATE_PROMPT.md`) alone during the work, and don't commit it.
Show me `git status` before and after. Do not touch anything that was already committed.

## Step 1: `/sms-consent/` becomes one BLFM SMS program with TWO separate checkboxes
Keep the existing design, layout, honeypot, "No thanks — continue without SMS" link, and the optional-enrollment behavior (fix for Twilio Error 30923). Changes:
- Page title, meta description and hero: "SMS Notifications and Specials". The intro explains there are two optional kinds of texts and customers choose either, both, or neither.
- Update the purpose list to show both groups: order texts (food orders, catering, payment confirmations, receipts, order status) and specials (weekend specials, new menu items, catering and party trays, events).
- **Two separate checkboxes, both unchecked by default and never auto-checked:**
  1. Order texts, keeping the current wording exactly:
     "I agree to receive transactional text messages from Buffet Lucia's Fiesta Mexicana regarding my food order, catering service, payment confirmation, receipt, or order status. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not a condition of purchase."
  2. Specials, new, use this exact wording:
     "I agree to receive promotional text messages from Buffet Lucia's Fiesta Mexicana about weekend specials, menu updates, catering availability, and events. Message frequency varies, up to 4 messages per month. Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not a condition of purchase."
- Name and phone are required only if at least one box is checked. If neither is checked, show the existing neutral nudge, not an error.
- The submit button reads "Sign Up for SMS". The success message reflects which program(s) they joined.
- Keep the Privacy Policy and Terms links under the checkboxes, and the "optional, not required to purchase" note.
- Update `src/smsConsent.js` to send `order_consent: true/false` and `specials_consent: true/false` instead of the single `sms_consent`.

## Step 2: `/privacy/`
- Intro and "Information We Collect": mention both order texts and promotional texts.
- "Why We Collect This Information": remove "We do not use your information for marketing or promotional purposes." Replace it with: promotional texts are sent **only** to customers who separately check the specials checkbox; order and catering details are never used to send marketing without that opt-in.
- **Keep the "Information Sharing" section's two bold non-sharing statements exactly as they are.** They're the TCR-required language.
- Rename the section "SMS Receipt and Order Notifications" to "SMS Program" and describe both message types: order texts (frequency varies) and specials (up to 4 per month), with **STOP**/**HELP** in bold, rates may apply, consent not a condition of purchase, and a link to `/sms-consent/`.
- Update "Last updated" to November 2026.

## Step 3: `/terms/`
- Program Name: "Buffet Lucia's Fiesta Mexicana SMS Notifications and Specials"
- Program Description: both message types, each requiring its own separate opt-in checkbox. Remove "No marketing or promotional messages are sent."
- Message Frequency: order texts vary with order activity; specials up to 4 messages per month.
- Opt-Out and Help: **STOP** and **HELP** in bold. Replying STOP stops all texts from this number.
- Add a "Carrier Liability" section: "Mobile carriers are not liable for delayed or undelivered messages."
- Keep: Message and Data Rates, Consent Is Not a Condition of Purchase, Support Contact (buffetluciasfiestamexicana@gmail.com, (347) 686-2462), Privacy link, Changes to These Terms.
- Update "Last updated" to November 2026, and fix the canonical URL to `https://buffetluciasfiestamexicana.com/terms/` (it's currently missing the trailing slash).

## Phone number
Use **(347) 686-2462** (`tel:+13476862462`), the number already on the site, for all support/contact wording. Don't introduce any other phone number.

## Step 4: Worker (`worker/src/index.js`, `worker/wrangler.toml`)
- `/sms-consent` now accepts `order_consent` and `specials_consent` booleans. At least one must be `true`; reject otherwise. Re-validate everything server-side as it already does.
- Insert **one `consent_records` row per program consented to**: `blfm_receipt_notifications` with the order disclosure text, and a new program id `blfm_specials` with the specials disclosure text. Both use the `/sms-consent/`, `/privacy/`, `/terms/` URLs. Bump `POLICY_VERSION` to `2026-11-02`.
- Send **one** opt-in confirmation SMS after recording. It must match the Opt-in Message in the campaign exactly:
  "Buffet Lucia's Fiesta Mexicana: You're signed up for texts from us! Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to unsubscribe."
- BLFM now has its **own Twilio account**, separate from the shared one Julio Salas SMS Testing uses. Add per-program credentials: the BLFM program uses new secrets `BLFM_TWILIO_ACCOUNT_SID` and `BLFM_TWILIO_AUTH_TOKEN` plus the existing `TWILIO_MESSAGING_SERVICE_SID` name for BLFM's Messaging Service. The julio program keeps the existing shared `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`. If BLFM's secrets aren't set, consent still records and no SMS is sent. Document the new secrets in the comment block in `wrangler.toml`.
- Do **not** change the `/julio-sms-consent` route's behavior.
- Add a short comment explaining the two-checkbox design.

## Do NOT change
- `julio-sms-consent/`, `julio-sms-privacy/`, `julio-sms-terms/`, `src/julioSmsConsent.js` (a separate, already-approved campaign).
- Site styling, nav, i18n, footer, Call buttons, and anything unrelated to SMS.

## Verify
- Serve the site locally (`python3 -m http.server`) and confirm all three pages load. Check that both checkboxes start unchecked, the form submits with only one box checked, and nothing on the three pages still says "no marketing" or "do not use your information for marketing."
- Run `node --check` on the changed JS files.
- If possible, run `wrangler dev` with a local D1 and POST a test submission to confirm one row is written per program checked.
- Show me the final wording of both checkboxes and a `git diff --stat`.

**Don't commit, push, or run `wrangler deploy` until I approve.** After approval: commit (without `SMS_UPDATE_PROMPT.md`), push to `main` (GitHub Pages deploys), then run `wrangler deploy` from `worker/`.
