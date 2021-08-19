// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer, app } = require("electron");
const mm = require("music-metadata")
const os = require("os")
//const {Titlebar, Color} = require('custom-electron-titlebar');

/*window.addEventListener('DOMContentLoaded', () => {
    console.log("titlebar")
    new Titlebar({
      backgroundColor: Color.fromHex('#2f3241'),
    });
});*/

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
    },
    userAccent: (process.platform == "win32" && os.release().split('.')[0] === '10') ? systemPreferences.getAccentColor().substr(0, 6) : "#ff00ff",
    isPackaged: null,
    version: null
}

ipcRenderer.invoke("songs:getSongList").then((value) => {
    window.Bridge.songs = value
    console.log(value)
})

ipcRenderer.invoke("main:getVersion").then(value=>{
    window.Bridge.isPackaged = value.isPackaged
    window.Bridge.version = value.version
})

//ipcRenderer.invoke("wss:getIp").then((value) => {window.Bridge.IP = value})