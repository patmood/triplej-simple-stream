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
    player.src = 'http://live-radio01.mediahubaustralia.com/2TJW/mp3/;'
    player.play()
  }

});
