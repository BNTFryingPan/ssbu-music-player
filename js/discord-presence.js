// ▶️ 🔂 ⏸️ 🔀
// 🔊 🔉 🔇 🔈 🎶 🎵 💿 🎧 🎤

// the icons for different things
const iconsGen = {
    playbackState: {"Playing": "▶️", "Paused": "⏸️", "Idle": "⏹️", "%def": ""},
    shuffleMode:   {"loop": "🔂", "shuffleall": "🔀", "shufflesource": "🔀", "order": "🔁", "%def": ""},
}

const artAssetKeyDict = {
    "a hat in time ost": "hatintime",
    "celeste (original soundtrack)": "celeste",
    "celeste: farewell (original soundtrack)": "farewell",
    "undertale soundtrack": "undertale",
    "portal 2: songs to test by - volume 1": "portal2",
    "portal 2: songs to test by - volume 2": "portal2",
    "portal 2: songs to test by - volume 3": "portal2",
    "portal 2: songs to test by": "portal2",
    "terraria soundtrack volume 1": "terraria-1",
    "terraria soundtrack volume 2": "terraria-2",
    "terraria soundtrack volume 3": "terraria-3",
    "terraria soundtrack volume 4": "terraria-4",
    "terraria offical soundtrack volume 1": "terraria-1",
    "terraria offical soundtrack volume 2": "terraria-2",
    "terraria offical soundtrack volume 3": "terraria-3",
    "terraria offical soundtrack volume 4": "terraria-4",
    "keep talking and nobody explodes - ost": "ktane",
    "astroneer": "astro-1",
    "astroneer (original game soundtrack) volume 2": "astro-2",
    "subnautica original soundtrack": "subnautica",
    "hexoscope ost": "hexoscope",
    "aperture tag ost": "portal-tag",
    "portal": "portal1",
    "stardew valley ost": "stardew",
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

// gets an art asset key based on an album name
function getDiscordArtAssetKeyFromAlbumName(name) {
    if (artAssetKeyDict[name.toLowerCase()]) {
        return artAssetKeyDict[name.toLowerCase()]
    } else if (name.includes("Sonic") || name.includes ("SONIC")) {
        return artAssetKeyDict["sonic"]
    } else {
        let key = ["%logo", "%default"][Math.floor(Math.random()*2)] // randomly chooses between the logo and the ? icon
        return artAssetKeyDict[key]
    }
}

function formatPresenceString(str) {
    return str // formats a string intended to be used in discord RPC, but it could probably be used in other places (custom title bar text?)
    .replaceAll("{song.artist}",    nowPlaying["song"]["data"][0]["artist"])
    .replaceAll("{song.title}",     nowPlaying['song']['data'][0]['title'])
    .replaceAll("{song.album}",     nowPlaying['song']['data'][0]['album'])
    .replaceAll("{song.track.no}",  nowPlaying['song']['data'][0]['track']['no'])
    .replaceAll("{song.track.of}",  nowPlaying['song']['data'][0]['track']['of'])
    .replaceAll("{song.disk.no}",   nowPlaying['song']['data'][0]['disk']['no'])
    .replaceAll("{song.disk.of}",   nowPlaying['song']['data'][0]['disk']['of'])
    .replaceAll("{song.disc.no}",   nowPlaying['song']['data'][0]['disk']['no'])
    .replaceAll("{song.disc.of}",   nowPlaying['song']['data'][0]['disk']['of'])
    .replaceAll("{player.state}",   nowPlaying['playbackState'])
    .replaceAll("{player.loops}",   nowPlaying["loopCount"] == 0 ? "" : nowPlaying["loopCount"])
    .replaceAll("{player.version}", "v" + document.getElementById('version-display').innerHTML)
    .replaceAll("{player.icons}",   iconsGen.playbackState[nowPlaying["playbackState"]] + iconsGen.shuffleMode[nowPlaying["shuffleMode"]])
    .replaceAll("{player.page}",    nowPlaying["currentPage"])
    .replaceAll("{meta.bitrate}",   nowPlaying["song"]["data"][1]["bitrate"])
    .replaceAll("{meta.duration}",  nowPlaying['song']['data'][0]['duration']);
}

function updateRPC() { // updates the discord status by sending a request to the main process
    if (nowPlaying['song']['data'] == null) {
        ipcRenderer.send("rpc:setactivity", {details: "Idle ⏹️", state: nowPlaying['currentPage']});
    } else {
        ipcRenderer.send("rpc:setactivity", {
            details: formatPresenceString(userSettings.discord["details"]),
            state: formatPresenceString(userSettings.discord["state"]),
            largeImageText: formatPresenceString(userSettings.discord['largeImageText']),
            smallImageText: formatPresenceString(userSettings.discord['smallImageText']),
            largeImageKey: getDiscordArtAssetKeyFromAlbumName(nowPlaying['song']['data'][0]['album']),
            smallImageKey: "unknown-album-image",
            startTimestamp: nowPlaying['startTime'],
            joinSecret: window.Bridge.IP,
            partySize: nowPlaying['song']['data'][0]['track']['no'] == "--" ? 1 : nowPlaying['song']['data'][0]['track']['no'],
            partyMax: nowPlaying['song']['data'][0]['track']['of'] == "--" ? 1 : nowPlaying['song']['data'][0]['track']['of'],
            matchSecret: "matchsecret",
            partyId: "partyid"
        });
    }
}

function rpcUpdateSong(song) { // sends a packet for listening parties. idk if this works or not lol
    let songPacket = {"type": "newSong", "data": {"album": song[0]['album'], "title": song[0]['title'], "artist": song[0]['artist']}}
    ipcRenderer.send("wss:newSong", [songPacket])
}