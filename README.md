# ssbu-music-player
A music player that has a UI based on the UI of the Super Smash Bros. Ultimate music interface.

# notice
This issue is fixed as of v0.4.1
v0.3.8 added a caching feature to the song list for albums, so opening the page for an album will be faster. This may cause issues if you move folders around or add/remove tracks from a folder/album in explorer. If you have any problems, open the folder, and delete the .ssbu-music file, which should clear the cache of the song list. The next time you open that album, the song list will be re-created, which may take a second, depending on how many songs are in that album.

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
- Has some fancy transparent Acrylic effects (that can be disabled if you want)
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
- [X] Faster UI. Mostly happy with performance, but inital startup is quite slow and bad

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
