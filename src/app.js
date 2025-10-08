// Catering list
const noDotList = document.querySelectorAll("menu", "li");
noDotList.forEach((noDot) => {
  noDot.style.listStyleType = "none";
  noDot.style.width = "250px";
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

 const imgIcon = document.querySelectorAll("menu li i.fa-image");
 imgIcon.forEach(e => {
    e.addEventListener('click', ()=>{
      const imgs = document.querySelectorAll('menu img');
            const im = e.nextElementSibling || e.closest('li')?.querySelector('img');
      
      if(im && !im.classList.contains('hidden')){
        im.classList.add('hidden');
        return;
      }      
      
      imgs.forEach(i => i.classList.add('hidden'));
      if(im) im.classList.remove('hidden');
      })
 });
