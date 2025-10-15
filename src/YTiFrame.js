// IFRAME PLAYER APi
// 2. This code loads the IFrame Player API code asynchronously.
      // var tag = document.createElement('script');

      // tag.src = "https://www.youtube.com/iframe_api";
      // var firstScriptTag = document.getElementsByTagName('script')[0];
      // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      let player;

        function welcome() {
      alert("Play");
      onYouTubeIframeAPIReady();
    }

      function onYouTubeIframeAPIReady() {

        console.log("api is loaded");
        

        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: 'LV6apeUJjSY',
          playerVars: {
            'playsinline': 1,
            'autoplay': 0,
            'controls': 1
                    },
          events: {
            'onReady': onPlayerReady,
            // 'onStateChange': onPlayerStateChange
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
        console.log("ready");
        
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = false;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(stopVideo, 60000);
          done = true;
        }
      }
      function stopVideo() {
        player.stopVideo();
      }

      // Video # Style
      let vidStyle = document.getElementById('player');
      vidStyle.style.position = 'relative';
      vidStyle.style.display = 'inline';

      vidStyle.style.zIndex = '1';
      vidStyle.style.top= '100px';

 