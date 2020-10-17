const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = "debug"
autoUpdater.logger.info("set up logger")
autoUpdater.autoDownload = false

autoUpdater.on('error', (error) => {
    autoUpdater.logger.info("error")
    dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Found Updates',
        message: 'Found updates, do you want update now?',
        buttons: ['Sure', 'No']
    }).then((buttonIndex, cb) => {
        autoUpdater.logger.info(buttonIndex);
        if (buttonIndex.response === 0) {
            autoUpdater.logger.info("attempting download")
            autoUpdater.downloadUpdate()
        }
    })
})

autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
        title: 'No Updates',
        message: 'Current version is up-to-date.'
    })
    //updater.enabled = true
    //updater = null
})

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        title: 'Install Updates',
        message: 'Updates downloaded, application will be quit for update...'
    }).then( () => {
        setImmediate(() => autoUpdater.quitAndInstall())
    })
})

// export this to MenuItem click callback
function checkForUpdates (menuItem, focusedWindow, event) {
    //updater = menuItem
    //updater.enabled = false
    autoUpdater.checkForUpdates()
}
module.exports.checkForUpdates = checkForUpdates