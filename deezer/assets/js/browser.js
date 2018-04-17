window.onresize = doLayout;
var isLoading = false;
var homepage = "https://www.deezer.com";
const {ipcRenderer} = require('electron')
const {remote} = require('electron');


onload = function() {
  var webview = document.querySelector('#webview');
  doLayout();

  // document.querySelector('#back').onclick = function() {
  //   webview.goBack();
  // };

  // document.querySelector('#forward').onclick = function() {
  //   webview.goForward();
  // };

  document.querySelector('#home').onclick = function() {
    navigateTo(homepage);
  };

  document.querySelector('#close').onclick = function() {
    var window = remote.getCurrentWindow();
    window.close();
  };

  // document.querySelector('#reload').onclick = function() {
  //   if (isLoading) {
  //     webview.stop();
  //   } else {
  //     webview.reload();
  //   }
  // };

  // document.querySelector('#location-form').onsubmit = function(e) {
  //   e.preventDefault();
  //   navigateTo(document.querySelector('#location').value);
  // };

  webview.addEventListener('close', handleExit);
  webview.addEventListener('did-start-loading', handleLoadStart);
  webview.addEventListener('did-stop-loading', handleLoadStop);
  webview.addEventListener('did-fail-load', handleLoadAbort);
  webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
  webview.addEventListener('did-finish-load', handleLoadCommit);
  webview.addEventListener('will-navigate', handleWillNavigate);

  // Test for the presence of the experimental <webview> zoom APIs.
  // if (typeof(webview.setZoom) == "function") {

  //   document.querySelector('#zoom').onclick = function() {
  //     if(document.querySelector('#zoom-box').style.display == '-webkit-flex') {
  //       closeZoomBox();
  //     } else {
  //       openZoomBox();
  //     }
  //   };

  //   document.querySelector('#zoom-form').onsubmit = function(e) {
  //     e.preventDefault();
  //     var zoomText = document.forms['zoom-form']['zoom-text'];
  //     var zoomFactor = Number(zoomText.value);
  //     if (zoomFactor > 5) {
  //       zoomText.value = "5";
  //       zoomFactor = 5;
  //     } else if (zoomFactor < 0.25) {
  //       zoomText.value = "0.25";
  //       zoomFactor = 0.25;
  //     }
  //     webview.setZoom(zoomFactor);
  //   }

  //   document.querySelector('#zoom-in').onclick = function(e) {
  //     e.preventDefault();
  //     increaseZoom();
  //   }

  //   document.querySelector('#zoom-out').onclick = function(e) {
  //     e.preventDefault();
  //     decreaseZoom();
  //   }

  //   window.addEventListener('keydown', handleKeyDown);
  // } else {
  //   var zoom = document.querySelector('#zoom');
  //   zoom.style.visibility = "hidden";
  //   zoom.style.position = "absolute";
  // }
};

function navigateTo(url) {
  resetExitedState();
  document.querySelector('#webview').src = url;
}

function doLayout() {
  var webview = document.querySelector('webview');
  var controls = document.querySelector('#controls');
  var controlsHeight = controls.offsetHeight;
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var webviewWidth = windowWidth;
  var webviewHeight = windowHeight - controlsHeight;

  webview.style.width = webviewWidth + 'px';
  webview.style.height = webviewHeight + 'px';

  var sadWebview = document.querySelector('#sad-webview');
  sadWebview.style.width = webviewWidth + 'px';
  sadWebview.style.height = webviewHeight * 2/3 + 'px';
  sadWebview.style.paddingTop = webviewHeight/3 + 'px';
}

function handleExit(event) {
  console.log(event.type);
  document.body.classList.add('exited');
  if (event.type == 'abnormal') {
    document.body.classList.add('crashed');
  } else if (event.type == 'killed') {
    document.body.classList.add('killed');
  }
}

function resetExitedState() {
  document.body.classList.remove('exited');
  document.body.classList.remove('crashed');
  document.body.classList.remove('killed');
}


// function handleKeyDown(event) {
//   if (event.ctrlKey) {
//     switch (event.keyCode) {

