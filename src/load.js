
// const YTvids = document.getElementById('player');
const mainEL = document.querySelector('main');

    // Element Hidden
// YTvids.style.visibility = 'hidden';
mainEL.style.visibility = 'hidden';

    // Show popup agyer 2 seconds
      setTimeout(() => {
            showEventAlert();

         // Reveal the elements after 5 seconds 
           setTimeout(() => {
            // YTvids.style.visibility = 'visible';
            mainEL.style.visibility = 'visible';
          }, 5000);
        }, 0000);
    
  