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
                    "songs": [],
                    "duration": 0
                }
            }

            songs[thisSong[0]['album']]['songs'].push(thisSong)
            songs[thisSong[0]['album']]["duration"] += thisSong[1]['duration']
            songs["All Songs"]['songs'].push(thisSong);
            songs["All Songs"]['duration'] += thisSong[1]['duration']


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