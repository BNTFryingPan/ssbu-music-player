const irc = require('dank-twitch-irc');
//const remote = require('electron').remote;
//const {BrowserWindow} = require('electron');
const ytdl = require("ytdl-core")

/*module.exports = {
    beginTwitchOauthFlow: beginTwitchOauthFlow,
    startTwitchIntegration: startTwitchIntegration,
    sendNewSongPlayingMessage: sendNewSongPlayingMessage
}*/

var oauth = null;
var readyToJoinChat = true;
var bot = { // Here we create an empty client so that if something tries to do a bot function and
    join: function(channelName){}, // the bot isnt connected, it will fail silently. we have arg
    joinAll: function(channelNames){}, // names so inline docs work
    part: function(channelName){},
    privmsg: function(channelName, message){},
    say: function(channelName, message){},
    me: function(channelName, message){},
    timeout: function(channelName, username, length, reason=null){},
    ping: function(){},
    whisper: function(username, message){},

    sendRaw: function(commane){},
    unconnected: true,
    connecting: false,
    connected: false,
    ready: false,
    closed: false
};
var tch = "";

var twitchOauthData = {
    "access_token": null,
    "scope": [],
    "token_type": null,
    "channel_to_join": ""
};

var twitchUserData = {};

var permissions = {
    "sr": 1,
    "fullControl": 8
};

var twitchApplicationData = {
    "client_id": "9yyejeel2lb0vfny41fs535r1jesg2",
    "force_verify": "true",
    "lang": "en",
    "login_type": "login",
    "scopes": [
        "chat:read",
        "chat:edit",
        "channel:read:subscriptions",
        "whispers:edit",
        "whispers:read"
    ]
}

function updateTwitchSrPerms() {
    /*
    perms work based on a number.
    all users get 1 perm point
    subs get 2 more added
    vips get 4 more added
    mods get 8 more added
    streamer gets 16 more added

    lets say an action requires a moderator to do it. mods will always have at least 8 points (technically 9, but 8 is nicer)
    we can then just check their perm level to see what perms we want
    */
    permissions['sr'] = 0
    if (document.getElementById("s-t-perm-all").checked) permissions['sr'] += 1
    if (document.getElementById("s-t-perm-sub").checked) permissions['sr'] += 2
    if (document.getElementById("s-t-perm-vip").checked) permissions['sr'] += 4
    if (document.getElementById("s-t-perm-mod").checked) permissions['sr'] += 8
}

function sendNewSongPlayingMessage(song, extra) {
    //console.log(song)
    //console.log(getSongMessage(song))
    if (bot.ready && document.getElementById("s-t-o-newsongmessage").checked) {
        extra = extra || ""
        song = song || nowPlaying[song]
        bot.say(tch, extra + getSongMessage(song))
    }
}

function sendTwitchMessage(msg, ch) {
    if (!bot.ready) return
    bot.say(ch || tch, msg);
}

function getSongMessage(song) {
    var nowPlayingMessage = "Now Playing: ";

    if (song['type'] == "local-file") {
        nowPlayingMessage += song['data'][0]['title'] + " from " + song['data'][0]['album'] + " by " + song['data'][0]['artist'] + " from a file."
    } else if (song['type'] == "yt") {

    }

    return nowPlayingMessage;
}

function user(msg) {
    return {username: msg.senderUsername, id: msg.senderID, mod: msg.isMod, display: msg.displayName, color: msg.color, badges: msg.badges}
}

