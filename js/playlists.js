var playlists = {}

function createSongListEntryForYouTubeSource(plSong) {
    return "<tr><td></td><td>YT</td><td>" + plSong['title'] + "</td><td>" + plSong['duration'] +  "</td></tr>"
}

function openAddToPlaylistMenu(state) {
    let menu = document.getElementById('song-info-addtopl');
    state = state || (menu.style.display == "none")
    if (state) toggleSongInfoModal(false);
    menu.style.display = (state ? "block" : "none")
    document.getElementById('body').setAttribute('data-atpMenuOpen', (state ? "true" : "false"))
    let plSelect = document.getElementById('atp-select-pl');
    plSelect.innerHTML = ""
    for (pl in playlists) {
        plSelect.innerHTML += "<option value='" + pl + "'>" + pl + "</option>"
    }
    plSelect.innerHTML += "<option value='%new'>New Playlist</option>"
}

function addSongToPlaylistButton() {
    let plToAddTo = document.getElementById('atp-select-pl').value
    if (plToAddTo === "%new") {
        let newPlName = document.getElementById('atp-new-pl-name').value;
        if (newPlName === "%new") {
            alert("invalid playlist name");
            return;
        } else {
            playlists[newPlName] = {"songs": [], "name": newPlName, "songCount": 0, "duration": 0, "showName": true}
            plToAddTo = newPlName;
            document.getElementById("playlist-list").innerHTML += "<button type='button' class='album select-hover-anim' style='background-image:url(./assets/none.png);border-radius:50%' value='" + newPlName + "' onclick='openPlaylist(\"" + newPlName + "\")'>" + newPlName + "</button>";
        }
    }
    playlists[plToAddTo]["songs"].push({"type":"file","dir":nowPlaying["song"]["data"][0]["fileLocation"],"playlist":plToAddTo});
    playlists[plToAddTo]["songCount"]++;
    playlists[plToAddTo]["duration"] += nowPlaying["song"]["data"][1]["duration"];
    savePlaylistsToFile()
}

async function createSongPlaylistEntryFromSongData(fileLocation, extraCode) {
    let data = await getSongData(fileLocation);
    let songData = data[0];
    let metaData = data[1];
    
    return "<tr onclick=\"playSongFromFile('" + fileLocation.replaceAll("'", "\\'") + "');" + extraCode + "\"><td></td><td>" + songData['track']['no'] + "</td><td>" + songData['title'] + "</td><td>" + songData['album'] + "</td><td>" + songData['duration'] +  "</td></tr>"
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
    if (true || (nowPlaying['openedPlaylist'] != playlistName)) {
        document.getElementById('pl-song-list-tbody').innerHTML = "";
        document.getElementById('album-info-header-img').src = playlists[playlistName]["art"] || "./assets/unknown.png"
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
    loadPlaylistsFromFile()
    var plList = document.getElementById('playlist-list');
    plList.innerHTML = ""
    for (var pl in playlists) {
        let art = playlists[pl]["art"] || "./assets/none.png"
        let extraStyle = ["./assets/none.png", "./assets/all-album.png", "./assets/other-album.png"].includes(art) ? "border-radius:50%" : "border-radius:5%";
        plList.innerHTML += "<button type='button' class='album select-hover-anim' style='background-image:url(" + art.replaceAll(" ", "%20") + ");" + extraStyle + "' value='" + pl + "' onclick='openPlaylist(\"" + pl + "\")'>" + (playlists[pl]["showName"] ? pl : "") + "</button>";
    }
    return true;
}