async function openAlbum(albumName) {
    console.log(nowPlaying['openedAlbum'])
    if (nowPlaying['openedAlbum'] != albumName) {
        document.getElementById('song-list-tbody').innerHTML = "";
        document.getElementById('album-info-header-img').src = songs[albumName]['albumArt']
        document.getElementById('album-info-header-thing-text').innerHTML = Object.keys(songs[albumName]['songs']).length.toString() + " " + fancyTimeFormat(songs[albumName]['duration'], true)
        for (song in songs[albumName]["songs"]) {
            document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation']);
        }
        nowPlaying['openedAlbum'] = albumName
    }
    document.getElementById('body').setAttribute('data-currentLayer', "song-list")
    document.getElementById('album-list').style.display = "none"
    document.getElementById('song-list').style.display = "block"

    nowPlaying['currentPage'] = "Music - " + albumName
    //document.querySelector("#album-info-header-thing ::before").style.content = fancyTimeFormat(songs[albumName]['duration'])
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

