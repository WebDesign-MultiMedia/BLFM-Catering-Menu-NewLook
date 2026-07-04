document.addEventListener("DOMContentLoaded", () => {
  const form       = document.getElementById("quote-form");
  const statusBox  = document.getElementById("form-status");
  const submitBtn  = document.getElementById("form-submit-btn");
  if (!form) return;

  const submitLabel = submitBtn.querySelector("span");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const lang = localStorage.getItem("blfm-lang") || "es";
    const dict = translations[lang] || translations.es;

    submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = dict.formSubmitting;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Request failed");

      form.hidden = true;
      statusBox.hidden = false;
      statusBox.className = "form-status success";
      statusBox.textContent = dict.formSuccessBody;
    } catch (err) {
      statusBox.hidden = false;
      statusBox.className = "form-status error";
      statusBox.textContent = dict.formErrorBody;
      submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = dict.formSubmit;
    }
  });
});
