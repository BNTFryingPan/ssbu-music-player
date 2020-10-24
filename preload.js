// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron")
const mm = require("music-metadata")
console.log("")
window.Bridge = {
    IP: "null",
    songs: {
        "All Songs": {
            "albumArt": "./assets/all-album.png",
            "extraText": "",
            "type": "album",
            "artists": [],
            "duration": 0,
            "songCount": 0,
            "songs": {},
            "songFilePaths": []
        },
        "Other": {
            "albumArt": './assets/other-album.png',
            "extraText": "",
            "type": "album",
            "artists": [], // this would have all songData['albumartist']'s in it,
            "duration": 0,
            "songCount": 0,
            "songs": {},
            "songFilePaths": []
        }
    }
}

ipcRenderer.invoke("songs:getSongList").then((value) => {
    window.Bridge.songs = value
    //console.log(value)
})

ipcRenderer.invoke("wss:getIp").then((value) => {window.Bridge.IP = value})