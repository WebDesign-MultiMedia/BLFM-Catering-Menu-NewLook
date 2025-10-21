

// ===== Desktop/General list styling (kept if you still want JS-driven styles) =====
const listItems = document.querySelectorAll("menu"); // FIX: one selector
listItems.forEach((li) => {
  li.style.listStyleType = "none";
  li.style.width = "300px";
  li.style.height = "100%";
  li.style.borderBottom = "0.5px #D7263D solid";
  li.style.borderTop= "none";
  li.style.textShadow = "2px 2px 1px black"
  li.style.padding = "10px";

});

// const menuLi = document.querySelectorAll('menu li');
// menuLi.forEach(txt => {
//   txt.style.fontSize = '1.4em'
// });

// ===== Headings =====
document.querySelectorAll("h2").forEach((h2) => {
  h2.style.fontSize = "1.2em";
});

// ===== Mobile menu close button =====
const details = document.querySelector("nav details");
const closeBtn = document.getElementById("close-mobile");
if (details && closeBtn) {
  closeBtn.addEventListener("click", () => {
    details.removeAttribute("open");
  });

  // Close when clicking any link inside the mobile list
  details.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => details.removeAttribute("open"));
  });
}

// ===== Image toggle (click the image icon to show ONLY its image) =====
const imgIcons = document.querySelectorAll("menu li i.fa-image");
imgIcons.forEach(icn => {
  icn.style.color = 'white';
});
imgIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    icon.style.color =  "gray"
    // hide all first
    document.querySelectorAll("menu img").forEach((img) => img.classList.add("hidden"));

    // find the image in the same <li>
    const li = icon.closest("li");
    const img = li ? li.querySelector("img") : null;
    if (!img) return;

    // toggle visibility of this one
    img.classList.toggle("hidden");
  });
});

const imgPopupView = document.querySelectorAll('img'); // or your specific selector

imgPopupView.forEach((popup) => {
  popup.addEventListener('click', () => {
    // Check if it's already expanded
    if (!popup.classList.contains('expanded')) {
      // Expand the image
      popup.classList.add('expanded');
      popup.style.position = 'fixed';
      popup.style.left = '0';
      popup.style.top = '0';
      popup.style.width = '100%';
      popup.style.height = '100%';
      popup.style.objectFit = 'contain';
      popup.style.backgroundColor = 'rgba(0,0,0,0.9)';
      popup.style.zIndex = '50';
    } else {
      // Restore original size
      popup.classList.remove('expanded');
      popup.style = ''; // resets inline styles
    }
  });
});
