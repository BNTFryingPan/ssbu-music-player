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
    "songToAddToPlaylist": null,
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
    switch (newSource.type) {
        case "album":
            updated = "no album"
            if (songs[newSource.name]) {
                nowPlaying['shuffleSource'] = newSource;
                updated = "success"
            }
            break
        case "playlist":
            updated = "no playlist"
            if (playlists[newSource.name]) {
                nowPlaying['shuffleSource'] = newSource;
                updated = "success"
            }
            break
    }

    console.log("updated shuffle source: " + updated)
    if (updated == "success") {nowPlaying["startTime"]["source"] = Date.now()}
}

function getCurrentShuffleSource() {
    let source = nowPlaying['shuffleSource']
    if (source.type == "album") {
        if (songs[source.name]) return {"type": "album", "src": songs[source.name]}
    }
    if (source.type == "playlist") {
        if (playlists[source.name]) return {"type": "playlist", "src": playlists[source.name]}
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
        if (message === "next") return nextSong();
        if (message === "prev") return prevSong(false);
        if (message === "stop") return pauseSong(false);
        if (message === "playpause") return pauseSong();
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
    }

    if (src['type'] == "playlist") {
        let rsong = src['src']['songs'][parseInt(Math.random() * src['src']['songs'].length)];
        return {"data": getSongData(rsong["dir"]), "index": 0, "file": rsong["dir"], "type":"local-file"}
    }
    
}

function updateSongProgressFromBar() {
    var slider = document.getElementById("now-playing-seek-slider")
    document.getElementById('song').currentTime = slider.value;
}

function pauseSong(state) {
    state ??= !document.getElementById('song').paused
    document.getElementById('song')[state?"pause":"play"]()
    nowPlaying['playbackState'] = state ? "Paused" : "Playing";
    dispatchEvent("PLAYERSTATECHANGE", {"paused": state})
    updateRPC()
}

function nextSong() {
    if (document.getElementById("sto-enablesr").checked && nowPlaying['youtube-queue'].length > 0) {
        let next = nowPlaying["youtube-queue"].shift()
        nowPlaying.song.type = "yt"
        nowPlaying.song.url = next.id;
        nowPlaying.song.videoData = next.details;
        console.log('before download')
        let stream = ytdl(next.id, {quality: "highestaudio"});
        stream.pipe(fs.createWriteStream(platFolders.getDocumentsFolder() + "/ssbu-music/ytdl/song.mp4"));
        stream.on('end', () => {
            document.getElementById('song').src = platFolders.getDocumentsFolder() + "/ssbu-music/ytdl/song.mp4";
            document.getElementById('song').play();
            sendTwitchMessage("Now Playing " + next.details.videoDetails.title + " requested by " + next.requester)
            console.log('playing song now')

            document.getElementById('song-info-art').src = next.details.videoDetails.author.thumbnails[0].url
            //document.getElementById('song-info-art').src = songs[songData[0]['album']]['albumArt']
            document.getElementById('song-info-title').innerHTML  = next.details.videoDetails.title;
            document.getElementById('song-info-album').innerHTML  = "YouTube Video";
            document.getElementById('song-info-artist').innerHTML = next.details.videoDetails.author.name;

            document.getElementById('song-info-title2').innerHTML = next.details.videoDetails.title + " - YouTube Video - " + next.details.videoDetails.author.name;
            document.getElementById('song-info-genre').innerHTML = next.details.videoDetails.category + " - " + next.details.videoDetails.description;
            document.getElementById('song-info-line1').innerHTML = next.details.videoDetails.uploadDate + " - " + next.details.videoDetails.lengthSeconds + " - [YTV]";
            document.getElementById('song-info-line2').innerHTML = "YTV - Advanced codec info not available"
        })
        console.log('after download')
        return
    }
    if (nowPlaying['shuffleMode'] == "loop") {
        nowPlaying['loopCount']++;
        document.getElementById('song').currentTime = 0;
        document.getElementById('song').play();
        nowPlaying['playbackState'] = "Playing";
        nowPlaying['startTime'] = Date.now();
        updateRPC()
        return
    }
    if (nowPlaying['shuffleMode'] == "shuffleall") {
        let next = randomSong(songs['All Songs'])
        playSongFromFile(next['file'])
        sendNewSongPlayingMessage(next)
        nowPlaying['loopCount'] = 0;
        return
    }
    if (nowPlaying['shuffleMode'] == "shufflesource") {
        //debugger
        let next = randomSong()
        playSongFromFile(next['file'])
        sendNewSongPlayingMessage(next)
        nowPlaying['loopCount'] = 0;
        return
    }
    if (nowPlaying['shuffleMode'] == "order") {
        nowPlaying['loopCount'] = 0;
        if (nowPlaying['shuffleSource']['type'] == "album") {
            var nextSongIndex = nowPlaying['song']['index']
            if (nextSongIndex >= nowPlaying['shuffleSource']['songs'].length) {
                nextSongIndex = 0;
            }
            
            playSongFromFile(nowPlaying['shuffleSource']['songFilePaths'][nextSongIndex])
            nowPlaying['song']['index'] = nextSongIndex;
            return
        }
        if (nowPlaying['shuffleSource']['type'] == "playlist") {
            //alert('whoops, you found playlists, bye')
        }
    }

    playSongFromFile(randomSong()['data'][0]['fileLocation']);
    nowPlaying['shuffleMode'] = "shuffle";
    nowPlaying['loopCount'] = 0;
    alert("invalid shuffle mode, reverted to shuffle")

    //rpcUpdateSong(nowPlaying['song']['data'])
}

