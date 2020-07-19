// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, systemPreferences, dialog} = require('electron');
const path = require('path');
const platfolders = require('platform-folders');
const ewc = require('@svensken/ewc')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
//let popupWindow;

function createWindow () {
    // Create the browser window.

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 500, 
        minHeight: 400,
        //transparent: true,
        //backgroundColor: '#fff',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            //webSecurity: false
        },
        backgroundColor: '#44444444',
        frame: false
    })
    ewc.setAcrylic(mainWindow, 0x14800020);

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    //mainWindow.loadURL("https://www.whatsmybrowser.org/")

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null
    })
}

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
ipcMain.on('acrylic', (_) => {
    //console.log('enable')
    ewc.setAcrylic(mainWindow, 0x14800020);
});
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
ipcMain.on('disable', (_) => {
    //console.log("disable")
    ewc.disable(mainWindow, 0x14800020);
});