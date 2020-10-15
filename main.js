// Modules to control application life and create native browser window
const {app, ipcMain, systemPreferences, dialog, globalShortcut} = require('electron');
const path = require('path');
const platfolders = require('platform-folders');
//const ewc = require('@svensken/ewc');
const { BrowserWindow } = require("electron-acrylic-window");
const { autoUpdater } = require("electron-updater");
const { checkForUpdates } = require("./updater")
const os = require("os");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
//let popupWindow;

function isWindows10() {
    if (process.platform !== 'win32') return false;
    return os.release().split('.')[0] === '10';
}

function getVibrancySettings() {
    if (isWindows10()) return {
        theme: '#22222222',
        effect: 'acrylic',
        useCustomWindowRefreshMethod: true,
        disableOnBlur: true,
        debug: true
    };
    else return 'dark';
}

function createWindow () {
    // Create the browser window.
    

    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        minWidth: 550, 
        minHeight: 475,
        //transparent: true,
        //backgroundColor: '#fff',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            //webSecurity: false
        },
        //backgroundColor: '#44444444',
        vibrancy: getVibrancySettings(),
        frame: false
    })
    //ewc.setAcrylic(mainWindow, 0x14800020);

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null
    });

    globalShortcut.register("MediaPlayPause",     keybind_pauseplay);
    globalShortcut.register("MediaStop",          keybind_stop);
    globalShortcut.register("MediaNextTrack",     keybind_next);
    globalShortcut.register("MediaPreviousTrack", keybind_prev);
}

function keybind_pauseplay() { mainWindow.webContents.send("updateState", "playpause");console.log("playpause"); };
function keybind_stop()      { mainWindow.webContents.send("updateState", "stop");console.log("stop"); };
function keybind_prev()      { mainWindow.webContents.send("updateState", "prev");console.log("prev"); };
function keybind_next()      { mainWindow.webContents.send("updateState", "next");console.log("next"); };

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('acrylic-enable', (_) => {
    mainWindow.setVibrancy(getVibrancySettings())
});

ipcMain.on('acrylic-disable', (_) => {
    mainWindow.setVibrancy(null)
});

ipcMain.on("updateCheck", function() {
    checkForUpdates()
})

/*
ipcMain.on('blurBehind', (_) => {
    ewc.setBlurBehind(mainWindow, 0x14800020);
});
ipcMain.on('gradient', (_) => {
    ewc.setGradient(mainWindow, 0x14800020);
});
ipcMain.on('trGradient', (_) => {
    ewc.setTransparentGradient(mainWindow, 0x14800020);
});
*/
