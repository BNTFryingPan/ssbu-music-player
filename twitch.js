const irc = require('dank-twitch-irc');
const remote = require('electron').remote;
const {BrowserWindow} = require('electron');

module.exports = {
    beginTwitchOauthFlow: beginTwitchOauthFlow,
    startTwitchIntegration: startTwitchIntegration
}

var oauth = null;

var twitchOauthData = {
    "access_token": null,
    "scope": [],
    "token_type": null
};

var twitchApplicationData = {
    "client_id": "d6g6o112aam5s8q2di888us9o3kuyh",
    "force_verify": true,
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

function startTwitchIntegration() {
}

window.onmessage = function(event){
    if (event.data.startsWith("twitchOauth")) {
        var dataString = event.data.split('#', 1)[1]
        console.log(dataString)
        var data = {
            "access_token": null,
            "scope": [],
            "token_type": null,
            "channelToJoin": null,
            "username": null
        };

        var accessToken = "";
        var scope = [];
        var type = "";
        var channelToJoin = ""
        var username = ""

        twitchOauthData = data;
    }
}

function generateTwitchOauthURL() {
    var url = "https://id.twitch.tv/oauth2/authorize";
    url += "?client_id=" + twitchApplicationData['client_id'];
    url += "&redirect_uri=https://leotomasmc.github.io/ssbu-music-player/auth.html";
    url += "&response_type=token";
    url += "&force_verify=true";
    url += "&scope=chat:edit%20chat:read%20channel:read:subscriptions%20whispers:edit"
    return url
}

function beginTwitchOauthFlow() {
    //var url = "https://id.twitch.tv/oauth2/authorize?client_id=9yyejeel2lb0vfny41fs535r1jesg2&redirect_uri=https://leotomasmc.github.io/ssbu-music-player/auth.html&response_type=token&force_verify=true";
    var title = "Twitch OAuth 2.0 Authentication"
    //var oauth = window.open(generateTwitchOauthURL(), title, "frame=yes,autoHideMenuBar=yes");
    oauth = window.open("file:///Z:/development/projects/gh/ssbu-music-player/auth.html", title, "frame=yes,autoHideMenuBar=yes");
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
