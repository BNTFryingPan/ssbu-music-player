const fs = require('fs');
const mm = require('music-metadata');
const util = require('util');
const platFolders = require('platform-folders');

// Here we will store loaded songs so we can sort them into the album list
var songs = {
    "All Songs": {
        "albumArt": "./other-album.png",
        "extraText": "All",
        "artists": [],
        "songs": []
    },
    "Other": {
        "albumArt": './other-album.png',
        "extraText": "Other",
        "artists": [], // this would have all songData['albumartist']'s in it
        "songs": [
            // this would be the raw song data of a song
        ]
    }
}

var nowPlaying = {
    "loop": false,
    "song": {
        "data": null,
        "index": 0
    },
    "shuffle": false
};

//var hasLoadedSongs = false;

async function loadAlbums() {
    var albList = document.getElementById('album-list');
    albList.innerHTML = ""
    //console.log(JSON.stringify(songs))
    for (var alb in songs) {
        if (songs[alb]["extraText"]) {
            var extraText = songs[alb]["extraText"]
            var classes = "album select-hover-anim"
        } else {
            var extraText = "."
            var classes = "album select-hover-anim hide-text"
        }
        //console.log(alb)
        //console.log("<div class='album select-hover-anim' style='background-image:" + songs[alb]['albumArt'] + "></div>");
        albList.innerHTML += "<button class='" + classes + "' onclick='openAlbum(\"" + alb + "\")' style='background-image:url(" + songs[alb]['albumArt'] + ")'>" + extraText + "</button>";
        //console.log(albList.innerHTML);
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

async function openAlbum(albumName) {
    document.getElementById('song-list-tbody').innerHTML = "";
    document.getElementById('body').setAttribute('data-currentLayer', "song-list")
    document.getElementById('album-info-header-img').src = songs[albumName]['albumArt']
    for (song in songs[albumName]["songs"]) {
        document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation']);
    }
    document.getElementById('album-list').style.display = "none"
    document.getElementById('song-list').style.display = "block"
}

async function loadSongsFromFolder(directory) {
    var files = fs.readdirSync(directory)
    //console.log(files)
    for (var f in files) {
        if (files[f].split('.').length == 1) {
            try {
                loadSongsFromFolder(directory + "/" + files[f])
            } catch (error) {
                console.log(files[f] + " doesnt have file extension, but isnt folder either!")
            }
        } else if (files[f].endsWith('.mp3')) {
            //document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(files[f]);
            var thisSong = await getSongData(directory + "/" + files[f]);
            if (!(songs[thisSong[0]['album']])) {
                songs[thisSong[0]['album']] = {
                    "albumArt": "./unknown.png",
                    "artists": [],
                    "songs": []
                }
            }

            songs[thisSong[0]['album']]['songs'].push(thisSong)
            songs["All Songs"]['songs'].push(thisSong)


            // if the songs 'albumartist' isnt in the albums artist list, add them
            if (!songs[thisSong[0]['album']]['artists'].includes(thisSong[0]['albumartist'])) {
                songs[thisSong[0]['album']]['artists'].push(thisSong[0]['albumartist']);
            }

            if (songs[thisSong[0]['album']]['albumArt'] == './unknown.png' && thisSong[0]['picture']) {
                songs[thisSong[0]['album']]['albumArt'] = getSongImage(thisSong);
            }
        }
    }
    //hasLoadedSongs = true;
}

async function loadSongsFromMusicFolder() {
    await loadSongsFromFolder(platFolders.getMusicFolder());
    await loadAlbums()
}

function updateTitle(text) {
    document.getElementById('window-title-text').innerHTML = text
}

function getSongImage(song) {
    var picture = song[0]['picture']
    var hasPicture = false;
    if (picture) {
        picture = picture[0]
        if (picture) {
            return `data:${picture.format};base64,${picture.data.toString('base64')}`;
        }
    }
    return "./unknown.png"
}

async function playSong(file) {
    //console.log("getting song data")
    songData = await getSongData(file);
    console.log(songData)
    //console.log("got song data!")

    //console.log("playing song")
    audioElem = document.getElementById('song');
    audioElem.src = file;
    audioElem.play();

    nowPlaying['song']['data'] = songData;
    nowPlaying['song']['index'] = songs['All Songs']['songs'].indexOf(songData)
    //console.log("song playing")

    document.getElementById('now-playing').classList.remove('no-song')
    document.getElementById('song-info-art').src = getSongImage(songData)
    document.getElementById('song-info-title').innerHTML  = songData[0]['title'];
    document.getElementById('song-info-album').innerHTML  = songData[0]['album'];
    document.getElementById('song-info-artist').innerHTML = songData[0]['artist'];

    document.getElementById('song-info-title2').innerHTML = songData[0]['title'] + " - " + songData[0]['album'] + " - " + songData[0]['artist'];
    document.getElementById('song-info-genre').innerHTML = songData[0]['genre'][0] + " - " + songData[0]['comment'][0];
    document.getElementById('song-info-line1').innerHTML = songData[0]['year'].toString() + " - " + songData[0]['duration'] + " - [" + songData[0]['disk']['no'] + "/" + songData[0]['disk']['of'] + "] - [" + songData[0]['track']['no'] + "/" + songData[0]['track']['of'] + "]";
    document.getElementById('song-info-line2').innerHTML = songData[1]["codec"] + " - " + songData[1]['container'] + " - lossless: " + songData[1]['lossless']
}

async function createSongListEntryFromSongData(fileLocation) {
    var entry = "";
    var songData = null;
    var metaData = null
    //console.log(fileName);
    data = await getSongData(fileLocation);
    songData = data[0];
    metaData = data[1];
    
    //songData['fileLocation'] = fileLocation;
    //<div class='song-entry'>
        //<span class="uiassetfont"></span>
        //<span>Example Song</span>
        //<span class="entry-duration">0:00</span>
    //</div>
    entry = "<tr onclick=\"playSong('" + fileLocation.replace("'", "\\'") + "')\"><td></td><td>" + songData['track']['no'] + "</td><td>" + songData['title'] + "</td><td>" + songData['duration'] +  "</td></tr>"
    //console.log(songData['track'])
    return entry
}

async function getSongData(fileName) {
    var songData = null;
    var metaData = null;
    //console.log(fileName)
    await mm.parseFile(fileName, {duration: true}).then(metadata => {songData = metadata['common']; metaData = metadata['format']});
    if (!songData['title']) {
        var title = fileName.split('/')[fileName.split('/').length - 1].split('.mp3')[0];
        //console.log(title);
        songData['title'] = title
    }

    if (!songData['track']["no"]) {
        songData['track']["no"] = "--"
    }

    if (!songData['track']['of']) {
        songData['track']['of'] = "--"
    }

    if (!songData['album']) {
        songData['album'] = "Other"
    }

    if (!songData['artist']) {
        songData['artist'] = "Unknown"
    }

    if (!songData['genre']) {
        songData['genre'] = ["Unknown"]
    }

    if (!songData['comment']) {
        songData['comment'] = ["No Comment"]
    }

    if (!songData['year']) {
        songData['year'] = 0
    }

    if (!songData["disk"]['no']) {
        songData['disk']["no"] = "-";
    }

    if (!songData['disk']['of']) {
        songData['disk']['of'] = "-"
    }

    songData['duration'] = fancyTimeFormat(metaData["duration"]);
    songData['fileLocation'] = fileName.replace("\\", "/"); //idk why, but i have to do this twice
    songData['fileLocation'] = songData['fileLocation'].replace("\\", "/")
    songData['fileLocation'] = songData['fileLocation'].replace("\\", "/")
    songData['fileLocation'] = songData['fileLocation'].replace("\\", "/")
    songData['fileLocation'] = songData['fileLocation'].replace("\\", "/")
    //songData['fileLocation'] = songData['fileLocation'].replace("'", "'")
    //console.log(songData)
    return [songData, metaData];
}

function setTopMenuVisible(visibile) {
    if (visibile) {
        document.getElementById('body').setAttribute('data-currentLayer', "top-menu")
        document.getElementById('top-menu').style.display = 'block';
        updateTitle("Vault > Sounds")
        document.getElementById('normal').hidden = true;
        document.getElementById('services').style.display = "none";
        document.getElementById('now-playing').hidden = true;
    } else {
        document.getElementById('top-menu').style.display = "none";
        document.getElementById('now-playing').hidden = false;
    }
}

function openMusicMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "album-list")
    document.getElementById('album-list').style.display = "block"
    document.getElementById('list-container').style.display = "block"
    document.getElementById('normal').hidden = false;
    updateTitle("Vault > Sounds > Music")
}

