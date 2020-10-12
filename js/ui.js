//fs = require('fs');
const mm = require('music-metadata');
const util = require('util');
const platFolders = require('platform-folders');
const exec = require('child_process').exec
const remote = require('electron').remote;

var song = document.getElementById('song')

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

function updateShuffleModeText() {
    let states = {"shuffleall": "Shuffle All", "shufflealbum": "Shuffle Album", "loop": "Loop", "order": "Order"}
    document.getElementById('shuffle-state').innerHTML = states[nowPlaying['shuffleMode']] || "Unknown";
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
        document.getElementById('album-list').style.display = "none";
        document.getElementById('song-list').style.display = "none";
        document.getElementById('back-button').style.display = "none";
        document.getElementById("services").style.display = "none";
        document.getElementById("no-songs-notice").style.display = "none"
    } else {
        document.getElementById('top-menu').style.display = "none";
        document.getElementById('now-playing').hidden = false;
        document.getElementById('back-button').style.display = "flex";
    }
    setTimeout(updateScrollbar, 0);
}


function openMusicMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "album-list")
    if (songs['All Songs']['songCount'] > 0) {
        document.getElementById('album-list').style.display = "flex"
    } else {
        document.getElementById("no-songs-notice").style.display = "block"
    }
    document.getElementById('list-container').style.display = "block"
    document.getElementById('normal').hidden = false;
    nowPlaying['currentPage'] = "Music Page"
    updateTitle("Vault > Sounds > Music")
    setTimeout(updateScrollbar, 0);
}

function setSettingsOpenState(state) {
    if (state) {
        //document.getElementById('body').setAttribute('data-prevLayer', document.getElementById('body').getAttribute('data-currentLayer'))
        document.getElementById('body').setAttribute('data-settingsOpen', "true")
        document.getElementById('top-settings').style.display = "block";
        nowPlaying['currentPage'] = "Settings"
    } else {
        document.getElementById('body').setAttribute('data-settingsOpen', "false")
        document.getElementById('top-settings').style.display = "none";
    }
}

function openPlaylistMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "playlist-menu")
    document.getElementById('playlist-list').style.display = "block"
    document.getElementById('list-container').style.display = "block"
    document.getElementById('normal').hidden = false;
    nowPlaying['currentPage'] = "Playlists"
    updateTitle("Vault > Sounds > Playlists")
    setTimeout(updateScrollbar, 0);
}

function openServicesMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "services-menu")
    document.getElementById('services').style.display = "block"
    document.getElementById('list-container').style.display = "block"
    document.getElementById('normal').hidden = false;
    nowPlaying['currentPage'] = "Playlists"
    updateTitle("Vault > Sounds > Playlists")
    setTimeout(updateScrollbar, 0);
}

function openFoldersFile() {
    exec(platFolders.getMusicFolder() + "/folders.ssbu-music")
}

function toggleSongInfoModal(state) {
    var modal = document.getElementById('advanced-song-info-modal');
    if (state == true) {
        modal.style.display = "block";
        //document.getElementById('body').setAttribute('data-prevLayer', document.getElementById('body').getAttribute('data-currentLayer'))
        document.getElementById('body').setAttribute('data-songInfoOpen', "true")
    } else if (state == false) {
        modal.style.display = "none";
        document.getElementById('body').setAttribute('data-songInfoOpen', "false")
    } else {
        if (modal.style.display == "none") {
            modal.style.display = "block"
            //document.getElementById('body').setAttribute('data-prevLayer', document.getElementById('body').getAttribute('data-currentLayer'))
            document.getElementById('body').setAttribute('data-songInfoOpen', "true")
        } else {
            modal.style.display = "none"
            document.getElementById('body').setAttribute('data-songInfoOpen', "false")
        }
    }
}

function updateNormalizationState(state) {
    if (state) {
        userSettings['normalizeVolume'] = true;
        try {
            connectAudioNormalizer()
        } catch {}
    } else {
        userSettings['normalizeVolume'] = false;
        try {
            disconnectAudioNormalizer();
        } catch {}
    }
}

function titlebar_min() {
    let win = remote.getCurrentWindow();
    win.minimize();
}

function titlebar_close() {
    window.close();
}

function titlebar_maxres() {
    let win = remote.getCurrentWindow();
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
}

function titlebar_back() {
    var curLayer = document.getElementById('body').getAttribute('data-currentLayer');
    var settingsOpen = document.getElementById('body').getAttribute('data-settingsOpen') == "true";
    var songInfoOpen = document.getElementById('body').getAttribute('data-songInfoOpen') == "true";
    
    if (settingsOpen) {
        setSettingsOpenState(false);
    } else if (songInfoOpen) {
        toggleSongInfoModal(false);
    } else if (['album-list', 'playlist-menu', 'services-menu'].includes(curLayer)) {
        setTopMenuVisible(true);
    } else if (curLayer == 'song-list') {
        document.getElementById('album-list').style.display = "flex";
        document.getElementById('song-list').style.display = "none"
        document.getElementById('body').setAttribute('data-currentLayer', "album-list")
        nowPlaying['currentPage'] = "Music Page"
        setTimeout(updateScrollbar, 0);
    } else {
        return;
    }
}

function titlebar_settings() {
    if (document.getElementById('top-settings').style.display == "none") {
        setSettingsOpenState(true)
    } else {
        setSettingsOpenState(false)
    }
}

function settings_acrylic() {
    state = document.getElementById('settings-acrylic').checked;

    if (state) {
        ipcRenderer.send("acrylic");
    } else {
        ipcRenderer.send("disable");
    }
}

function settings_updateCheck() {
    ipcRenderer.send("updateCheck");
}

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        handleWindowControls();
        document.getElementById('min-button').onclick = function() {
            titlebar_min()
        };
        
        document.getElementById('max-button').onclick = function() {
            titlebar_maxres()
        };
        
        document.getElementById('restore-button').onclick = function() {
            titlebar_maxres()
        };
        
        document.getElementById('close-button').onclick = function() {
            titlebar_close()
        };

        document.getElementById('back-button').onclick = function() {
            titlebar_back()
        };

        document.getElementById('settings-button').onclick = function() {
            titlebar_settings()
            
        };

        document.getElementById('settings-acrylic').onclick = function() {
            settings_acrylic()
        }
        
        document.getElementById('settings-update').onclick = function() {
            settings_updateCheck();
        }

        //update windows styles
        var userAccentColor = remote.systemPreferences.getAccentColor().substr(0,6);
        document.documentElement.style.setProperty("--user-accent-color", "#" + userAccentColor);
    }
    
};

function handleWindowControls() {
    let win = remote.getCurrentWindow();
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        setTimeout(updateScrollbar, 0);
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}

function updateScrollbar() {
    let list = document.getElementById("list-container")
    let bar = document.getElementById("list-container-scrollbar")
    bar.value = list.scrollTop;
    bar.max = list.scrollHeight - list.clientHeight;
    bar.hidden = (list.scrollHeight == list.clientHeight)
}

document.getElementById("list-container").addEventListener("scroll", updateScrollbar, {passive: true})

document.getElementById("list-container-scrollbar").oninput = function(e) {
    let list = document.getElementById("list-container")
    let bar = document.getElementById("list-container-scrollbar")
    list.scrollTop = bar.value;
    bar.max = list.scrollHeight - list.clientHeight;
    console.log("input")
}

window.onbeforeunload = function(){
    let win = remote.getCurrentWindow();
    win.removeAllListeners()
    //document.getElementById('max-button').onclick = undefined
    //document.getElementById('restore-button').onclick = undefined
}

loadSongsFromMusicFolder()

//song controls:

