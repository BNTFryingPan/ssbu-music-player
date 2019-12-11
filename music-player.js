var songs = {
    "All Songs": {
        "albumArt": "./other-album.png",
        "extraText": "All",
        "artists": [],
        "duration": 0,
        "songs": []
    },
    "Other": {
        "albumArt": './other-album.png',
        "extraText": "Other",
        "artists": [], // this would have all songData['albumartist']'s in it,
        "duration": 0,
        "songs": []
    }
}

var nowPlaying = {
    "previewedAlbum": "All Songs",
    "song": {
        "data": null,
        "index": 0
    },
    "currentPlaylist": null,
    "shuffleSource": {
        "type": "album",
        "name": "All Songs"
    },
    "shuffleMode": "shuffle" // shuffle album/playlist, random all, order, loop
};

function randomSong(source=null) {
    if (source === null) {
        var songsToPickFrom = songs[nowPlaying["shuffleSource"]["name"]]['songs'];
    } else {
        if (source['type'] == "album") {
            var songsToPickFrom = songs[source]['songs']
        } else if (source['type'] == "playlist") {
            alert('Playlists dont work yet!')
            //TODO: add playlists
        }
    }
    var songCount = songsToPickFrom.length;
    var randomSongIndex = parseInt(Math.random() * songCount);
    return songsToPickFrom[randomSongIndex];
}

function pauseSong(state) {
    if (state == true || state == false) {
        if (state) {
            document.getElementById('song').pause()
            //console.log('pause a')
        } else {
            document.getElementById('song').play()
            //console.log('play a')
        }
    } else {
        if (document.getElementById('song').paused) {
            document.getElementById('song').play()
            //console.log('pause')
        } else {
            document.getElementById('song').pause()
            //console.log('play')
        }
    }
}

function nextSong() {
    if (nowPlaying['shuffleMode'] == "loop") {
        document.getElementById('song').currentTime = 0;
        document.getElementById('song').play();
    } else {
        playSong(randomSong()[0]['fileLocation'])
    }
}

function prevSong() {
    if (document.getElementById('song').currentTime <= 3) {
        document.getElementById('song').currentTime = 0;
        alert('wip');
    } else {
        document.getElementById('song').currentTime = 0;
    }
}

function shuffleSongs() {
    if (nowPlaying['shuffleMode'] == "loop") {
        nowPlaying["shuffleMode"] = "shuffle";
    } else if (nowPlaying['shuffleMode'] == "shuffle") {
        nowPlaying["shuffleMode"] = "order";
    } else if (nowPlaying['shuffleMode'] == "order") {
        nowPlaying["shuffleMode"] = "loop"
    }

    document.getElementById('shuffle-state').innerHTML = nowPlaying['shuffleMode'];
}

function songTick() {
    if (document.getElementById('song').ended) {
        nextSong();
    }
}

window.setInterval(function(){
    songTick();
}, 20)