async function openAlbum(albumName) {
    document.getElementById('song-list-tbody').innerHTML = "";
    document.getElementById('body').setAttribute('data-currentLayer', "song-list")
    document.getElementById('album-info-header-img').src = songs[albumName]['albumArt']
    for (song in songs[albumName]["songs"]) {
        document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(songs[albumName]['songs'][song][0]['fileLocation']);
    }
    document.getElementById('album-list').style.display = "none"
    document.getElementById('song-list').style.display = "block"
    //document.querySelector("#album-info-header-thing ::before").style.content = fancyTimeFormat(songs[albumName]['duration'])
    document.getElementById('album-info-header-thing-text').innerHTML = songs[albumName]['songs'].length.toString() + " " + fancyTimeFormat(songs[albumName]['duration'], true)
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
            var extraText = "."
            var classes = "album select-hover-anim hide-text"
        }
        //console.log(alb)
        //console.log("<div class='album select-hover-anim' style='background-image:" + songs[alb]['albumArt'] + "></div>");
        albList.innerHTML += "<button class='" + classes + "' onclick='openAlbum(\"" + alb + "\")' style='background-image:url(" + songs[alb]['albumArt'] + ")'>" + extraText + "</button>";
        //console.log(albList.innerHTML);
    }
}