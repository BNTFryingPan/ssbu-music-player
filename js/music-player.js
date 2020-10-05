var songs = {
    "All Songs": {
        "albumArt": "./other-album.png",
        "extraText": "All",
        "type": "album",
        "artists": [],
        "duration": 0,
        "songs": {},
        "songFilePaths": []
    },
    "Other": {
        "albumArt": './other-album.png',
        "extraText": "Other",
        "type": "album",
        "artists": [], // this would have all songData['albumartist']'s in it,
        "duration": 0,
        "songs": {},
        "songFilePaths": []
    }
}

var nowPlaying = {
    "previewedAlbum": "All Songs",
    "openedAlbum": "",
    "song": {
        "data": null,
        "index": 0,
        "url": null,
        "type": null,
        "videoData": null
    },
    "youtube-queue": [],
    "currentPlaylist": null,
    "currentSource": null,
    "shuffleSource": songs['All Songs'],
    "shuffleMode": "order", // shuffle album/playlist, random all, order, loop, sr
    "userVolumeSliderValue": 1,
    "rawNormalizationGain": 1,
};

var userSettings = {
    "normalizeVolume": true
}

function randomSong(source=null) {
    if (source === null) {
        source = songs['All Songs']
    } else {
        if (source['type'] == "album") {
            
        } else if (source['type'] == "playlist") {
            alert('Playlists dont work yet!')
            return
            //TODO: add playlists
        }
    }
    //console.log(songsToPickFrom)
    var randomSongIndex = parseInt(Math.random() * source['songFilePaths'].length);
    return {"data": source['songs'][source['songFilePaths'][randomSongIndex]], "index": randomSongIndex, "file": source['songFilePaths'][randomSongIndex]};
}

function updateSongProgressFromBar() {
    var slider = document.getElementById("now-playing-seek-slider")
    document.getElementById('song').currentTime = slider.value;
}

function pauseSong(state) {
    if (state == true || state == false) {
        if (state) {
            document.getElementById('song').pause()
            //console.log('pause a')
        } else {
            document.getElementById('song').play()
            //console.log('play a')
        }
    } else {
        if (document.getElementById('song').paused) {
            document.getElementById('song').play()
            //console.log('pause')
        } else {
            document.getElementById('song').pause()
            //console.log('play')
        }
    }
}

function nextSong() {
    if (nowPlaying['shuffleMode'] == "loop") {
        document.getElementById('song').currentTime = 0;
        document.getElementById('song').play();
    } else if (nowPlaying['shuffleMode'] == "shuffle") {
        playSongFromFile(randomSong()['file'])
    } else if (nowPlaying['shuffleMode'] == "order") {
        if (nowPlaying['shuffleSource']['type'] == "album") {
            var nextSongIndex = nowPlaying['song']['index']
            if (nextSongIndex >= nowPlaying['shuffleSource']['songs'].length) {
                nextSongIndex = 0;
            }
            
            playSongFromFile(nowPlaying['shuffleSource']['songFilePaths'][nextSongIndex])
            nowPlaying['song']['index'] = nextSongIndex;
        } else if (nowPlaying['shuffleSource']['type'] == "playlist") {
            alert('whoops, you found playlists, bye')
        }
    } else {
        playSongFromFile(randomSong()['data'][0]['fileLocation']);
        nowPlaying['shuffleMode'] = "shuffle";
        alert("invalid shuffle mode, reverted to shuffle")
    }
}

function prevSong() {
    if (document.getElementById('song').currentTime <= 3) {
        document.getElementById('song').currentTime = 0;
        alert('wip');
    } else {
        document.getElementById('song').currentTime = 0;
    }
}

function shuffleSongs() {
    if (nowPlaying['shuffleMode'] == "loop") {
        nowPlaying["shuffleMode"] = "shuffle";
    } else if (nowPlaying['shuffleMode'] == "shuffle") {
        nowPlaying["shuffleMode"] = "order";
    } else if (nowPlaying['shuffleMode'] == "order") {
        nowPlaying["shuffleMode"] = "loop"
    }

    document.getElementById('shuffle-state').innerHTML = nowPlaying['shuffleMode'];
}

var isChangingSong = false;

function updateVolume() {
    nowPlaying['userVolumeSliderValue'] = document.getElementById('now-playing-volume-slider').value;
    gainNode.gain.value = nowPlaying['rawNormalizationGain'] * nowPlaying['userVolumeSliderValue'];//, audioCtx.currentTime);
    //gainNode.gain.value = 0;
}

function songTick() {
    var song = document.getElementById('song')
    if (nowPlaying['currentSource'] == 'yt') { return }
    if (song.ended && !isChangingSong) {
        nextSong();
        isChangingSong = true;
        sendNewSongPlayingMessage("Now Playing: " + nowPlaying['song']['data'][0]['title'] + " from " + nowPlaying['song']['data'][0]['album'] + " by " + nowPlaying['song']['data'][0]['artist'] + " from a file.");
    } else if (song.currentTime >= song.duration/100) {
        isChangingSong = false;
    }

    //TODO: add seek slider, and update it here
    document.getElementById('now-playing-seek-slider').value = song.currentTime;
    if (!calculatingGain) {
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + nowPlaying['userVolumeSliderValue'];
    } else {
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + nowPlaying['userVolumeSliderValue'] + " (Recalculating...)"
    }
}

// MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause

window.setInterval(function(){
    songTick();
}, 25)