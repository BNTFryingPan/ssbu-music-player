# ssbu-music-player
A music player that has a UI based on the UI of the Super Smash Bros. Ultimate music interface.

# Known Issues
Last updated for: v0.4.1
- Song list is not sorted by track number (its sorted by whatever order it reads files in)

# Current Features
- Partial Twitch integration
    - Currently can say in chat what you are currently listening to when a user does !song
    - Can announce when a new song plays automatically
    - See planned features for more
- Can shuffle music from your default music directory (on windows C:/Users/\<user\>/Music)
- Automatically sorts them into albums from which they are from, as well as an album that shows songs that are not in albums and an album that lists all songs
- Has some fancy transparent Acrylic (should use vibrancy on osx) effects (that can be disabled if you want)
- Playlists (wip, but functional), you can add songs to playlists and shuffle songs from those playlists

- (Disabled for now because its buggy) Volume normalization. Got a loud song and a quiet song? The loud song will play quieter, and the quiet song will play louder (can be turned off)

# Planned Features
Checked off boxes are currntly being worked on

- [ ] Support for mac and linux (currently windows only, although might work on other platforms)
- [ ] Improved Twitch Integration
    - [ ] Song Request from YouTube with custom requirements (view count, like:dislike ratio, duration, etc.)
    - [ ] Vote skipping songs
    - [ ] changing volume
    - [ ] pausing music
    - [ ] full permission control based on twitch 'ranks' (Viewer, Subscriber, VIP, Moderator, Broadcaster)
    - [ ] better login experience
    - [ ] all features being optional
- [ ] YouTube Integration
    - [ ] Playlist support
        - [ ] Will be able to play a playlist
    - [ ] Play songs from YouTube
- [X] Custom Playlists
    - [ ] Includes both local music files and youtube videos in the same playlist
        - [ ] Automatically skip youtube videos when you dont have internet
        - [ ] Option to only play local files or only youtube videos when online
- [ ] Music Settings per song
    - [ ] Volume
    - [ ] Normalization
    - [ ] more stuff probably
- [X] Faster UI. inital startup is quite slow and bad

# notes
Currently only optimized and tested on Windows 10, should work on older versions of windows, known to at least start on Ubuntu, but not tested very much.

Im not creating these as gh issues for now because im not focusing on ubuntu development for now
Known issues on Ubuntu:
- Fails to install with default package setup (mainly ewc causing issues, as it only works on windows)
- Window icons (close, minimize, maximie) dont render correctly, as the font is windows exclusive as far as i know (Seoge UI)
- Title bar is rendered what appears to be 100% its height below where it should be.

music might not even play on ubuntu because i didnt have any music on my ubuntu install, and was too lazy to get some.

if you have a mac and want to test and develop for it, go ahead, but i cant help much. i dont own a mac

to run on linux or mac you must either setup a dev environment to run it in. you can choose to build it for your platform after that if you wish to run it without running it through your text editor/ide.

# advanced stuff for advanced people
playlists support using a custom image that will be shown on the playlist list page
this is the format for the playlist file (playlists.ssbu-music)
```{
    "[playlist name]": {
        "songs": [
            {
                "type": "file", // the type of song this is (currently only support 'file')
                "dir": "C:/Path/To/Song.mp3", // the path to this song
                "playlist": "[playlist name]" // the name of the playlist this song entry is in
            }
        ],
        "name": "[playlist name]", // the name of the playlist (yes, its kinda redundant, but its the best solution for now)
        "songCount": [int], // the number of songs in the playlist
        "duration": [float], // you usually shouldnt change this manually, but it is the duration of all the songs in the playlist combined
        "showName": [bool], // if the text name should be displayed on top of the playlist art
        "art": "C:/Path/To/Image.png" // should support any format that can be rendered by chrome
    }
}```

settings file format:
```{
    "normalizeVolume": [bool], // if volume normalization should be enabled. currently disabled because it broke
    "windowsAcrylicState": [bool], 
    "userVolumeSliderValue": [float: 0.0 - 1.0], // the position of the volume slider
    "enableDeveloperMode": false, 
    "discord": {
        "enableRPC": true, // if rpc should be enabled
        "largeImageText": "{song.artist}", // check the changelog for info about these options
        "smallImageText": "{player.state} | {player.version}",
        "details": "{song.title} {player.icons} {player.loops}",
        "state": "{song.album}",
        "startTimestampMode": [string: "song" | "source" | "application"] // which mode the start timestamp should use
    }
}```