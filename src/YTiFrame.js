// IFRAME PLAYER APi

      let player;


      // function onYouTubeIframeAPIReady() {

        window.onYouTubeIframeAPIReady = function () {

          const el = document.getElementById('player');
          if(!el || player) return;

          el.style.aspectRatio = '16 / 9';
          el.style.width = 'min(100%, 960px)';

         player = new YT.Player('player', {
          videoId: 'LV6apeUJjSY',
          host: 'https://www.youtube.com',
          playerVars: {
            'enablejsapi': 1,
            'origin': window.location.origin,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'autoplay': 0,
            'controls': 1
                    },
          events: {
            'onReady': () => console.log('[YT] ready'),
             
            // onPlayerReady,
            'onStateChange': (e) => console.log('[YT] state', e.data)
            
          }
        });
        }

       
      // }

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
          setTimeout(stopVideo, 100000);
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

 