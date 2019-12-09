const irc = require('dank-twitch-irc');
const remote = require('electron').remote;
const {BrowserWindow} = require('electron');

module.exports = {
    beginTwitchOauthFlow: beginTwitchOauthFlow,
    startTwitchIntegration: startTwitchIntegration
}

let popupWindow;

function createPopup(url, title) {
    window.open(url, title, "frame=yes,autoHideMenuBar=yes")
}

function startTwitchIntegration() {

}

function beginTwitchOauthFlow() {
    createPopup("https://id.twitch.tv/oauth2/authorize?client_id=9yyejeel2lb0vfny41fs535r1jesg2&redirect_uri=https://leotomasmc.github.io/ssbumpauth&response_type=token", "Twitch OAuth");
}

function onEvent(eventType, content) {

}

/*
https://id.twitch.tv/oauth2/authorize?client_id=9yyejeel2lb0vfny41fs535r1jesg2&redirect_uri=https://leotomasmc.github.io/ssbumpauth&response_type=token


https://leotomasmc.github.io/ssbumpauth
#access_token=boarudq3r3kdof3p7siyiv9qcg5ev7
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
&state=%7B%22origin%22%3A%22full_page%22%2C%22next%22%3A%22https%3A%2F%2Fdev.twitch.tv%2Flogin%3Fnext%3Dhttps%253A%252F%252Fdev.twitch.tv%252F%22%2C%22nonce%22%3A%22996cc7e6581220157dba9115aadd9732%22%7D
*/
