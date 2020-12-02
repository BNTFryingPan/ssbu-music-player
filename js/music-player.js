var songs = window.Bridge.songs;

var nowPlaying = {
    "previewedAlbum": "All Songs",
    "playbackState": "Idle",
    "loopCount": 0,
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
    "shuffleSource": {type:"album",name:"All Songs"},
    "shuffleMode": "shuffleall", // shuffleall, loop, order, shufflealbum
    "rawNormalizationGain": 1,
    "startTime": {
        "application": Date.now(),
        "source": Date.now(),
        "song": Date.now()
    },
    "currentPage": "none",
    "isDevelopmentBuild": false,
};

const { ipcRenderer } = require("electron");

function updateCurrentShuffleSource(newSource) {
    let updated = "not correct type"
    if (newSource.type == "album") {
        if (songs[newSource.name]) {
            nowPlaying['shuffleSource'] = newSource;
            updated = "success"
        } else updated = "no album"
    } else if (newSource.type == "playlist") {
        if (playlists[newSource.name]) {
            nowPlaying['shuffleSource'] = newSource;
            updated = "success"
        } else updated = "no playlist"
    }
    console.log("updated shuffle source: " + updated)
    if (updated == "success") {nowPlaying["startTime"]["source"] = Date.now()}
}

function getCurrentShuffleSource() {
    let newSource = nowPlaying['shuffleSource']
    if (newSource.type == "album") {
        if (songs[newSource.name]) {
            return {"type": "album", "src": songs[newSource.name]}
        }
    } else if (newSource.type == "playlist") {
        if (playlists[newSource.name]) {
            return {"type": "playlist", "src": playlists[newSource.name]}
        }
    }
}

var userSettings = {
    "normalizeVolume": false,
    "windowsAcrylicState": true,
    "userVolumeSliderValue": 1,
    "enableDeveloperMode": false,
    "discord": {
        "enableRPC": true,
        "largeImageText": "{song.artist}",
        "smallImageText": "{player.state} | {player.version}",
        "details": "{song.album}",
        "state": "{song.title} {player.icons} {player.loops}",
        "startTimestampMode": "song", // possible values: song, source, application
    }
}

log = require('electron-log')

document.addEventListener('readystatechange', (e) =>{
    ipcRenderer.on("updateState", (ev, message) => {
        if      (message === "next") { nextSong(); }
        else if (message === "prev") { prevSong(false); }
        else if (message === "stop") { pauseSong(false); }
        else if (message === "playpause") { pauseSong(); }
    });
})

function randomSong() {
    let src = getCurrentShuffleSource();
    if (nowPlaying["shuffleMode"] == "shuffleall") {
        src = {"type": "album", "src": songs["All Songs"]}
    }
    
    if (src["type"] == "album") {
        var randomSongIndex = parseInt(Math.random() * src['src']['songFilePaths'].length);
        return {"data": src['src']['songs'][src['src']['songFilePaths'][randomSongIndex]], "index": randomSongIndex, "file": src['src']['songFilePaths'][randomSongIndex], "type":"local-file"};
    } else if (src['type'] == "playlist") {
        let rsong = src['src']['songs'][parseInt(Math.random() * src['src']['songs'].length)];
        return {"data": getSongData(rsong["dir"]), "index": 0, "file": rsong["dir"], "type":"local-file"}
    }
    
}

function updateSongProgressFromBar() {
    var slider = document.getElementById("now-playing-seek-slider")
    document.getElementById('song').currentTime = slider.value;
}

function pauseSong(state) {
    if (state == true || state == false) {
        if (state) {
            document.getElementById('song').pause()
            nowPlaying['playbackState'] = "Paused";
            dispatchEvent("PLAYERSTATECHANGE", {"paused": true})
        } else {
            document.getElementById('song').play()
            nowPlaying['playbackState'] = "Playing"
            dispatchEvent("PLAYERSTATECHANGE", {"paused": false})
        }
    } else {
        if (document.getElementById('song').paused) {
            document.getElementById('song').play()
            nowPlaying['playbackState'] = "Playing"
            dispatchEvent("PLAYERSTATECHANGE", {"paused": false})
        } else {
            document.getElementById('song').pause()
            nowPlaying['playbackState'] = "Paused"
            dispatchEvent("PLAYERSTATECHANGE", {"paused": true})
        }
    }
    updateRPC()
}

