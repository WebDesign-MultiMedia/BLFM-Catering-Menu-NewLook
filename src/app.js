

// ===== Desktop/General list styling (kept if you still want JS-driven styles) =====
const listItems = document.querySelectorAll("menu"); // FIX: one selector
listItems.forEach((li) => {
  // If you prefer Tailwind, remove these styles and keep the Tailwind classes in HTML.
  li.style.listStyleType = "none";
  li.style.width = "250px";
  li.style.borderBottom = "1px white solid";
  li.style.borderRadius = "50px";
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
imgIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    icon.style.color =  "#D7263D"
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



// IFRAME PLAYER APi
// 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: 'M7lc1UVf-VE',
          playerVars: {
            'playsinline': 1
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = false;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(stopVideo, 6000);
          done = true;
        }
      }
      function stopVideo() {
        player.stopVideo();
      }