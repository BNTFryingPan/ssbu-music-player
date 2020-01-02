var playlists = {
    "example playlist": {
        "songs": [
            {"type":"yt","url":"url would be here","title":"Video Title","duration":1},
            {"type":"file","dir":"path/to/file"}
        ],
        "songCount": 2,
        "duration": 0
    }
}

function savePlaylists() {
    alert("wip")
}

async function openPlaylist() {
    console.log(nowPlaying['openedAlbum'])
    if (nowPlaying['openedPlaylist'] != albumName) {
        document.getElementById('song-list-tbody').innerHTML = "";
        document.getElementById('album-info-header-img').src = songs[albumName]['albumArt']
        document.getElementById('album-info-header-thing-text').innerHTML = songs[albumName]['songs'].length.toString() + " " + fancyTimeFormat(songs[albumName]['duration'], true)
        for (song in songs[albumName]["songs"]) {
            document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation']);
        }
        nowPlaying['openedAlbum'] = albumName
    }
    document.getElementById('body').setAttribute('data-currentLayer', "song-list")
    document.getElementById('album-list').style.display = "none"
    document.getElementById('song-list').style.display = "block"
}

async function loadPlaylists() {
    var plList = document.getElementById('playlist-list');
    plList.innerHTML = ""
    //console.log(JSON.stringify(songs))
    for (var pl in playlists) {
        //console.log(alb)
        //console.log("<div class='album select-hover-anim' style='background-image:" + songs[alb]['albumArt'] + "></div>");
        plList.innerHTML += "<button type='button' class='" + classes + "' onclick='openPlaylist(\"" + pl + "\")'></button>";
        //console.log(albList.innerHTML);
    }
    return true;
}