function nextSong() {
    if (nowPlaying['shuffleMode'] == "loop") {
        nowPlaying['loopCount']++;
        document.getElementById('song').currentTime = 0;
        document.getElementById('song').play();
        nowPlaying['playbackState'] = "Playing";
        nowPlaying['startTime'] = Date.now();
        updateRPC()
    } else if (nowPlaying['shuffleMode'] == "shuffleall") {
        let next = randomSong(songs['All Songs'])
        playSongFromFile(next['file'])
        sendNewSongPlayingMessage(next)
        nowPlaying['loopCount'] = 0;
    } else if (nowPlaying['shuffleMode'] == "shufflesource") {
        //debugger
        let next = randomSong()
        playSongFromFile(next['file'])
        sendNewSongPlayingMessage(next)
        nowPlaying['loopCount'] = 0;
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
        nowPlaying['loopCount'] = 0;
    } else {
        playSongFromFile(randomSong()['data'][0]['fileLocation']);
        nowPlaying['shuffleMode'] = "shuffle";
        nowPlaying['loopCount'] = 0;
        alert("invalid shuffle mode, reverted to shuffle")
    }

    rpcUpdateSong(nowPlaying['song']['data'])
}

function prevSong(notif) {
    if (document.getElementById('song').currentTime <= 3) {
        document.getElementById('song').currentTime = 0;
        nowPlaying['startTime'] = Date.now();
        updateRPC();
        if (!!notif) alert('wip');
    } else {
        document.getElementById('song').currentTime = 0;
        nowPlaying['startTime'] = Date.now();
        updateRPC();
    }
}

function shuffleSongs() {
    let previousState = "" + nowPlaying["shuffleMode"];
    if (nowPlaying['shuffleMode'] == "loop") {
        nowPlaying["shuffleMode"] = "shuffleall";
    } else if (nowPlaying['shuffleMode'] == "shuffleall") {
        nowPlaying["shuffleMode"] = "shufflesource";
    } else if (nowPlaying['shuffleMode'] == "shufflesource") {
        nowPlaying["shuffleMode"] = "order"
    } else if (nowPlaying['shuffleMode'] == "order") {
        nowPlaying["shuffleMode"] = "loop"
    }

    updateShuffleModeText()
    dispatchEvent("SHUFFLEMODECHANGE", {"previous": previousState, "new": nowPlaying["shuffleMode"]})
}

var isChangingSong = false;

function updateVolume() {
    userSettings['userVolumeSliderValue'] = document.getElementById('now-playing-volume-slider').value;
    document.getElementById("np-slider-volu").innerHTML = parseInt(((userSettings['userVolumeSliderValue'])**3)*100) + " (" + parseInt(userSettings['userVolumeSliderValue']*100)  + ")"
    //document.getElementById("np-slider-volu").innerHTML = (((userSettings['userVolumeSliderValue'])**3)) + " (" + (userSettings['userVolumeSliderValue'])  + ")"
    saveSettingsFile();
    //gainNode.gain.value = nowPlaying['rawNormalizationGain'] * nowPlaying['userVolumeSliderValue'];//, audioCtx.currentTime);
    //gainNode.gain.value = 0;
}

const playButtonImage = "./assets/play.png";
const pauseButtonImage = "./assets/pause.png";

function songTick() {
    var song = document.getElementById('song')
    if (nowPlaying['currentSource'] == 'yt') { return }
    if (song.ended && !isChangingSong) {
        nextSong();
        isChangingSong = true;
        //sendNewSongPlayingMessage("Now Playing: " + nowPlaying['song']['data'][0]['title'] + " from " + nowPlaying['song']['data'][0]['album'] + " by " + nowPlaying['song']['data'][0]['artist'] + " from a file.");
    } else if (song.currentTime >= song.duration/100) {
        isChangingSong = false;
    }

    
    if (song.paused) {
        document.getElementById('np-pause-img').src = playButtonImage;

        if (nowPlaying["song"]["data"] !== null) document.getElementById("_title").innerHTML = "Paused | " + nowPlaying["song"]["data"][0]['title'] + " - "  + nowPlaying["song"]["data"][0]['album'] + " | Smash Music Player v" + document.getElementById("version-display").innerHTML
    } else {
        document.getElementById('np-pause-img').src = pauseButtonImage;
        document.getElementById("np-slider-time").innerHTML = fancyTimeFormat(song.currentTime) + " / " + fancyTimeFormat(song.duration)

        if (nowPlaying["song"]["data"] !== null) document.getElementById("_title").innerHTML = nowPlaying["song"]["data"][0]['title'] + " - "  + nowPlaying["song"]["data"][0]['album'] + " | Smash Music Player v" + document.getElementById("version-display").innerHTML
    }

    document.getElementById('now-playing-seek-slider').value = song.currentTime;
    song.volume = (userSettings['userVolumeSliderValue'] || 1)**3


    

    /*if (!calculatingGain) {
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + userSettings['userVolumeSliderValue'];
    } else {
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + userSettings['userVolumeSliderValue'] + " (Recalculating...)"
    }*/
}

// MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause

var elec = require('electron');
if (elec.remote.app.isPackaged) {
    document.getElementById("version-display").innerHTML = elec.remote.app.getVersion();
    console.log("Production Build");
} else {
    document.getElementById("version-display").innerHTML = require("./package.json").version + " - Development Build"
    nowPlaying['isDevelopmentBuild'] = true;
}
window.setInterval(function(){
    songTick();
}, 25);