function setSettingsOpenState(state) {
    if (state) {
        document.getElementById('body').setAttribute('data-prevLayer', document.getElementById('body').getAttribute('data-currentLayer'))
        document.getElementById('body').setAttribute('data-currentLayer', "settings")
        document.getElementById('top-settings').style.display = "block";
    } else {
        document.getElementById('body').setAttribute('data-currentLayer', document.getElementById('body').getAttribute('data-prevLayer'))
        document.getElementById('top-settings').style.display = "none";
    }
}

function openPlaylistMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "playlist-menu")
    updateTitle("Vault > Sounds > Playlists")
    document.getElementById('list-container').style.display = "block"
    document.getElementById('normal').hidden = false;
}

function openServicesMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "services-menu")
    document.getElementById('services').style.display = "block";
    document.getElementById('normal').hidden = false;
    document.getElementById('list-container').style.display = "none"
    document.getElementById('album-list').style.display = "none";
    document.getElementById('song-list').style.display = "none";

}

function toggleSongInfoModal(state) {
    var modal = document.getElementById('advanced-song-info-modal');
    if (state == true) {
        modal.style.display = "block";
        document.getElementById('body').setAttribute('data-prevLayer', document.getElementById('body').getAttribute('data-currentLayer'))
        document.getElementById('body').setAttribute('data-currentLayer', "song-info-modal")
    } else if (state == false) {
        modal.style.display = "none";
        document.getElementById('body').setAttribute('data-currentLayer', document.getElementById('body').getAttribute('data-prevLayer'))
    } else {
        if (modal.style.display == "none") {
            modal.style.display = "block"
            document.getElementById('body').setAttribute('data-prevLayer', document.getElementById('body').getAttribute('data-currentLayer'))
            document.getElementById('body').setAttribute('data-currentLayer', "song-info-modal")
        } else {
            modal.style.display = "none"
            document.getElementById('body').setAttribute('data-currentLayer', document.getElementById('body').getAttribute('data-prevLayer'))
        }
    }
}

loadSongsFromMusicFolder()

//song controls:

function randomSong() {
    var songCount = songs['All Songs']['songs'].length;
    var randomSongIndex = parseInt(Math.random() * songCount);
    return songs['All Songs']['songs'][randomSongIndex];
}

function pauseSong(state) {
    if (state == true || state == false) {
        if (state) {
            document.getElementById('song').pause()
        } else {
            document.getElementById('song').play()
        }
    } else {
        if (document.getElementById('song').playing) {
            document.getElementById('song').pause()
        } else {
            document.getElementById('song').play()
        }
    }
}

function nextSong() {
    if (nowPlaying['loop']) {
        document.getElementById('song').currentTime = 0;
    } else {
        playSong(randomSong()[0]['fileLocation'])
    }
}

function prevSong() {
    if (document.getElementById('song').currentTime <= 3) {
        document.getElementById('song').currentTime = 0;
        alert('wip');
    } else {
        document.getElementById('song').currentTime = 0;
    }
}

function shuffleSongs() {
    
}

function songTick() {

}