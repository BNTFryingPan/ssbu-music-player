//const { load } = require("iohook")

let loadedPlugins = {}

function loadRenderPlugins() {
    let ver = document.getElementById("version-display").innerHTML
    let pluginList = document.getElementById("plugin-list-body")
    if (fs.existsSync(platFolders.getDocumentsFolder() + "/ssbu-music-plugins")) {
        let files = fs.readdirSync(platFolders.getDocumentsFolder() + "/ssbu-music-plugins")
        for (f in files) {
            if (files[f].endsWith(".r.js")) {
                console.log("loading " + files[f])
                loadedPlugins[files[f]] = {p: null, loaded: false, enabled: false, filename: files[f]};
                let pl = loadedPlugins[files[f]]
                pl.p = require(platFolders.getDocumentsFolder() + "/ssbu-music-plugins/" + files[f])
                pl.loaded = true;
                if (pl.p.load) pl.p.load(ver)
                pl.enabled = pl.p.enableOnLoad;
                if (pl.enabled && pl.p.enable) {
                    pl.p.enable()
                }
                pluginList.innerHTML += pluginListElement(pl.p.about.name, pl.filename, pl.p.about.author, pl.p.about.version, pl.enabled)
            }
        }
    }
}

function enablePlugin(name) {
    if (!name.endsWith(".r.js")) name += ".r.js";
    let pl = loadedPlugins[name]
    pl.enabled = true;
    if (pl.p.enable) pl.p.enable()
}

function disablePlugin(name) {
    if (!name.endsWith(".r.js")) name += ".r.js";
    let pl = loadedPlugins[name]
    pl.enabled = false;
    if (pl.p.disable) pl.p.disable()
}

function pluginListElement(name, filename, author, version, enabled, error) {
    let cb = "<td>?</td>"
    if (error) {
        cb = "<td>" + error + "</td>"
    } else {
        cb = "<td><input id='plugin-list-entry-" + filename + "' onclick=\"!this.checked ? disablePlugin('" + filename + "') : enablePlugin('" + filename + "')\" type='checkbox'" + ((enabled || false) ? " checked" : "") + "></td>"
    }
    return "<td>" + (name || "Unknown") + "</td><td>v" + (version || "?") + "</td><td>" + (author || "") + "</td>" + cb 
}

function getPluginInformation(name) {
    let ret = {loaded: false, exists: false, enabled: false, err: null};
    if (name.endsWith(".r.js")) {
        if (loadedPlugins[name]) ret = {loaded: loadedPlugins[name].loaded, exists: true, enabled: loadedPlugins[name].enabled}
    } else if (name.endsWith) {
        return {loaded: false, exists: false, enabled: false, err: -1};
    } else {
        if (loadedPlugins[name + ".r.js"]) ret = {loaded: loadedPlugins[name + ".r.js"].loaded, exists: true, enabled: loadedPlugins[name + ".r.js"].enabled}
    }
}

function dispatchEvent(name, data) {
    for (let pl in loadedPlugins) {
        if (loadedPlugins[pl].enabled && loadedPlugins[pl].p.event) {
            loadedPlugins[pl].p.event(name, data);
        }
    }
}