//       // Ctrl++.
//       case 107:
//       case 187:
//         event.preventDefault();
//         increaseZoom();
//         break;

//       // Ctrl+-.
//       case 109:
//       case 189:
//         event.preventDefault();
//         decreaseZoom();
//     }
//   }
// }

function handleLoadCommit() {
  resetExitedState();
  var webview = document.querySelector('#webview');
  // document.querySelector('#location').value = webview.getURL();
  // document.querySelector('#back').disabled = !webview.canGoBack();
  // document.querySelector('#forward').disabled = !webview.canGoForward();
  // closeBoxes();
}

function handleLoadStart(event) {
  document.body.classList.add('loading');
  isLoading = true;

  resetExitedState();
  if (!event.isTopLevel) {
    return;
  }

  //document.querySelector('#location').value = event.url;
}

function handleLoadStop(event) {
  document.body.classList.remove('loading');
  isLoading = false;
}

function handleLoadAbort(event) {
  console.log('LoadAbort');
  console.log('  url: ' + event.url);
  console.log('  isTopLevel: ' + event.isTopLevel);
  console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
  resetExitedState();
  //document.querySelector('#location').value = event.newUrl;
}

function handleWillNavigate(event, url) {

  // On PDF loading, we use pdf.js to display the PDF, instead
  // of the download popup dialog we get
  if(event.url.substring(event.url.length - 4) == ".pdf") {
      var webview = document.querySelector('#webview');

      // If the PDF is accessed via file://, use the locally stored pdf.js
      // otherwise use the one stored in ordissinaute.fr
      var url = event.url;
      if(url.substring(0, 7) == "file://") {
        webview.src = "file://" + __dirname + "/../../assets/vendor/pdfjs/web/viewer.html?file=" + encodeURIComponent(url)
      }
      else {
        webview.src = "https://www.ordissinaute.fr/themes/new_ordissinaute/assets/lib/pdfjs/web/viewer.html?file=" + encodeURIComponent(url) + "&t=" + new Date().getTime()
      }
  }
}

// function getNextPresetZoom(zoomFactor) {
//   var preset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
//                 2.5, 3, 4, 5];
//   var low = 0;
//   var high = preset.length - 1;
//   var mid;
//   while (high - low > 1) {
//     mid = Math.floor((high + low)/2);
//     if (preset[mid] < zoomFactor) {
//       low = mid;
//     } else if (preset[mid] > zoomFactor) {
//       high = mid;
//     } else {
//       return {low: preset[mid - 1], high: preset[mid + 1]};
//     }
//   }
//   return {low: preset[low], high: preset[high]};
// }

// function increaseZoom() {
//   var webview = document.querySelector('webview');
//   webview.getZoom(function(zoomFactor) {
//     var nextHigherZoom = getNextPresetZoom(zoomFactor).high;
//     webview.setZoom(nextHigherZoom);
//     document.forms['zoom-form']['zoom-text'].value = nextHigherZoom.toString();
//   });
// }

// function decreaseZoom() {
//   var webview = document.querySelector('webview');
//   webview.getZoom(function(zoomFactor) {
//     var nextLowerZoom = getNextPresetZoom(zoomFactor).low;
//     webview.setZoom(nextLowerZoom);
//     document.forms['zoom-form']['zoom-text'].value = nextLowerZoom.toString();
//   });
// }

// function openZoomBox() {
//   document.querySelector('webview').getZoom(function(zoomFactor) {
//     var zoomText = document.forms['zoom-form']['zoom-text'];
//     zoomText.value = Number(zoomFactor.toFixed(6)).toString();
//     document.querySelector('#zoom-box').style.display = '-webkit-flex';
//     zoomText.select();
//   });
// }

// function closeZoomBox() {
//   document.querySelector('#zoom-box').style.display = 'none';
// }

// function closeBoxes() {
//   closeZoomBox();
// }


// New homepage set by the main process
ipcRenderer.on('set-new-homepage', (event, newHomepage) => {

  console.log("Setting new homepage to : " + newHomepage);

  homepage = newHomepage;
  navigateTo(homepage);
})

