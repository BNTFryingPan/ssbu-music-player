var folderFileData = {
    "name": "",
    "ext": ".ssbu-music"
}

var blankFolderData = {
    "albums": {

    },
    "fileDataVer": 0
}

function getDataFileName() {
    return folderFileData['name'] + folderFileData['ext'];
}

const fs = require('fs');

var folderData = {
    "C:": {

    }
}

function getSongFolderData(song) {
    let folderFile = song[0]['folder'] + "/" + getDataFileName();
    return parseFolderDataFile(folderFile);

}

function parseFolderData(dir) {
    let folderFile = dir + "/" + getDataFileName();
    return parseFolderDataFile(folderFile);
}

function saveAlbumHtmlToFile(path, album, html) {
    console.log(path + ", " + album)
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
}

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