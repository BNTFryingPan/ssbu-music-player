async function openAlbum(albumName) {
    var path = "null";
    for (song in songs[albumName]['songs']) {
        path = songs[albumName]['songs'][song][0]['folder']
        break
    }

    function hideAlbumLayer() {
        document.getElementById('body').setAttribute('data-currentLayer', "song-list")
        document.getElementById('album-list').style.display = "none"
        document.getElementById('song-list').style.display = "block"
        document.getElementById('album-info-header-img').src = songs[albumName]['albumArt'];
        document.getElementById('album-info-header-thing-text').innerHTML = Object.keys(songs[albumName]['songs']).length.toString() + " - " + fancyTimeFormat(songs[albumName]['duration'], true);
        nowPlaying['openedAlbum'] = albumName
    }
    
    if (nowPlaying['openedAlbum'] != albumName) {
        let updatedHTML = "";
        for (song in songs[albumName]["songs"]) {
            updatedHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation']);
        }

        document.getElementById('song-list-tbody').innerHTML = updatedHTML;
        hideAlbumLayer()
    } else {
        hideAlbumLayer()
    }
    

    nowPlaying['currentPage'] = "Music - " + albumName
    //document.querySelector("#album-info-header-thing ::before").style.content = fancyTimeFormat(songs[albumName]['duration'])

    setTimeout(updateScrollbar, 0);
}

async function loadAlbums() {
    var albList = document.getElementById('album-list');
    albList.innerHTML = ""
    for (var alb in songs) {
        if (songs[alb]["extraText"]) {
            var extraText = songs[alb]["extraText"]
            var classes = "album select-hover-anim"
        } else {
            var extraText = ""
            var classes = "album select-hover-anim hide-text"
        }
        albList.innerHTML += "<button type='button' id='album-list-album-" + alb.toLowerCase() + "' value='" + extraText + "' class='" + classes + "' onclick='openAlbum(\"" + alb + "\")' style='background-image:url(" + songs[alb]['albumArt'] + ")'>" + extraText + "</button>";
    }
    if (songs['Other']['songCount'] === 0) {
        document.getElementById("album-list-album-other").style.display = "none";
    } else {
        document.getElementById("album-list-album-other").style.display = "block";
    }
    return true;
}

