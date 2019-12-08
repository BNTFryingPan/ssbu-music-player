var fs = require('fs');
var mm = require('music-metadata');
var util = require('util');

// Here we will store loaded songs so we can sort them into the album list
var songs = {
    "Other": {
        "albumArt": './songs/Album Art/unknown.png',
        "artists": ['nobody', 'a boomer'], // this would have all songData['albumartist']'s in it
        "songs": [
            // this would be the raw song data of a song
        ]
    }
}

function loadAlbums() {
    var albList = document.getElementById('album-list');

    for (var alb in songs) {
        console.log(alb)
        albList.innerHTML += "<div class='album select-hover-anim' style='background-image:" + songs[alb]['albumArt'] + "></div>"
    }
}

function fancyTimeFormat(time)
{   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

async function loadSongsFromFolder() {
    var files = fs.readdirSync("./electron/music-player/songs");
    for (var f in files) {
        if (files[f].endsWith('.mp3')) {
            //document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(files[f]);
            var thisSong = await getSongData(files[f]);
            if (!(songs[thisSong[0]['album']])) {
                songs[thisSong[0]['album']] = {
                    "albumArt": "unknown",
                    "artists": [],
                    "songs": []
                }
            }

            songs[thisSong[0]['album']]['songs'].push(thisSong)


            // if the songs 'albumartist' isnt in the albums artist list, add them
            if (!songs[thisSong[0]['album']]['artists'].includes(thisSong[0]['albumartist'])) {
                songs[thisSong[0]['album']]['artists'].push(thisSong[0]['albumartist'])
            }
        }
    }
}

function updateTitle(text) {
    document.getElementById('window-title-text').innerHTML = text
}

async function playSong(file) {
    songData = await getSongData(file);
    console.log(songData)

    audioElem = document.getElementById('song');
    audioElem.src = "./songs/" + file;
    audioElem.play();

    document.getElementById('now-playing').classList.remove('no-song')
    var picture = songData[0]['picture']
    var hasPicture = false;
    if (picture) {
        picture = picture[0]
        if (picture) {
            document.getElementById('song-info-art').src = `data:${picture.format};base64,${picture.data.toString('base64')}`;
            hasPicture = true;
        }
    }
    if (!hasPicture) {
        //TODO: load a 'unknown' art preview
        document.getElementById('song-info-art').src = "./songs/Album Art/unknown.png"
    }
    document.getElementById('song-info-title').innerHTML  = songData[0]['title'];
    document.getElementById('song-info-album').innerHTML  = songData[0]['album'];
    document.getElementById('song-info-artist').innerHTML = songData[0]['artist'];
}

async function createSongListEntryFromSongData(fileName) {
    var entry = "";
    var songData = null;
    var metaData = null
    //console.log(fileName);
    data = await getSongData(fileName);
    songData = data[0];
    metaData = data[1];
    
    songData['duration'] = fancyTimeFormat(metaData["duration"])
    //<div class='song-entry'>
        //<span class="uiassetfont"></span>
        //<span>Example Song</span>
        //<span class="entry-duration">0:00</span>
    //</div>
    entry = "<tr onclick='playSong(\"" + fileName + "\")'><td></td><td>" + songData['track']['no'] + "</td><td>" + songData['title'] + "</td><td>" + songData['duration'] +  "</td></tr>"
    //console.log(songData['track'])
    return entry
}

async function getSongData(fileName) {
    var songData = null;
    var metaData = null;
    await mm.parseFile('./electron/music-player/songs/' + fileName, {duration: true}).then(metadata => {songData = metadata['common']; metaData = metadata['format']});
    if (!songData['title']) {
        var title = fileName.split('/')[fileName.split('/').length - 1].split('.mp3')[0];
        console.log(title);
        songData['title'] = title
    }

    if (!songData['track']["no"]) {
        songData['track']["no"] = "--"
    }

    if (!songData['album']) {
        songData['album'] = "Other"
    }

    if (!songData['artist']) {
        songData['artist'] = "Unknown"
    }
    console.log(songData)
    return [songData, metaData];
}

function setTopMenuVisible(visibile) {
    if (visibile) {
        document.getElementById('top-menu').style.display = 'block';
        updateTitle("Vault > Sounds")
        document.getElementById('normal').hidden = true;
        document.getElementById('now-playing').hidden = true;
    } else {
        document.getElementById('top-menu').style.display = "none";
        document.getElementById('now-playing').hidden = false;
    }
}

function openMusicMenu() {
    setTopMenuVisible(false);
    document.getElementById('album-list').hidden = false
    document.getElementById('normal').hidden = false;
    updateTitle("Vault > Sounds > Music")
}

function setSettingsOpenState(state) {
    if (state) {
        document.getElementById('top-settings').style.display = "block";
    } else {
        document.getElementById('top-settings').style.display = "none";
    }
}

function openPlaylistMenu() {
    setTopMenuVisible(false);
    updateTitle("Vault > Sounds > Playlists")
}

function openServicesMenu() {
    setTopMenuVisible(false);

}

loadSongsFromFolder();