function prevSong(notif) {
    if (document.getElementById('song').currentTime <= 3) {
        document.getElementById('song').currentTime = 0;
        nowPlaying['startTime'] = Date.now();
        updateRPC();
        if (!!notif) alert('wip');
        return
    }
    document.getElementById('song').currentTime = 0;
    nowPlaying['startTime'] = Date.now();
    updateRPC()
}

const SHUFFLE_MODES = {
    "loop": "shuffleall",
    "shuffleall": "shufflesource",
    "shufflesource": "order",
    "order": "loop",
}

function shuffleSongs() {
    let previousState = "" + nowPlaying["shuffleMode"];

    nowPlaying['shuffleMode'] = SHUFFLE_MODES[nowPlaying['shuffleMode']]

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

const PLAY_BUTTON_IMAGE = "./assets/play.png";
const PAUSE_BUTTON_IMAGE = "./assets/pause.png";

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

    document.getElementById('np-pause-img').src = song.paused ? PAUSE_BUTTON_IMAGE : PLAY_BUTTON_IMAGE;
    
    if (!song.paused) document.getElementById("np-slider-time").innerHTML = fancyTimeFormat(song.currentTime) + " / " + fancyTimeFormat(song.duration)

    if (nowPlaying["song"]["data"] !== null) document.getElementById("_title").innerHTML = `${song.paused ? "Paused | " : ""}${nowPlaying["song"]["data"][0]['title']} - ${nowPlaying["song"]["data"][0]['album']} | Smash Music Player v${document.getElementById("version-display").innerHTML}`

    document.getElementById('now-playing-seek-slider').value = song.currentTime;
    song.volume = (userSettings['userVolumeSliderValue'] || 1)**3

    //document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + userSettings['userVolumeSliderValue'] + calculatingGain ? " (Recalculating...)" : "";
}

// MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause

/*var elec = require('electron');
if (elec.remote.app.isPackaged) {
    document.getElementById("version-display").innerHTML = elec.remote.app.getVersion();
    console.log("Production Build");
} else {
    document.getElementById("version-display").innerHTML = require("./package.json").version + " - Development Build"
    nowPlaying['isDevelopmentBuild'] = true;
}*/

//document.getElementById("version-display").innerHTML = window.Bridge.version;
//nowPlaying['isDevelopmentBuild'] = !window.Bridge.isPackaged;

window.setInterval(songTick, 25);