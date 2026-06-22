// ── Mobile nav close ─────────────────────────────────────────
const details = document.querySelector("nav details");
const closeBtn = document.getElementById("close-mobile");
if (details && closeBtn) {
  closeBtn.addEventListener("click", () => details.removeAttribute("open"));
  // Close when tapping any link inside the overlay
  details.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => details.removeAttribute("open"));
  });
}

// ── Image modal ───────────────────────────────────────────────
const modal     = document.getElementById("img-modal");
const modalImg  = document.getElementById("modal-img");
const modalName = document.getElementById("modal-name");
const modalClose = document.getElementById("modal-close");

function openModal(src, name) {
  modalImg.src = src;
  modalImg.alt = name;
  modalName.textContent = name;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  // Clear src after animation so it doesn't flash on next open
  setTimeout(() => { modalImg.src = ""; }, 220);
}

modalClose.addEventListener("click", closeModal);

// Close when clicking the dark backdrop (not the card itself)
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Close with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

// ── Clickable menu rows ───────────────────────────────────────
document.querySelectorAll(".menu-row.has-photo").forEach((row) => {
  function activate() {
    const src  = row.dataset.img;
    const name = row.dataset.name;
    if (src && name) openModal(src, name);
  }

  row.addEventListener("click", activate);

  // Keyboard: Enter or Space activates, matching button behaviour
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  });
});
