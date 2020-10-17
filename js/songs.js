const {ipcMain} = require("electron")
const fs = require("fs")
const mm = require("music-metadata")
const platFolders = require("platform-folders")

function fancyTimeFormat(time, forceHours)
{   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        if (hrs <= 9 && forceHours) {
            ret = "0" + ret
        }
    } else if (forceHours) {
        ret += "00:";
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

global.songs = {
    "All Songs": {
        "albumArt": "./assets/all-album.png",
        "extraText": "",
        "type": "album",
        "artists": [], // this would have all songData['albumartist']'s in it,
        "duration": 0,
        "songCount": 0,
        "songs": {},
        "songFilePaths": []
    },
    "Other": {
        "albumArt": './assets/other-album.png',
        "extraText": "",
        "type": "album",
        "artists": [],
        "duration": 0,
        "songCount": 0,
        "songs": {},
        "songFilePaths": []
    }
}

function getSongImage(song) {
    let picture = song[0]['picture']
    if (picture && picture[0]) {
        return `data:${picture[0].format};base64,${picture[0].data.toString('base64')}`;
    }
    return "./assets/unknown.png"
}

const regex_title = /(.*)\.[^.]+$/;
async function getSongData(fileName) {
    if (global.songs["All Songs"]["songFilePaths"].includes(fileName)) {
        return global.songs["All Songs"]["songs"][fileName]
    }

    let md = await mm.parseFile(fileName, {duration: true})
    var songData = md['common'];
    var metaData = md['format'];
    var folderPathNames = fileName.replace(/\\/g, "/").split("/");
    var folderPath = ""
    for (dir in folderPathNames) {
        if (dir < folderPathNames.length-1 && dir != 0) {
            folderPath += "/"
        } else if (dir == folderPathNames.length-1) {
            break
        }
        folderPath += folderPathNames[dir]
    }

    songData['folder'] = folderPath;
    songData['fileName'] = fileName.split("/")[fileName.split('/').length-1]
    if (!songData['title']) {
        songData['title'] = regex_title.exec(songData['fileName'])[1]
    }

    songData['track']["no"] = songData['track']["no"] || "--";
    songData['track']["of"] = songData['track']["of"] || "--";
    songData['album'] = songData['album'] || "Other";
    songData['artist'] = songData['artist'] || "Unknown";
    songData['genre'] = songData['genre'] || ["Unknown"];
    songData['comment'] = songData['comment'] || ["No Comment"];
    songData['year'] = songData['year'] || 0;
    songData['disk']["no"] = songData['disk']["no"] || "-";
    songData['disk']["of"] = songData['disk']["of"] || "-";

    songData['duration'] = fancyTimeFormat(metaData["duration"]);
    songData['rawDuration'] = metaData["duration"]
    songData['fileLocation'] = fileName.replace(/\\/g, "/");
    songData['fileLocation'] = songData['fileLocation'].replace(/\\/g, "/")
    return [songData, metaData];
}

async function loadSongsFromFolder(directory, recursive) {
    recursive = recursive || true;
    directory = directory.replace(/\\/g, "/");
    var files = fs.readdirSync(directory)
    for (var f in files) {
        if (files[f].split('.').length == 1 && recursive) {
            try {
                loadSongsFromFolder(directory + "/" + files[f])
            } catch (error) {
                console.warn(files[f] + " doesnt have file extension, but isnt folder either!")
            }
        } else if (files[f].endsWith('.mp3') || files[f].endsWith('.ogg') || files[f].endsWith(".wav") || files[f].endsWith(".flac")) {
            var thisSong = await getSongData(directory + "/" + files[f]);
            if (!(global.songs[thisSong[0]['album']])) {
                global.songs[thisSong[0]['album']] = {
                    "albumArt": "./assets/none.png",
                    "artists": [],
                    "songs": {},
                    "songFilePaths": [],
                    "duration": 0,
                    "songCount": 0,
                }
            }

            global.songs[thisSong[0]['album']]['songs'][directory + "/" + files[f]] = thisSong
                     global.songs["All Songs"]['songs'][directory + "/" + files[f]] = thisSong
            global.songs[thisSong[0]['album']]['songFilePaths'].push(directory + "/" + files[f])
                     global.songs["All Songs"]['songFilePaths'].push(directory + "/" + files[f])
            global.songs[thisSong[0]['album']]["duration"] += thisSong[1]['duration']
                     global.songs["All Songs"]['duration'] += thisSong[1]['duration']
            global.songs[thisSong[0]['album']]["songCount"]++;
                     global.songs["All Songs"]['songCount']++;
            
            // if the songs 'albumartist' isnt in the albums artist list, add them
            if (!global.songs[thisSong[0]['album']]['artists'].includes(thisSong[0]['albumartist'])) {
                global.songs[thisSong[0]['album']]['artists'].push(thisSong[0]['albumartist']);
            }

            if (global.songs[thisSong[0]['album']]['albumArt'] == './assets/none.png' && thisSong[0]['picture']) {
                global.songs[thisSong[0]['album']]['albumArt'] = getSongImage(thisSong);
            } else if (global.songs[thisSong[0]['album']]['albumArt'] == './assets/none.png') {
                global.songs[thisSong[0]['album']]['extraText'] = thisSong[0]['album']
            } else {
                global.songs[thisSong[0]['album']]['extraText'] = null
            }

            if (thisSong[0]['picture']) {
                thisSong[0]['picture'] = getSongImage(thisSong);
            } else {
                thisSong[0]['picture'] = "./assets/unknown.png";
            }
        } //else if (files[f] == ".ssbu-music") {
            //parseFolderDataFile(files[f])
        //}
    }
    return true;
    //hasLoadedSongs = true;
}

function skipFolder(path) {
    let symbols = ['!', '#', '//', '-', '$']
    for (sym in symbols) {
        if (path.startsWith(symbols[sym])) {
            return true
        }
    }
    return false
}

async function loadSongsFromMusicFolder() {
    //debugger
    await loadSongsFromFolder(platFolders.getMusicFolder());
    //await loadSongsFromFolder(platFolders.getMusicFolder()).then(loadAlbums());
    if (fs.existsSync(platFolders.getMusicFolder() + "/folders.ssbu-music")) {
        let file = fs.readFileSync(platFolders.getMusicFolder() + "/folders.ssbu-music", {encoding: "utf-8"})
        let folders = file.split("\r\n")
        for (f in folders) {
            if (fs.existsSync(folders[f]) && !skipFolder(folders[f])) {
                if (folders[f].startsWith("%")) {
                    await loadSongsFromFolder(folders[f].split("%",2)[1], true);
                } else {
                    await loadSongsFromFolder(folders[f], false);
                }
            }
        }
    }
    //await loadAlbums();
    //await loadPlaylists();
    return true
}

exports.loadSongsFromMusicFolder = loadSongsFromMusicFolder;
exports.loadSongsFromFolder = loadSongsFromFolder;