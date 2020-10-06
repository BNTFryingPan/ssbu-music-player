# ssbu-music-player
A music player that has a UI based on the UI of the Super Smash Bros. Ultimate music interface.

# Current Features
- Partial Twitch integration
    - Currently can say in chat what you are currently listening to when a user does !song
    - See planned features for more
- Can shuffle music from your default music directory (on windows C:/Users/\<user\>/Music)
- Automatically sorts them into albums from which they are from, as well as an album that shows songs that are not in albums and an album that lists all songs
- Has some fancy transparent Acrylic effects (that can be disabled if you want)
- (Disabled for now because its buggy) Volume normalization. Got a loud song and a quiet song? The loud song will play quieter, and the quiet song will play louder (can be turned off)

# Planned Features
Checked off boxes are currntly being worked on

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
- [ ] Custom Playlists
    - [ ] Includes both local music files and youtube videos in the same playlist
        - [ ] Automatically skip youtube videos when you dont have internet
        - [ ] Option to only play local files or only youtube videos when online
- [ ] Music Settings per song
    - [ ] Volume
    - [ ] Normalization
    - [ ] more stuff probably
- [ ] Faster UI, currently its kinda slow, and bad. but it looks good

# notes
Currently only optimized and tested on Windows 10, should work on older versions of windows, known to at least start on Ubuntu, but not tested very much.

Im not creating these as gh issues for now because im not focusing on ubuntu developmenet for now
Known issues on Ubuntu:
Fails to install with default package setup (mainly ewc causing issues, as it only works on windows)
Window icons (close, minimize, maximie) dont render correctly, as the font is windows exclusive as far as i know (Seoge UI)
Title bar is rendered what appears to be 100% its height below where it should be. (it looks like there is an invisible title bar above it basically, but i dont think thats actually what the issue is)

music might not even play on ubuntu because i didnt have any music on my ubuntu install, and was too lazy to get some.

if you have a mac and want to test and develop for it, go ahead, but i cant and wont help. i dont own a mac
