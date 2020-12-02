const WebSocket = require("websocket-stream");
const { ipcMain } = require('electron')
const http = require('http');

var externalIP = "null"
var wss = null;

ipcMain.handle('wss:getIp', function(event, args) {
    return externalIP;
})

function initServer() {
    http.get({ host: 'ipv4bot.whatismyipaddress.com', port: 80, path: '/' }, function(res) {
        console.log("status: " + res.statusCode);
    
        res.on("data", function(chunk) {
            externalIP = chunk.toString();
        });
    }).on('error', function(e) {
        console.log("error: " + e.message);
    });
    
    wss = new WebSocket.Server({ port: 8080 })
    
    wss.on('connection', function connection(ws) {
        console.log("new connection")
        ws.on("message", function incoming(message) {
            console.log('received: %s', message)
    
    
        })
    
        ws.send("something")
    })
    
    ipcMain.on('wss:newSong', function(event, args) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                console.log(args)
                client.send(JSON.stringify(args[0]));
            }
        })
    });
}