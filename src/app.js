// ── Mobile nav close ─────────────────────────────────────────
const details  = document.querySelector("nav details");
const closeBtn = document.getElementById("close-mobile");
if (details && closeBtn) {
  closeBtn.addEventListener("click", () => details.removeAttribute("open"));
  details.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => details.removeAttribute("open"));
  });
}

// Returns every keyboard-focusable element inside a container
function getFocusableIn(container) {
  return Array.from(container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter((el) => !el.disabled && el.offsetParent !== null);
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

// ── Quote options modal (Texto / Llamar / Correo) ───────────────
const quoteModal      = document.getElementById("quote-modal");
const quoteModalCard  = document.getElementById("quote-modal-card");
const quoteModalClose = document.getElementById("quote-modal-close");

let quoteLastFocused = null;

function openQuoteModal(triggerEl) {
  quoteLastFocused = triggerEl || document.activeElement;
  quoteModal.classList.add("open");
  document.body.style.overflow = "hidden";
  quoteModalClose.focus();
}

function closeQuoteModal() {
  quoteModal.classList.remove("open");
  document.body.style.overflow = "";
  if (quoteLastFocused) {
    quoteLastFocused.focus();
    quoteLastFocused = null;
  }
}

document.querySelectorAll(".quote-trigger").forEach((btn) => {
  btn.addEventListener("click", () => openQuoteModal(btn));
});

quoteModalClose.addEventListener("click", closeQuoteModal);

// Close on backdrop click
quoteModal.addEventListener("click", (e) => {
  if (e.target === quoteModal) closeQuoteModal();
});

// Keyboard: Escape closes; Tab is trapped inside whichever modal is open
document.addEventListener("keydown", (e) => {
  const isImgOpen   = modal.classList.contains("open");
  const isQuoteOpen = quoteModal.classList.contains("open");
  if (!isImgOpen && !isQuoteOpen) return;

  const closeFn = isImgOpen ? closeModal : closeQuoteModal;
  const cardEl  = isImgOpen ? modalCard : quoteModalCard;

  if (e.key === "Escape") {
    closeFn();
    return;
  }

  if (e.key === "Tab") {
    const focusable = getFocusableIn(cardEl);
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

// ── Catering gallery: lightbox on tap ────────────────────────────
document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const src  = item.dataset.img;
    const name = item.dataset.name;
    if (src && name) openModal(src, name, item);
  });
});

// ── Catering gallery: slide carousel ─────────────────────────────
const galleryTrack   = document.getElementById("gallery-track");
const galleryDotsBox = document.getElementById("gallery-dots");
const galleryCounter = document.getElementById("gallery-counter");
const galleryPrevBtn = document.querySelector(".gallery-arrow-prev");
const galleryNextBtn = document.querySelector(".gallery-arrow-next");

if (galleryTrack) {
  const slides = Array.from(galleryTrack.children);
  const total  = slides.length;
  let current  = 0;
  let autoplayTimer = null;

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Photo ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i, true));
    galleryDotsBox.appendChild(dot);
  });
  const dots = Array.from(galleryDotsBox.children);

  function render() {
    galleryTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.setAttribute("aria-current", i === current ? "true" : "false"));
    galleryCounter.textContent = `${current + 1} / ${total}`;
  }

  function goToSlide(index, userInitiated) {
    current = (index + total) % total;
    render();
    if (userInitiated) restartAutoplay();
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goToSlide(current + 1, false), 5000);
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  galleryPrevBtn.addEventListener("click", () => goToSlide(current - 1, true));
  galleryNextBtn.addEventListener("click", () => goToSlide(current + 1, true));

  // Pause autoplay while the user is interacting with the slider
  const slider = galleryTrack.closest(".gallery-slider");
  slider.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
  slider.addEventListener("mouseleave", startAutoplay);

  render();
  startAutoplay();
}
