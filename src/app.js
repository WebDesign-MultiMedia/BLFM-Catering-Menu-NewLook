// Catering list
const noDotList = document.querySelectorAll("menu", "li");
noDotList.forEach((noDot) => {
  noDot.style.listStyleType = "none";
  noDot.style.border = "2px gold solid";
  noDot.style.borderRadius = "3%";
  noDot.style.padding = "10px";
  noDot.style.color = "gold";
});

// all Heading 2
const head2 = document.querySelectorAll("h2");
head2.forEach((h2) => {
  h2.style.color = "white";
  h2.style.fontSize = "1.2em";
});

// Image pop up when click
let imgs = document.querySelectorAll("li");
imgs.forEach((img) => {
  img.addEventListener("click", () => {
    const imga = img.querySelector("img");
    if (imga) {
      imga.classList.toggle("hidden");
    }
  });
});
