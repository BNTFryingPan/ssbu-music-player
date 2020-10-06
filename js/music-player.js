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
    "shuffleSource": songs['All Songs'],
    "shuffleMode": "order", // shuffle album/playlist, random all, order, loop, sr
    "userVolumeSliderValue": 1,
    "rawNormalizationGain": 1,
    "startTime": Date.now()
};

var userSettings = {
    "normalizeVolume": true,
    "currentPage": "none"
}

const artAssetKeyDict = {
    "A Hat in Time OST": "hatintime",
    "Celeste (Original Soundtrack)": "celeste",
    "Celeste: Farewell (Original Soundtrack)": "farewell",
    "UNDERTALE Soundtrack": "undertale",
    "%default": "unknown-album-image"
}

function getDiscordArtAssetKeyFromAlbumName(name) {
    if (artAssetKeyDict[name]) {
        return artAssetKeyDict[name]
    } else {
        return artAssetKeyDict["%default"]
    }
}

const DiscordRPC = require("discord-rpc");
const clientID = "659092610400387093";
//DiscordRPC.register(clientID);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
//▶️ 🔂 ⏸️ 🔀

async function updateRPC() {
    if (nowPlaying['song']['data'] == null) {
        rpc.setActivity({details: "Idle ⏹️", state: userSettings['currentPage']});
    } else {
        details = nowPlaying['song']['data'][0]['title'] + " ";
        if (nowPlaying['playbackState'] == "Playing") details += "▶️";
        else if (nowPlaying['playbackState'] == "Paused") details += "⏸️";
        else if (nowPlaying['playbackState'] == "Idle") details += "⏹️";
        if (nowPlaying['shuffleMode'] == 'loop') details += "🔂 " + nowPlaying["loopCount"];
        else if (nowPlaying['shuffleMode'] == 'random all') details += "🔀";
        rpc.setActivity({
            details: details,
            state: nowPlaying['song']['data'][0]['album'] + " - " + nowPlaying['song']['data'][0]['track']['no'] + "/" + nowPlaying['song']['data'][0]['track']['of'],
            startTimestamp: nowPlaying['startTime'],
            largeImageKey: getDiscordArtAssetKeyFromAlbumName(nowPlaying['song']['data'][0]['album']),
            largeImageText: nowPlaying['song']['data'][0]['artist'],
            smallImageText: nowPlaying['playbackState'],
            smallImageKey: "unknown-album-image",
        });
    }
} 

rpc.on('ready', () => {
    updateRPC();
    //setInterval(() => {updateRPC()}, 15e3);
})

//debugger
rpc.login({ clientId: clientID }).catch(console.error);

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
            nowPlaying['playbackState'] = "Paused"
            //console.log('pause a')
        } else {
            document.getElementById('song').play()
            nowPlaying['playbackState'] = "Playing"
            //console.log('play a')
        }
    } else {
        if (document.getElementById('song').paused) {
            document.getElementById('song').play()
            nowPlaying['playbackState'] = "Playing"
            //console.log('pause')
        } else {
            document.getElementById('song').pause()
            nowPlaying['playbackState'] = "Paused"
            //console.log('play')
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
    } else if (nowPlaying['shuffleMode'] == "shuffle") {
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

    
}

function prevSong() {
    if (document.getElementById('song').currentTime <= 3) {
        document.getElementById('song').currentTime = 0;
        nowPlaying['startTime'] = Date.now();
        updateRPC();
        alert('wip');
    } else {
        document.getElementById('song').currentTime = 0;
        nowPlaying['startTime'] = Date.now();
        updateRPC();
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
    //gainNode.gain.value = nowPlaying['rawNormalizationGain'] * nowPlaying['userVolumeSliderValue'];//, audioCtx.currentTime);
    //gainNode.gain.value = 0;
}

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

    //TODO: add seek slider, and update it here
    document.getElementById('now-playing-seek-slider').value = song.currentTime;
    song.volume = nowPlaying['userVolumeSliderValue']
    /*if (!calculatingGain) {
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + nowPlaying['userVolumeSliderValue'];
    } else {
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + nowPlaying['rawNormalizationGain'] + "x" + nowPlaying['userVolumeSliderValue'] + " (Recalculating...)"
    }*/
}

// MediaNextTrack, MediaPreviousTrack, MediaStop and MediaPlayPause



window.setInterval(function(){
    songTick();
}, 25)