function startTwitchIntegration() {
    if (!(readyToJoinChat && document.getElementById("s-t-channel").value != "")) return alert("Sign into twitch first!");
    twitchOauthData["channel_to_join"] = document.getElementById("s-t-channel").value
    tch = twitchOauthData["channel_to_join"].toLowerCase()
    bot = new irc.ChatClient({
        username: "thederpymemebot", // hardcoded for now /shrug
        password: "oauth:" + twitchOauthData["access_token"]
    })
    bot.on("PRIVMSG", msg => {
        if (bot.configuration.username == msg.senderUsername)
        //console.log(msg)
        console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
        dispatchEvent("T-PRIVMSG", msg)
        
        if (msg.messageText.startsWith("!sr") || msg.messageText.startsWith("!songrequest")) {
            let args = msg.messageText.split(" ");
        
            ytdl.getInfo(ytdl.getVideoID(args[1])).then((info) => {
                console.log(info)
                if (parseInt(info.videoDetails.lengthSeconds) >= document.getElementById("sto-maxlength").value) return bot.say(tch, "That song is too long! (max: " + document.getElementById("sto-maxlength").value + " seconds)")
                if (parseInt(info.videoDetails.viewCount) <= document.getElementById("sto-minviews").value) return bot.say(tch, "That video doesn't have enough views! (minimum: " + document.getElementById("sto-minviews").value + ")")
                
                nowPlaying['youtube-queue'].push({id: info.videoDetails.videoId, requester: user(msg), details: info})
                bot.say(tch, "Requested " + info.videoDetails.title + " by " + info.videoDetails.ownerChannelName);
                
            });
            //nowPlaying['youtube-queue'].push({"id": ytUrl, "requester": msg.displayName})
            /*} else {
                bot.whisper(msg.username, "Hey. Sorry, but you can't use song request!")
            }*/
        } else if (msg.messageText.startsWith("!song")) {
            var nowPlayingMessage = "Now Playing: ";

            if (nowPlaying['song']['type'] == "local-file") {
                nowPlayingMessage += nowPlaying['song']['data'][0]['title'] + " from " + nowPlaying['song']['data'][0]['album'] + " by " + nowPlaying['song']['data'][0]['artist'] + " from a file."
            } else if (nowPlaying['song']['type'] == "yt") {
                nowPlayingMessage += "Something on YouTube."
            }

            bot.say(tch, nowPlayingMessage)
        } else if (msg.messageText.startsWith("!source") || msg.messageText.startsWith("!album") || msg.messageText.startsWith("!playlist") || msg.messageText.startsWith("!pl")) {
            let resp = "Couldn't find the current shuffle mode!"
            
            if (nowPlaying["shuffleMode"] == "shuffleall") resp = "Currently shuffling from all songs!"
            if (nowPlaying["shuffleMode"] == "loop") resp = `Currently looping ${nowPlaying["song"]["data"][0]["title"]}.`
            if (nowPlaying["shuffleMode"] == "shufflesource") resp = `Currently shuffling from ${nowPlaying["shuffleSource"]["type"]} named '${nowPlaying["shuffleSource"]["name"]}'.`
            if (nowPlaying["shuffleMode"] == "order") resp = `Currently playing songs in order from ${nowPlaying["shuffleSource"]["type"]} named '${nowPlaying["shuffleSource"]["name"]}'.`

            bot.say(tch, resp)
        } else if (msg.messageText.startsWith("!ver")) {
            bot.say(tch, "Currently running Smash Music Player " + document.getElementById("version-display").innerHTML)
        } else if (msg.isMod) {
            if (msg.messageText.startsWith("!skip") || msg.messageText.startsWith("!nextsong")) {
                nextSong();
                sendNewSongPlayingMessage("Skipped song. Now Playing " + nowPlaying['song']['data'][0]['title'] + " from " + nowPlaying['song']['data'][0]['album'] + " by " + nowPlaying['song']['data'][0]['artist'] + " from a file.");
            }
        }
    })
    bot.on("close", (err) => {if (err) {console.error(err)}})
    bot.on("ready", () => {console.log("bot connected!")})
    bot.on("WHISPER", msg => {
        console.log(`[#DM ${msg.displayName}]: ${msg.messageText}`);
        dispatchEvent("T-WHISPER", msg)
    });

    bot.on("USERNOTICE",      (msg) => {dispatchEvent("T-USERNOTICE", msg)})
    bot.on("CLEARCHAT",       (msg) => {dispatchEvent("T-CLEARCHAT", msg)})
    bot.on("CLEARMSG",        (msg) => {dispatchEvent("T-CLEARMSG", msg)})
    bot.on("HOSTTARGET",      (msg) => {dispatchEvent("T-HOSTTARGET", msg)})
    bot.on("NOTICE",          (msg) => {dispatchEvent("T-NOTICE", msg)})
    bot.on("ROOMSTATE",       (msg) => {dispatchEvent("T-ROOMSTATE", msg)})
    bot.on("USERSTATE",       (msg) => {dispatchEvent("T-USERSTATE", msg)})
    bot.on("GLOBALUSERSTATE", (msg) => {dispatchEvent("T-GLOBALUSERSTATE", msg)})
    bot.on("JOIN",            (msg) => {dispatchEvent("T-JOIN", msg)})
    bot.on("PART",            (msg) => {dispatchEvent("T-PART", msg)})


    bot.connect();
    bot.join(tch);
    document.getElementById("s-t-connect").disabled = true;
    dispatchEvent("T-INTEGRATIONSTARTED")
    //bot.say(tch, "SSBU Music Player v0.1.2 Song Request bot is now in chat!")
}

