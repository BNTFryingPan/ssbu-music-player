// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require("electron");

/*let mt = require("mousetrap");

mt.bind(["command+r", "control+r"], () => {
    return false
})*/

ipcRenderer.on("dom:updateContent", (event, args) => { // allows the main process to update element content in the browser.
    // probably not safe in all circumstances, but its probably fine here because the chances of code exploits is probably low
    switch(args[1]) {
        case "appendbefore":
            document.getElementById(args[2]).innerHTML = args[3].toString() + document.getElementById(args[2]).innerHTML;
            break;
        case "appendafter":
        case "append":
        case "add":
            document.getElementById(args[2]).innerHTML += args[3].toString();
            break;
        case "set":
        case "replace":
            document.getElementById(args[2]).innerHTML = args[3].toString();
    }
});

// logging things from the main process
ipcRenderer.on("console:log", (e, msg) => {
    if (typeof msg === typeof "") return console.log("Main Process: " + msg);
    console.log("Main Process*: " + JSON.stringify(msg));
});