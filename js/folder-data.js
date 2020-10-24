var folderFileData = {
    "data": "",
    "settings": "settings",
    "playlists": "playlists",
    "ext": ".ssbu-music",
    "dev-ext": ".ssbu-music-dev",
    "useDev": nowPlaying["isDevelopmentBuild"]
}

var blankFolderData = {
    "albums": {

    },
    "fileDataVer": 0
}

function getFileExtension() {
    return (folderFileData["useDev"] ? folderFileData["dev-ext"] : folderFileData['ext'])
}

function getDataFileName() {
    return folderFileData['data'] + getFileExtension();
}

function getSettingsFileName() {
    return folderFileData['settings'] + getFileExtension();
}

function getPlaylistsFileName() {
    return folderFileData['playlists'] + getFileExtension();
}

//const fs = require('fs');

//var folderData = {
//    "C:": {
//
//    }
//}

function getSongFolderData(song) {
    return parseFolderDataFile(song[0]['folder'] + "/" + getDataFileName());

}

function parseFolderData(dir) {
    return parseFolderDataFile(dir + "/" + getDataFileName());
}

/*function saveAlbumHtmlToFile(path, album, html) {
    //console.log(path + ", " + album)
    if (album == "All Songs" || album == "Other") path = platFolders.getMusicFolder();
    let f = parseFolderDataFile(path + "/" + getDataFileName());
    if (!f['albums'][album]) {
        f['albums'][album] = {"songs":{},"html":""}
    }
    f['albums'][album]['html'] = html
    saveFolderDataFile(path, f)
}

function loadAlbumHtmlFromFile(path, album) {
    if (album == "All Songs" || album == "Other") path = platFolders.getMusicFolder();
    let f = parseFolderDataFile(path + "/" + getDataFileName());
    if (!f['albums'][album]) {
        return false
    } else {
        return f['albums'][album]['html']
    }
}*/

function parseFolderDataFile(path) {
    if (fs.existsSync(path)) {
        var f = fs.readFileSync(path, {"encoding": "utf-8"});
        let j = JSON.parse(f)
        return j
    } else {
        fs.writeFileSync(path, JSON.stringify(blankFolderData))
        return blankFolderData
    }
}

function saveFolderDataFile(path, data) {
    fs.writeFileSync(path + "/" + getDataFileName(), JSON.stringify(data))
}

function readSettingsFile() {
    if (fs.existsSync(platFolders.getMusicFolder() + "/" + getSettingsFileName())) {
        return JSON.parse(fs.readFileSync(platFolders.getMusicFolder() + "/" + getSettingsFileName()))
    } else {
        fs.writeFileSync(platFolders.getMusicFolder() + "/" + getSettingsFileName(), JSON.stringify(userSettings))
        return userSettings
    }
}

function saveSettingsFile() {
    fs.writeFileSync(platFolders.getMusicFolder() + "/" + getSettingsFileName(), JSON.stringify(userSettings))
}

function loadSettings() {
    let file = readSettingsFile()
    //console.log(userSettings)
    //console.log(file)
    file.discord = {...userSettings.discord, ...file.discord}
    userSettings = {...userSettings, ...file}
    //console.log(userSettings)
}

function savePlaylistsToFile() {
    fs.writeFileSync(platFolders.getMusicFolder() + "/" + getPlaylistsFileName(), JSON.stringify(playlists))
}

function loadPlaylistsFromFile() {
    if (fs.existsSync(platFolders.getMusicFolder() + "/" + getPlaylistsFileName())) {
        playlists = JSON.parse(fs.readFileSync(platFolders.getMusicFolder() + "/" + getPlaylistsFileName()))
    } else {
        fs.writeFileSync(platFolders.getMusicFolder() + "/" + getPlaylistsFileName(), JSON.stringify(playlists))
    }
}