// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const remote = require('electron').remote;
const { ipcRenderer } = require('electron');



// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        handleWindowControls();
        document.getElementById('min-button').onclick = function(event) {
            let win = remote.getCurrentWindow();
            win.minimize();
        };
        
        document.getElementById('max-button').onclick = function(event) {
            let win = remote.getCurrentWindow();
            win.maximize();
        };
        
        document.getElementById('restore-button').onclick = function(event) {
            let win = remote.getCurrentWindow();
            win.unmaximize();
        };
        
        document.getElementById('close-button').onclick = function(event) {
            window.close();
        };

        document.getElementById('back-button').onclick = function(event) {
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
            } else {
                return;
            }
        };

        document.getElementById('settings-button').onclick = function(event) {
            if (document.getElementById('top-settings').style.display == "none") {
                setSettingsOpenState(true)
            } else {
                setSettingsOpenState(false)
            }
            
        };

        document.getElementById('settings-acrylic').onclick = function(event) {
            state = document.getElementById('settings-acrylic').checked;

            if (state) {
                ipcRenderer.send("acrylic")
            } else {
                ipcRenderer.send("disable")
            }
        }
        

        //update windows styles
        var userAccentColor = remote.systemPreferences.getAccentColor().substr(0,6);
        document.documentElement.style.setProperty("--user-accent-color", "#" + userAccentColor);
    }
    
};

function handleWindowControls() {

    let win = remote.getCurrentWindow();
    // Make minimise/maximise/restore/close buttons work when they are clicked
    

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
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