window.onmessage = function(event){
    if (event.data.startsWith("twitchOauth")) {
        
    }
}

function getUserDataFromToken(url, callback, token) {
    var xhr = new XMLHttpRequest();
    xhr.setRequestHeader("Bearer", token)
    xhr.open('GET', url, true);
    //xhr.setRequestHeader()
    xhr.responseType = 'json';
    xhr.onload = ()=>callback(xhr.status === 200 ? null : xhr.status, xhr.response);
    xhr.send();
}

function generateTwitchOauthURL() {
    var url = "https://id.twitch.tv/oauth2/authorize";
    //url += "?client_id=" + twitchApplicationData['client_id'];
    url += "?client_id=9yyejeel2lb0vfny41fs535r1jesg2"
    url += "&redirect_uri=https://leotomasmc.github.io/ssbu-music-player/auth.html";
    url += "&response_type=token";
    url += "&force_verify=true";
    url += "&scope=chat:edit%20chat:read%20channel:read:subscriptions%20whispers:edit"
    return url
}

function beginTwitchOauthFlow() {
    var title = "Login With Twitch";
    oauth = window.open(generateTwitchOauthURL(), title, "frame=yes,autoHideMenuBar=yes");
    document.getElementById("s-t-getoauth").disabled = false;
}

function getTwitchOauthFromPopup() {
    if (!oauth.location.hash.startsWith("#")) return
    let data = {};
    let dataEntries = oauth.location.hash.split('#', 2)[1].split("&");

    for (let ent in dataEntries) {
        let entName = dataEntries[ent].split('=')[0];
        let entValue = dataEntries[ent].split('=', 2)[1]
        data[entName] = entValue
    }
    
    twitchOauthData = data;
    readyToJoinChat = true;
    document.getElementById("s-t-connect").disabled = false;
    document.getElementById("s-t-getoauth").disabled = true;
    document.getElementById("s-t-login").disabled = true;
}

//function onEvent(eventType, content) {

//}

/*
https://id.twitch.tv/oauth2/authorize?client_id=9yyejeel2lb0vfny41fs535r1jesg2&redirect_uri=https://leotomasmc.github.io/ssbumpauth&response_type=token


https://leotomasmc.github.io/ssbumpauth
#access_token=REDACTED
&scope=
&token_type=bearer

https://id.twitch.tv/oauth2/authorize
?client_id=d6g6o112aam5s8q2di888us9o3kuyh
&force_verify=true
&lang=en
&login_type=login
&redirect_uri=https%3A%2F%2Fwww.twitch.tv%2Fpassport-callback
&response_type=token
&scope=user_read
&state=REDACTED
*/
