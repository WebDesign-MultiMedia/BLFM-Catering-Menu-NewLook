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

  let iconImg = document.querySelectorAll('menu li i.fa-image');
  iconImg.forEach(icon => {
    icon.addEventListener('click', () =>{
      let imgPop = document.querySelectorAll('menu img');
      imgPop.forEach(i => {
        i.classList.add("hidden");
        const img = icon.nextElementSibling || icon.closest('li')?.querySelector('img');
        if(img){
          img.classList.remove('hidden');
        }
      });
    })
  });

// document.querySelectorAll('menu li i.fa-image').forEach((icon) => {
//   icon.addEventListener('click', () => {
//     document.querySelectorAll('menu img').forEach(i => i.classList.add('hidden'));
//     const img = icon.nextElementSibling || icon.closest('li')?.querySelector('img');
//     if (img) img.classList.remove('hidden');
//   });
// });
