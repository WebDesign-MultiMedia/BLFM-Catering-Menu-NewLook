// ── Mobile nav close ─────────────────────────────────────────
const details  = document.querySelector("nav details");
const closeBtn = document.getElementById("close-mobile");
if (details && closeBtn) {
  closeBtn.addEventListener("click", () => details.removeAttribute("open"));
  details.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => details.removeAttribute("open"));
  });
}

// ── Image modal ───────────────────────────────────────────────
const modal       = document.getElementById("img-modal");
const modalCard   = document.getElementById("modal-card");
const modalImg    = document.getElementById("modal-img");
const modalName   = document.getElementById("modal-name");
const modalClose  = document.getElementById("modal-close");
const modalLoader = document.getElementById("modal-loader");
const modalError  = document.getElementById("modal-error");

let lastFocused = null; // element that triggered the modal

// Returns every keyboard-focusable element inside the modal card
function getFocusable() {
  return Array.from(modalCard.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter((el) => !el.disabled && el.offsetParent !== null);
}

function showLoader() {
  modalLoader.classList.remove("hidden");
  modalError.classList.remove("visible");
  modalImg.classList.remove("loaded");
}

function openModal(src, name, triggerEl) {
  lastFocused = triggerEl || document.activeElement;

  // Reset to loading state
  showLoader();
  modalImg.src = "";
  modalName.textContent = name;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  // Start loading the image AFTER modal is visible
  modalImg.alt = name;
  modalImg.src = src;

  modalClose.focus();
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";

  // Clean up after the CSS close animation finishes
  setTimeout(() => {
    modalImg.src = "";
    showLoader();
  }, 220);

  // Return focus to the row that opened the modal
  if (lastFocused) {
    lastFocused.focus();
    lastFocused = null;
  }
}

// Image loaded OK → hide spinner, fade image in
modalImg.addEventListener("load", () => {
  modalLoader.classList.add("hidden");
  modalError.classList.remove("visible");
  modalImg.classList.add("loaded");
});

// Image failed to load → hide spinner, show error message
modalImg.addEventListener("error", () => {
  if (!modalImg.src) return; // ignore the src="" reset
  modalLoader.classList.add("hidden");
  modalError.classList.add("visible");
  modalImg.classList.remove("loaded");
});

modalClose.addEventListener("click", closeModal);

// Close on backdrop click
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Keyboard: Escape closes; Tab is trapped inside the modal
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;

  if (e.key === "Escape") {
    closeModal();
    return;
  }

  if (e.key === "Tab") {
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});

// ── Clickable menu rows ───────────────────────────────────────
document.querySelectorAll(".menu-row.has-photo").forEach((row) => {
  function activate() {
    const src  = row.dataset.img;
    const name = row.dataset.name;
    if (src && name) openModal(src, name, row);
  }

  row.addEventListener("click", activate);

  // Enter or Space fires the same action (matches native button behavior)
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  });
});
