// ── SMS consent form (/sms-consent/) ────────────────────────────
// SMS enrollment is entirely optional (Twilio A2P 10DLC requirement —
// see Error 30923). Nothing on this page may block or require a
// mobile number/consent unless the customer has actively checked the
// consent box themselves. The "No thanks" action is a plain link
// (see sms-consent/index.html) and never touches this validation
// logic at all, so it always works regardless of field state.
//
// Validates + normalizes input client-side, then POSTs JSON to the
// Cloudflare Worker endpoint. The Worker re-validates everything
// server-side; nothing here should be trusted as the source of truth.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sms-consent-form");
  if (!form) return;

  const nameInput      = document.getElementById("sms-name");
  const phoneInput     = document.getElementById("sms-phone");
  const referenceInput = document.getElementById("sms-reference");
  const consentBox     = document.getElementById("sms-consent-checkbox");
  const consentRow     = document.getElementById("sms-consent-row");
  const honeypot       = document.getElementById("sms-website");

  const nameError  = document.getElementById("sms-name-error");
  const phoneError = document.getElementById("sms-phone-error");
  const consentHint = document.getElementById("sms-consent-hint");

  const statusBox = document.getElementById("sms-form-status");
  const submitBtn = document.getElementById("sms-submit-btn");
  const submitLabel = document.getElementById("sms-submit-label");

  // Same-origin in local dev, deployed Worker otherwise.
  const PROD_ENDPOINT = "https://blfm-sms-consent.salasjulio386.workers.dev/sms-consent";
  const ENDPOINT =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:8787/sms-consent"
      : PROD_ENDPOINT;

  function setFieldError(input, errorEl, message) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  }

  // Accepts common US formats and returns E.164 (+1XXXXXXXXXX), or null.
  function toE164(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return null;
  }

  // Never let the checkbox start (or become) checked automatically.
  consentBox.checked = false;

  // The name/phone fields only matter at all if the customer is
  // actively trying to sign up for SMS (checkbox checked). If it's
  // unchecked, nothing on this form is required and nothing is
  // validated — no error is ever shown for an unchecked checkbox.
  function validate() {
    const consentChecked = consentBox.checked === true;

    // Always clear stale errors first.
    setFieldError(nameInput, nameError, "");
    setFieldError(phoneInput, phoneError, "");
    consentHint.textContent = "";

    if (!consentChecked) {
      return { valid: false, consentChecked, name: "", e164: null };
    }

    let valid = true;

    const name = nameInput.value.trim();
    if (!name) {
      setFieldError(nameInput, nameError, "Please enter your full name.");
      valid = false;
    }

    const e164 = toE164(phoneInput.value);
    if (!e164) {
      setFieldError(phoneInput, phoneError, "Please enter a valid 10-digit U.S. mobile number.");
      valid = false;
    }

    return { valid, consentChecked, name, e164 };
  }

  // Clear errors the moment the customer unchecks the box, so nothing
  // stays flagged as invalid for fields that are no longer required.
  consentBox.addEventListener("change", () => {
    if (!consentBox.checked) {
      setFieldError(nameInput, nameError, "");
      setFieldError(phoneInput, phoneError, "");
      consentHint.textContent = "";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { valid, consentChecked, name, e164 } = validate();

    if (!consentChecked) {
      // Not a validation error — the checkbox is optional. Just draw
      // attention to it with a neutral, non-error nudge.
      consentHint.textContent = "Check the box above to sign up for SMS, or use “No thanks” to continue without it.";
      consentBox.focus();
      consentRow.classList.add("gentle-highlight");
      setTimeout(() => consentRow.classList.remove("gentle-highlight"), 1200);
      return;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Submitting…";

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          phone: e164,
          reference_number: referenceInput.value.trim() || null,
          sms_consent: true,
          company_website: honeypot.value, // must stay empty
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Request failed");
      }

      form.hidden = true;
      statusBox.hidden = false;
      statusBox.className = "form-status success";
      statusBox.textContent =
        "Thank you. Your SMS consent has been recorded. You may receive transactional messages concerning your food order, catering service, payment, receipt, or order status. Reply STOP at any time to unsubscribe.";
      statusBox.setAttribute("tabindex", "-1");
      statusBox.focus();
    } catch (err) {
      statusBox.hidden = false;
      statusBox.className = "form-status error";
      statusBox.textContent =
        "There was a problem submitting your consent. Please try again or call us directly at (347) 686-2462.";
      submitBtn.disabled = false;
      submitLabel.textContent = "Sign Up for SMS Notifications";
    }
  });
});
