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
    "startTime": Date.now(),
    "currentPage": "none",
    "isDevelopmentBuild": false,
};

function updateCurrentShuffleSource(newSource) {
    if (newSource.type == "album") {
        if (songs[newSource.name]) {
            nowPlaying['shuffleSource'] = newSource;
        }
    } else if (newSource.type == "playlist") {
        if (playlists[newSource.name]) {
            nowPlaying['shuffleSource'] = newSource;
        }
    }
}

function getCurrentShuffleSource() {
    let newSource = nowPlaying['shuffleSource']
    if (newSource.type == "album") {
        if (songs[newSource.name]) {
            return songs[newSource.name]
        }
    } else if (newSource.type == "playlist") {
        if (playlists[newSource.name]) {
            return playlists[newSource.name]
        }
    }
}

var userSettings = {
    "normalizeVolume": false,
    "windowsAcrylicState": true,
    "userVolumeSliderValue": 1,
    "enableDeveloperMode": false,
}

const artAssetKeyDict = {
    "A Hat in Time OST": "hatintime",
    "Celeste (Original Soundtrack)": "celeste",
    "Celeste: Farewell (Original Soundtrack)": "farewell",
    "UNDERTALE Soundtrack": "undertale",
    "Portal 2: Songs to Test By - Volume 1": "portal2",
    "Portal 2: Songs to Test By - Volume 2": "portal2",
    "Portal 2: Songs to Test By - Volume 3": "portal2",
    "Portal 2: Songs to Test By": "portal2",
    "Terraria Soundtrack Volume 1": "terraria-1",
    "Terraria Soundtrack Volume 2": "terraria-2",
    "Terraria Soundtrack Volume 3": "terraria-3",
    "Keep Talking And Nobody Explodes - OST": "ktane",
    "Astroneer": "astro-1",
    "Astroneer (original game soundtrack) Volume 2": "astro-2",
    "Subnautica Original Soundtrack": "subnautica",
    "Hexoscope OST": "hexoscope",
    "Aperture Tag OST": "portal-tag",
    "Portal": "portal1",
    "sonic": "sanic",
    "%default": "unknown-album-image",
    "%localfiles": "src-localfiles",
    "%logo": "demisemihemidemisemiquaver",
}

/* reserved names:
unknown-album-image - ?
source-yt - YouTube source image
source-file - local file source image
source-sr - Song Request image
source-spotify - spotify source image
source-other - other source image
*/

log = require('electron-log')

document.addEventListener('readystatechange', (e) =>{
    ipcRenderer.on("updateState", (ev, message) => {
        if      (message === "next") { nextSong(); }
        else if (message === "prev") { prevSong(false); }
        else if (message === "stop") { pauseSong(false); }
        else if (message === "playpause") { pauseSong(); }
    });
})

function getDiscordArtAssetKeyFromAlbumName(name) {
    if (artAssetKeyDict[name]) {
        return artAssetKeyDict[name]
    } else if (name.includes("Sonic") || name.includes ("SONIC")) {
        return artAssetKeyDict["sonic"]
    } else {
        indx = ["%logo", "%default"][Math.floor(Math.random()*2)]
        return artAssetKeyDict[indx]
    }
}

const DiscordRPC = require("discord-rpc");
const { ipcRenderer } = require("electron");
const clientID = "659092610400387093";
//DiscordRPC.register(clientID);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
// ▶️ 🔂 ⏸️ 🔀
// 🔊 🔉 🔇 🔈 🎶 🎵 💿 🎧 🎤

async function updateRPC() {
    if (nowPlaying['song']['data'] == null) {
        rpc.setActivity({details: "Idle ⏹️", state: nowPlaying['currentPage']});
    } else {
        let details = nowPlaying['song']['data'][0]['title'] + " ";
        if (nowPlaying['playbackState'] == "Playing") details += "▶️";
        else if (nowPlaying['playbackState'] == "Paused") details += "⏸️";
        else if (nowPlaying['playbackState'] == "Idle") details += "⏹️";
        if (nowPlaying['shuffleMode'] == 'loop') details += "🔂 " + nowPlaying["loopCount"];
        else if (nowPlaying['shuffleMode'] == 'shuffleall') details += "🔀";
        else if (nowPlaying['shuffleMode'] == 'shufflealbum') details += "🔀";
        else if (nowPlaying['shuffleMode'] == 'order') details += "🔀";
        rpc.setActivity({
            details: details,
            state: nowPlaying['song']['data'][0]['album'] + " - " +  + "/" + nowPlaying['song']['data'][0]['track']['of'],
            startTimestamp: nowPlaying['startTime'],
            largeImageKey: getDiscordArtAssetKeyFromAlbumName(nowPlaying['song']['data'][0]['album']),
            largeImageText: nowPlaying['song']['data'][0]['artist'],
            smallImageText: nowPlaying['playbackState'] + " | v" + document.getElementById('version-display').innerHTML,
            smallImageKey: "unknown-album-image",
            partySize: nowPlaying['song']['data'][0]['track']['no'] == "--" ? null : nowPlaying['song']['data'][0]['track']['no'],
            partyMax: nowPlaying['song']['data'][0]['track']['no'] == "--" ? null : nowPlaying['song']['data'][0]['track']['no'],

        });
    }
} 

rpc.on('ready', () => {
    updateRPC();
    //setInterval(() => {updateRPC()}, 15e3);
})

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
        } else {
            document.getElementById('song').play()
            nowPlaying['playbackState'] = "Playing"
        }
    } else {
        if (document.getElementById('song').paused) {
            document.getElementById('song').play()
            nowPlaying['playbackState'] = "Playing"
        } else {
            document.getElementById('song').pause()
            nowPlaying['playbackState'] = "Paused"
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
        let next = randomSong(songs[nowPlaying['song']['data'][0]['album']])
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
}

var isChangingSong = false;

function updateVolume() {
    userSettings['userVolumeSliderValue'] = document.getElementById('now-playing-volume-slider').value;
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
    } else {
        document.getElementById('np-pause-img').src = pauseButtonImage;
    }

    document.getElementById('now-playing-seek-slider').value = song.currentTime;
    song.volume = (userSettings['userVolumeSliderValue'])**3
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