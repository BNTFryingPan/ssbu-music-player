const fs = require('fs');
const mm = require('music-metadata');
const util = require('util');
const platFolders = require('platform-folders');

function fancyTimeFormat(time, forceHours)
{   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        if (hrs <= 9 && forceHours) {
            ret = "0" + ret
        }
    } else if (forceHours) {
        ret += "00:";
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}



function updateTitle(text) {
    document.getElementById('window-title-text').innerHTML = text
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

