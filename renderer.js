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
        document.getElementById('min-button').addEventListener("click", event => {
            let win = remote.getCurrentWindow();
            win.minimize();
        });
        
        document.getElementById('max-button').addEventListener("click", event => {
            let win = remote.getCurrentWindow();
            win.maximize();
        });
        
        document.getElementById('restore-button').addEventListener("click", event => {
            let win = remote.getCurrentWindow();
            win.unmaximize();
        });
        
        document.getElementById('close-button').addEventListener("click", event => {
            window.close();
        });

        document.getElementById('back-button').addEventListener("click", event => {
            if (document.getElementById('top-settings').style.display != "none") {
                setSettingsOpenState(false)
            } else {
                setTopMenuVisible(true)
            }
        });

        document.getElementById('settings-button').addEventListener("click", event => {
            if (document.getElementById('top-settings').style.display == "none") {
                setSettingsOpenState(true)
            } else {
                setSettingsOpenState(false)
            }
            
        });

        document.getElementById('settings-acrylic').addEventListener("click", event => {
            state = document.getElementById('settings-acrylic').checked;

            if (state) {
                ipcRenderer.send("acrylic")
            } else {
                ipcRenderer.send("disable")
            }
        })
        

        //update windows styles
        var userAccentColor = remote.systemPreferences.getAccentColor().substr(0,6);
        document.documentElement.style.setProperty("--user-accent-color", "#" + userAccentColor)
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