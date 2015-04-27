var PLAYING = false

chrome.browserAction.onClicked.addListener(function(){
  var player = document.getElementById('audio-player')

  if (PLAYING) {
    PLAYING = false
    chrome.browserAction.setBadgeText({text: ''})
    player.src = ''
    player.pause()
  } else {
    PLAYING = true
    chrome.browserAction.setBadgeText({text: 'play'})
    player.src = 'http://shoutmedia.abc.net.au:10326/;'
    player.play()
  }

});
