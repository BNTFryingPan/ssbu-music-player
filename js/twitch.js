const irc = require('dank-twitch-irc');
//const remote = require('electron').remote;
const {BrowserWindow} = require('electron');
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
    if (document.getElementById("s-t-perm-all").checked) {
        permissions['sr'] += 1
    } if (document.getElementById("s-t-perm-sub").checked) {
        permissions['sr'] += 2
    } if (document.getElementById("s-t-perm-vip").checked) {
        permissions['sr'] += 4
    } if (document.getElementById("s-t-perm-mod").checked) {
        permissions['sr'] += 8
    }
}

function sendNewSongPlayingMessage(song, extra) {
    if (bot.ready) {
        extra = extra || ""
        song = song || nowPlaying[song]
        bot.say(tch, extra + getSongMessage(song))
    }
}

function getSongMessage(song) {
    var nowPlayingMessage = "Now Playing: ";

    if (song['type'] == "local-file") {
        nowPlayingMessage += song['data'][0]['title'] + " from " + song['data'][0]['album'] + " by " + song['data'][0]['artist'] + " from a file."
    } else if (song['type'] == "yt") {

    }

    return nowPlayingMessage;
}

function startTwitchIntegration() {
    if (readyToJoinChat) {
        bot = new irc.ChatClient({
            username: "thederpymemebot",
            password: "oauth:" + twitchOauthData["access_token"]
        })
        bot.on("PRIVMSG", msg => {
            console.log(msg)
            var userPermissionLevel = 1;

            if (msg.badges.hasModerator || msg.badges.hasBroadcaster) {
                userPermissionLevel += 8;
            }
            if (msg.badges.hasVIP) {
                userPermissionLevel += 4;
            }
            if (msg.badges.hasSubscriber) {
                userPermissionLevel += 2;
            }
            //console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
            
            if (msg.messageText.startsWith("!sr") || msg.messageText.startsWith("!songrequest")) {
                if (userPermissionLevel >= permissions['sr']) {
                    var args = msg.messageText.split(" ");
                
                    var ytUrl = ytdl.getVideoID(args[1]);
                    nowPlaying['youtube-queue'].push({"url": ytUrl, "requester": msg.displayName})
                } else {
                    bot.whisper(msg.username, "Hey. Sorry, but you can't use song request!")
                }
            } else if (msg.messageText.startsWith("!song")) {
                var nowPlayingMessage = "Now Playing: ";

                if (nowPlaying['song']['type'] == "local-file") {
                    nowPlayingMessage += nowPlaying['song']['data'][0]['title'] + " from " + nowPlaying['song']['data'][0]['album'] + " by " + nowPlaying['song']['data'][0]['artist'] + " from a file."
                } else if (nowPlaying['song']['type'] == "yt") {

                }

                bot.say(tch, nowPlayingMessage)
            } else if (userPermissionLevel >= permissions['fullControl']) {
                if (msg.messageText.startsWith("!skip") || msg.messageText.startsWith("!nextsong")) {
                    nextSong();
                    sendNewSongPlayingMessage("Skipped song. Now Playing " + nowPlaying['song']['data'][0]['title'] + " from " + nowPlaying['song']['data'][0]['album'] + " by " + nowPlaying['song']['data'][0]['artist'] + " from a file.");
                }
            }
        })
        bot.on("WHISPER", msg => {console.log(`[DM ${msg.displayName}]: ${msg.messageText}`)});
        bot.connect();
        bot.connected = true;
        bot.join(twitchOauthData["channel_to_join"]);
        //bot.say(tch, "SSBU Music Player v0.1.2 Song Request bot is now in chat!")
    } else {
        alert("Sign into twitch first!")
    }
}

window.onmessage = function(event){
    if (event.data.startsWith("twitchOauth")) {
        var dataString = event.data.split('#', 2)[1]
        //console.log(typeof(event.data))
        //console.log(event.data.split('#',2))
        var data = {};

        var dataEntries = dataString.split("&");
        for (var ent in dataEntries) {
            var entName = dataEntries[ent].split('=')[0];
            var entValue = dataEntries[ent].split('=', 2)[1]
            //console.log(entName + ":" + entValue)
            data[entName] = entValue
        }
        console.log(data)
        twitchOauthData = data;
        tch = data['channel_to_join']

        //twitchUserData = getJson("https://api.twitch.tv/helix/users?" + "")


        readyToJoinChat = true;
    }
}

function getUserDataFromToken(url, callback, token) {
    var xhr = new XMLHttpRequest();
    xhr.setRequestHeader("Bearer", token)
    xhr.open('GET', url, true);
    //xhr.setRequestHeader()
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

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
    //var url = "https://id.twitch.tv/oauth2/authorize?client_id=9yyejeel2lb0vfny41fs535r1jesg2&redirect_uri=https://leotomasmc.github.io/ssbu-music-player/auth.html&response_type=token&force_verify=true";
    var title = "Twitch OAuth 2.0 Authentication"
    oauth = window.open(generateTwitchOauthURL(), title, "frame=yes,autoHideMenuBar=yes");
    //oauth = window.open("file:///Z:/development/projects/gh/ssbu-music-player/auth.html#access_token=exampleToken12345&scope=chat%3Aedit+chat%3Aread+channel%3Aread%3Asubscriptions+whispers%3Aedit&token_type=bearer", title, "frame=yes,autoHideMenuBar=yes");
}

function getTwitchOauthData(dataString) {
    
}

function onEvent(eventType, content) {

}

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
