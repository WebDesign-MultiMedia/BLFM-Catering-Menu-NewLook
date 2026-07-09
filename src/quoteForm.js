document.addEventListener("DOMContentLoaded", () => {
  const form       = document.getElementById("quote-form");
  const statusBox  = document.getElementById("form-status");
  const submitBtn  = document.getElementById("form-submit-btn");
  if (!form) return;

  const submitLabel = submitBtn.querySelector("span");

  // ── Dish picker: tap a dish to add/remove it from the quote ──────
  const selectedDishesInput = document.getElementById("qf-selected-dishes");
  const selectedSummary     = document.getElementById("qf-selected-summary");
  const selectedDishes      = [];

  function renderSelectedSummary() {
    const lang = localStorage.getItem("blfm-lang") || "es";
    const dict = translations[lang] || translations.es;

    selectedDishesInput.value = selectedDishes.join(", ");

    if (selectedDishes.length === 0) {
      selectedSummary.textContent = dict.formDishesNone;
      return;
    }

    const label = dict.formDishesSelected.replace("{count}", selectedDishes.length);
    selectedSummary.textContent = `${label}: ${selectedDishes.join(", ")}`;
  }

  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

  function toggleChip(chip) {
    const dish = chip.dataset.dish;
    const index = selectedDishes.indexOf(dish);

    if (index === -1) {
      selectedDishes.push(dish);
      chip.classList.add("selected");
    } else {
      selectedDishes.splice(index, 1);
      chip.classList.remove("selected");
    }

    renderSelectedSummary();
  }

  // ── Desktop: hover a dish to see a quick photo preview ────────────
  const hoverPreview    = document.getElementById("dish-hover-preview");
  const hoverPreviewImg = document.getElementById("dish-hover-preview-img");
  const hoverPreviewName = document.getElementById("dish-hover-preview-name");

  function showHoverPreview(chip) {
    const img = chip.dataset.img;
    if (!img || !isDesktop()) return;

    hoverPreviewImg.src = img;
    hoverPreviewImg.alt = chip.dataset.dish;
    hoverPreviewName.textContent = chip.dataset.dish;

    const rect = hoverPreview.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const width = 200; // matches .dish-hover-preview width
    let left = chipRect.left + chipRect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = chipRect.top - rect.height - 10;
    if (top < 8) top = chipRect.bottom + 10;

    hoverPreview.style.left = `${left}px`;
    hoverPreview.style.top = `${top}px`;
    hoverPreview.classList.add("visible");
  }

  function hideHoverPreview() {
    hoverPreview.classList.remove("visible");
  }

  // ── Mobile/tablet: tap a dish to preview it, then confirm add/remove ──
  const dishModal       = document.getElementById("dish-modal");
  const dishModalImg    = document.getElementById("dish-modal-img");
  const dishModalName   = document.getElementById("dish-modal-name");
  const dishModalAddBtn = document.getElementById("dish-modal-add");
  const dishModalCancelBtn = document.getElementById("dish-modal-cancel");
  let pendingChip = null;

  function openDishModal(chip) {
    const lang = localStorage.getItem("blfm-lang") || "es";
    const dict = translations[lang] || translations.es;

    pendingChip = chip;
    dishModalImg.src = chip.dataset.img;
    dishModalImg.alt = chip.dataset.dish;
    dishModalName.textContent = chip.dataset.dish;

    const alreadySelected = chip.classList.contains("selected");
    dishModalAddBtn.textContent = alreadySelected ? dict.dishModalRemove : dict.dishModalAdd;
    dishModalAddBtn.classList.toggle("dish-modal-btn--add", !alreadySelected);
    dishModalAddBtn.classList.toggle("dish-modal-btn--remove", alreadySelected);

    dishModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDishModal() {
    dishModal.classList.remove("open");
    document.body.style.overflow = "";
    pendingChip = null;
  }

  dishModalAddBtn.addEventListener("click", () => {
    if (pendingChip) toggleChip(pendingChip);
    closeDishModal();
  });

  dishModalCancelBtn.addEventListener("click", closeDishModal);

  dishModal.addEventListener("click", (e) => {
    if (e.target === dishModal) closeDishModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dishModal.classList.contains("open")) closeDishModal();
  });

  // ── Wire up each chip ──────────────────────────────────────────────
  document.querySelectorAll(".dish-chip").forEach((chip) => {
    chip.addEventListener("mouseenter", () => showHoverPreview(chip));
    chip.addEventListener("mouseleave", hideHoverPreview);

    chip.addEventListener("click", () => {
      if (!isDesktop() && chip.dataset.img) {
        openDishModal(chip);
      } else {
        toggleChip(chip);
      }
    });
  });

  if (selectedSummary) {
    renderSelectedSummary();
    // Re-render on language toggle so a live selection isn't clobbered
    // by i18n.js resetting every data-i18n element.
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", renderSelectedSummary);
    });
  }

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
