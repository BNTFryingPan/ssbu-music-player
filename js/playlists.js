var playlists = {
    "%example playlist": {
        "songs": [
            {"type":"yt","url":"url would be here","title":"Video Title","duration":1},
            {"type":"file","dir":"path/to/file"}
        ],
        "songCount": 2,
        "duration": 0,
        "showName": false,
    }
}

function savePlaylists() {
    alert("wip")
}

function createSongListEntryForYouTubeSource(plSong) {
    return "<tr><td></td><td>YT</td><td>" + plSong['title'] + "</td><td>" + plSong['duration'] +  "</td></tr>"
}

async function createSongPlaylistEntryFromSongData(fileLocation, extraCode) {
    let data = await getSongData(fileLocation);
    let songData = data[0];
    let metaData = data[1];
    
    return "<tr onclick=\"playSongFromFile('" + fileLocation.replaceAll("'", "\\'") + "');" + extraCode + "\"><td></td><td>" + songData['track']['no'] + "</td><td>" + songData['album'] + "</td><td>" + songData['title'] + "</td><td>" + songData['duration'] +  "</td></tr>"
}

async function createSongPlaylistEntry(plSong) {
    if (plSong['type'] == "file") {
        return createSongPlaylistEntryFromSongData(plSong['dir'], "updateCurrentShuffleSource({type:'playlist',name:'" + plSong['playlist'] + "'})");
    } else if (plSong['type'] == "yt") {
        return createSongListEntryForYouTubeSource(plSong);
    }
}

async function openPlaylist(playlistName) {
    if (playlistName.startsWith("%")) { return }
    if (nowPlaying['openedPlaylist'] != playlistName) {
        document.getElementById('pl-song-list-tbody').innerHTML = "";
        document.getElementById('album-info-header-img').src = "./assets/other-album.png"
        document.getElementById('album-info-header-thing-text').innerHTML = playlistName + " " + fancyTimeFormat(playlists[playlistName]['duration'], true)
        for (song in playlists[playlistName]["songs"]) {
            document.getElementById('pl-song-list-tbody').innerHTML += await createSongPlaylistEntry(playlists[playlistName]["songs"][song]);
        }
        nowPlaying['openedPlaylist'] = playlistName
    }
    document.getElementById('body').setAttribute('data-currentLayer', "playlist-song-list")
    document.getElementById('playlist-list').style.display = "none"
    document.getElementById('pl-song-list').style.display = "block"
}

async function loadPlaylists() {
    var plList = document.getElementById('playlist-list');
    plList.innerHTML = ""
    for (var pl in playlists) {
        let art = playlists[pl]["art"] || "./assets/none.png"
        plList.innerHTML += "<button type='button' class='album select-hover-anim' style='background-image:url(" + art.replaceAll(" ", "%20") + ")' value='" + pl + "' onclick='openPlaylist(\"" + pl + "\")'>" + (playlists[pl]["showName"] ? pl : "") + "</button>";
    }
    return true;
}