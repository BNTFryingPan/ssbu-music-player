async function openAlbum(albumName) {
    console.log(nowPlaying['openedAlbum'])
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
        let attemptedLoad = loadAlbumHtmlFromFile(path, albumName);
        if (attemptedLoad != false) {
            document.getElementById('song-list-tbody').innerHTML = attemptedLoad;
            hideAlbumLayer()
        }
        let updatedHTML = "";
        for (song in songs[albumName]["songs"]) {
            updatedHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation']);
        }
        saveAlbumHtmlToFile(path, albumName, updatedHTML)

        if (attemptedLoad === false) {
            document.getElementById('song-list-tbody').innerHTML = updatedHTML;
            hideAlbumLayer()
        }
    }
    

    nowPlaying['currentPage'] = "Music - " + albumName
    //document.querySelector("#album-info-header-thing ::before").style.content = fancyTimeFormat(songs[albumName]['duration'])

    setTimeout(updateScrollbar, 0);
}

async function loadAlbums() {
    var albList = document.getElementById('album-list');
    albList.innerHTML = ""
    //console.log(JSON.stringify(songs))
    for (var alb in songs) {
        if (songs[alb]["extraText"]) {
            var extraText = songs[alb]["extraText"]
            var classes = "album select-hover-anim"
        } else {
            var extraText = ""
            var classes = "album select-hover-anim hide-text"
        }
        //console.log(alb)
        //console.log("<div class='album select-hover-anim' style='background-image:" + songs[alb]['albumArt'] + "></div>");
        albList.innerHTML += "<button type='button' value='" + extraText + "' class='" + classes + "' onclick='openAlbum(\"" + alb + "\")' style='background-image:url(" + songs[alb]['albumArt'] + ")'>" + extraText + "</button>";
        //console.log(albList.innerHTML);
    }
    return true;
}

