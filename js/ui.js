const fs = require('fs');
const mm = require('music-metadata');
const util = require('util');
const platFolders = require('platform-folders');

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
    } else {
        document.getElementById('top-menu').style.display = "none";
        document.getElementById('now-playing').hidden = false;
        document.getElementById('back-button').style.display = "flex";
    }
}

function openMusicMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "album-list")
    document.getElementById('album-list').style.display = "flex"
    document.getElementById('list-container').style.display = "block"
    document.getElementById('normal').hidden = false;
    nowPlaying['currentPage'] = "Music Page"
    updateTitle("Vault > Sounds > Music")
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
}

function openServicesMenu() {
    setTopMenuVisible(false);
    document.getElementById('body').setAttribute('data-currentLayer', "services-menu")
    document.getElementById('services').style.display = "block";
    document.getElementById('normal').hidden = false;
    document.getElementById('list-container').style.display = "none"
    nowPlaying['currentPage'] = "Services"
    updateTitle("Vault > Sounds > Services")
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

const remote = require('electron').remote;
const { ipcRenderer } = require('electron');

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
        ipcRenderer.send("acrylic")
    } else {
        ipcRenderer.send("disable")
    }
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
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}

window.onbeforeunload = function(){
    let win = remote.getCurrentWindow();
    win.removeAllListeners()
    //document.getElementById('max-button').onclick = undefined
    //document.getElementById('restore-button').onclick = undefined
}

loadSongsFromMusicFolder()

//song controls:

