var PLAYING = false;
var CONTROL_TIME = 350; // Max time between click events occurrence;
var INFO_URL = 'https://music.abcradio.net.au/api/v1/plays/triplej/now.json';
var STREAM_URL = 'http://live-radio01.mediahubaustralia.com/2TJW/mp3/;';

/* http://stackoverflow.com/a/32515512/ */
var OnDoubleClickListener = function(config){
		//Set click to false at beginning
		var alreadyClicked = false;
		var timer;

		if(config && config.onDoubleClick instanceof Function)
		return function(tab) {

				//Check for previous click
				if (alreadyClicked) {
						//Yes, Previous Click Detected

						//Clear timer already set in earlier Click
						clearTimeout(timer);

						//Clear all Clicks
						alreadyClicked = false;

						return config.onDoubleClick.apply(config.onDoubleClick,[tab]);
				}

				//Set Click to  true
				alreadyClicked = true;

				//Add a timer to detect next click to a sample of 250
				timer = setTimeout(function () {
						//Clear all timers
						clearTimeout(timer);
						config.onSingleClick.apply(config.onSingleClick,[tab]);
						//Ignore clicks
						alreadyClicked = false;
				}, CONTROL_TIME);
		};
		throw new Error("[InvalidArgumentException]");
};

chrome.browserAction.onClicked.addListener(new OnDoubleClickListener({
		onDoubleClick: function(tab) {
			var player = document.getElementById('audio-player');

			if (PLAYING) {
				PLAYING = false;
				chrome.browserAction.setBadgeText({text: ''});
				player.src = '';
				player.pause();
			} else {
				PLAYING = true;
				chrome.browserAction.setBadgeText({text: 'on'});
				player.src = STREAM_URL;
				player.play();
			}
		},
		onSingleClick: function(tab) {
			getNowPlaying(2);
		}
}));

var createSongInfo = function(data) {
	if(data.hasOwnProperty('recording')) {
		var rec = data['recording'];
		var primaryArtist = undefined;
		var additionalArtists = [];

		rec['artists'].forEach(function(artist) {
			// primary, featured, ??
			if(artist['type'] == 'primary')
				primaryArtist = artist['name'];
			else
				additionalArtists.push(artist['name']);
		});

		var info = primaryArtist;

		if(additionalArtists.length > 0)
			info = info + ' ft. ' + additionalArtists.join(' & ');

		return info + ' - ' + rec['title'];
	} else {
		console.log(data);
		return "(no info)";
	}
}

var handleReturnData = function(data) {
	var message = "NOW\n" + createSongInfo(data['now']);

	if(data.hasOwnProperty('prev'))
		message = message + "\n\nPREV\n" + createSongInfo(data['prev']);

	chrome.notifications.create(
		'triple-j-now-playing',
		{type: "basic", title: 'Triple J', message: message, iconUrl: "images/icon38.png", requireInteraction: false}
	);
}

var getNowPlaying = function(retriesLeft) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', INFO_URL, true);
	xhr.timeout = 3000;
	xhr.responseType = 'json';
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var data = xhr.response;
				if(data.hasOwnProperty('now')) {
					handleReturnData(data);
					return;
				}
			}
			// Error
			if(retriesLeft > 0)
				getNowPlaying(retriesLeft - 1);
			else
				chrome.notifications.create(
					'triple-j-n)ow-playing',
					{type: "basic", title:'Now Playing', message: '(error retrieving data)', iconUrl: "images/icon38.png"}
				);
		}
	};
	xhr.send(null);

}