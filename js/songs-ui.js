var calculatingGain = false;
var audioCtx = new AudioContext();
var src;

function getSongImage(song) {
    let picture = song[0]['picture']
    if (picture) {
        picture = picture[0]
        if (picture) {
            return `data:${picture.format};base64,${picture.data.toString('base64')}`;
        }
    }
    return "./assets/unknown.png"
}

async function getSongData(fileName) {
    if (global.songs["All Songs"]["songFilePaths"].includes(fileName)) {
        return global.songs["All Songs"]["songs"][fileName]
    } else {
        console.warn("Attempted to get song data for unloaded song: " + fileName)
        // currently returns this to hopefully show 'undefined' instead of throwing an error. probably a bad way to do it, but idrc for now because this is going to change probably
        return [{}, {}] // TODO: request for song data from the main process
    }
}

async function playSongFromFile(file) {
    let songData = await getSongData(file);
    var song = document.getElementById("song")
    song.src = file; // sets the source of the song element

    // a bunch of commented out code related to the visualizer and normalization

    //var src = audioCtx.createMediaElementSource(song);
    //var gainNode = audioCtx.createGain();
    /*if (userSettings['normalizeVolume']) {
        calculatingGain = true;
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " (Recalculating...)";
        if (songs[songData[0]["album"]]['songs'][file][1]['normalization']) {
            gainNode.gain.value = (songs[songData[0]["album"]]['songs'][file][1]['normalization'] * userSettings['userVolumeSliderValue']);
            document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value;
            //console.log("reused gain value: " + songs[songData[0]["album"]]['songs'][file][1]['normalization'])

        } else {
            fetch(file)
                .then(function(res) { return res.arrayBuffer(); })
                .then(function(buf) {
                    return audioCtx.decodeAudioData(buf);
                }).then(function(decodedData) {
                    var decodedBuffer = decodedData.getChannelData(0);
                    var sliceLen = Math.floor(decodedData.sampleRate * 0.05);
                    var averages = [];
                    var sum = 0.0;
                    for (var i = 0; i < decodedBuffer.length; i++) {
                        sum += decodedBuffer[i] ** 2;
                        if (i % sliceLen === 0) {
                            sum = Math.sqrt(sum / sliceLen);
                            averages.push(sum);
                            sum = 0;
                        }
                    }
                    // Ascending sort of the averages array
                    averages.sort(function(a, b) { return a - b; });
                    // Take the average at the 95th percentile
                    var a = averages[Math.floor(averages.length * 0.95)];
                    var gain = 1.0 / a;
                    // ReplayGain uses pink noise for this one one but we just take
                    // some arbitrary value... we're no standard
                    // Important is only that we don't output on levels
                    // too different from other websites
                    gain = gain / 10.0;
                    nowPlaying['rawNormalizationGain'] = gain
                    //gainNode.gain.setValueAtTime(gain * userSettings['userVolumeSliderValue'], audioCtx.currentTime);
                    
                    gainNode.gain.value = (gain * userSettings['userVolumeSliderValue']);
                    document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + gain + "x" + userSettings['userVolumeSliderValue'];
                    songs[songData[0]["album"]]['songs'][file][1]['normalization'] = gain;
                }
            );
            
        }
        calculatingGain = false;
        
    } else {
        //gainNode.gain.value = 0.5;
        disconnectAudioNormalizer()
    }*/
    
    if (false) {
        audioCtx.close()
        audioCtx = new AudioContext()
        src = audioCtx.createMediaElementSource(song);
        var analyser = audioCtx.createAnalyser();

        var canvas = document.getElementById("visualizer-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext("2d");

        src.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 256;

        var bufferLength = analyser.frequencyBinCount;
        //console.log(bufferLength);

        var dataArray = new Uint8Array(bufferLength);

        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;
        //console.log(HEIGHT)

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        function renderFrame() {
        requestAnimationFrame(renderFrame);

        x = 0;

        analyser.getByteFrequencyData(dataArray);

        //ctx.fillStyle = "#000";
        //ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.clearRect(0,0,WIDTH,HEIGHT)

        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            
            var r = barHeight + (25 * (i/bufferLength));
            //var g = 250 * (i/bufferLength);
            var g = 0;
            var b = 50;

            ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 0.4)";
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
        }
        renderFrame();
    }
    

    nowPlaying['currentSource'] = "local-files"
    nowPlaying['song']['type'] = "local-file"
    nowPlaying['song']['data'] = songData;
    nowPlaying['startTime']["song"] = Date.now();
    //nowPlaying['song']['index'] = songs['All Songs']['songs'].indexOf(songData)

    // sets information display content
    document.getElementById('now-playing').classList.remove('no-song')
    document.getElementById('song-info-art').src = songData[0]['picture']
    //document.getElementById('song-info-art').src = songs[songData[0]['album']]['albumArt']
    document.getElementById('song-info-title').innerHTML  = songData[0]['title'];
    document.getElementById('song-info-album').innerHTML  = songData[0]['album'];
    document.getElementById('song-info-artist').innerHTML = songData[0]['artist'];

    document.getElementById('song-info-title2').innerHTML = songData[0]['title'] + " - " + songData[0]['album'] + " - " + songData[0]['artist'];
    document.getElementById('song-info-genre').innerHTML = songData[0]['genre'][0] + " - " + songData[0]['comment'][0];
    document.getElementById('song-info-line1').innerHTML = songData[0]['year'].toString() + " - " + songData[0]['duration'] + " - [" + songData[0]['disk']['no'] + "/" + songData[0]['disk']['of'] + "] - [" + songData[0]['track']['no'] + "/" + songData[0]['track']['of'] + "]";
    document.getElementById('song-info-line2').innerHTML = songData[1]["codec"] + " - " + songData[1]['container'] + " - lossless: " + songData[1]['lossless']
    
    let seek = document.getElementById('now-playing-seek-slider');

    song.play();
    nowPlaying['playbackState'] = "Playing"
    seek.max = songData[1].duration;
    seek.value = 0;

    updatePlayingSongInSongLists();
    updateRPC();
    dispatchEvent("PLAYSONG", {song: songData});
}

function updatePlayingSongInSongLists() {
    if (!nowPlaying["song"]["data"]) return;
    document.querySelectorAll(".song-list-tbody > .playing").forEach((el) => {
        el.classList.remove("playing")
    })
    document.querySelectorAll(".song-list-tbody > tr[data-songlocation=\"" + nowPlaying["song"]["data"][0]["fileLocation"] + "\"]").forEach((el) => {
        el.classList.add("playing")
    })
}

// creates an HTML string that can be added to a table body that acts as a song entry.
// should probably add some config to this so it can be used in other places, but it should also be fast too.
// currently assumes clicking it should play the song, but that might not be the best idea
// should probably also accept song data directly, or have it accept both
async function createSongListEntryFromSongData(fileLocation, extraCode, includeAlbum) {
    let data = await getSongData(fileLocation);
    let songData = data[0];
    let metaData = data[1];
    
    return "<tr data-songLocation='" + fileLocation + "' onclick=\"playSongFromFile('" + fileLocation.replace("'", "\\'") + "');" + extraCode + "\"><td></td><td>" + songData['track']['no'] + "</td><td>" + songData['title'] + "</td>" + (includeAlbum ? ("<td>" + songData['album'] + "</td>") : "") + "<td>" + songData['duration'] +  "</td></tr>"
}