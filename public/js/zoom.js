import React, { useEffect } from 'react';

function toggleFullscreen(elem) {
  elem = elem || document.documentElement;
  if (!document.fullscreenElement && !document.mozFullScreenElement &&
    !document.webkitFullscreenElement && !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

const ZoomComponent = () => {
  useEffect(() => {
    const handleMaximizeClick = () => {
      toggleFullscreen();
    };

    const buttonZoomMaximize = document.querySelector('.button-zoom-maximize');
    if (buttonZoomMaximize) {
      buttonZoomMaximize.addEventListener('click', handleMaximizeClick);
    }

    return () => {
      if (buttonZoomMaximize) {
        buttonZoomMaximize.removeEventListener('click', handleMaximizeClick);
      }
    };
  }, []); // Empty dependency array ensures it runs only once after mount

  return (
    <div>
      {/* Your component JSX here */}
      <button className="button-zoom-maximize">Maximize</button>
    </div>
  );
};

export default ZoomComponent;
