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
            updatedHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation'], "updateCurrentShuffleSource({type:'album',name:'" + albumName + "'})", albumName == "All Songs");
        }

        document.getElementById('song-list-tbody').innerHTML = updatedHTML;
        updatePlayingSongInSongLists();
    }
    hideAlbumLayer()
    

    nowPlaying['currentPage'] = "Music - " + albumName
    //document.querySelector("#album-info-header-thing ::before").style.content = fancyTimeFormat(songs[albumName]['duration'])

    setTimeout(updateScrollbar, 0);
    dispatchEvent("OPENALBUM", {"name": albumName})
}

async function loadAlbums() {
    var albList = document.getElementById('album-list');
    albList.innerHTML = ""
    for (var alb in songs) {
        var classes = "album select-hover-anim hide-text"
        if (songs[alb]["extraText"]) classes = "album select-hover-anim"
        
        let extraStyle = ["./assets/none.png", "./assets/all-album.png", "./assets/other-album.png"].includes(songs[alb]["albumArt"]) ? "border-radius:50%" : "border-radius:5%";
        albList.innerHTML += `<button type='button' id='album-list-album-${alb.toLowerCase()}' value='${songs[alb]["extraText"] || ""}' class='${classes}' onclick='openAlbum("${alb}")' style='background-image:url(${songs[alb]['albumArt']});${extraStyle}'>${songs[alb]["extraText"] || ""}</button>`;
    }
    document.getElementById("album-list-album-other").style.display = songs['Other']['songCount'] === 0 ? "none" : "block";

    return true;
}

