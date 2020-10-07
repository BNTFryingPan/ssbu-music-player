function getSongImage(song) {
    var picture = song[0]['picture']
    if (picture) {
        picture = picture[0]
        if (picture) {
            return `data:${picture.format};base64,${picture.data.toString('base64')}`;
        }
    }
    return "./unknown.png"
}

var calculatingGain = false;
var audioCtx = new AudioContext();
var src;

async function playSongFromFile(file) {
    console.log("hey it updated poggers")
    //console.log(file)
    songData = await getSongData(file);
    var song = document.getElementById("song")
    song.src = file;
    //console.log(songs[songData[0]["album"]])

    //var song = document.getElementById(name);
    //var src = audioCtx.createMediaElementSource(song);
    //var gainNode = audioCtx.createGain();
    /*if (userSettings['normalizeVolume']) {
        calculatingGain = true;
        document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " (Recalculating...)";
        if (songs[songData[0]["album"]]['songs'][file][1]['normalization']) {
            gainNode.gain.value = (songs[songData[0]["album"]]['songs'][file][1]['normalization'] * nowPlaying['userVolumeSliderValue']);
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
                    //gainNode.gain.setValueAtTime(gain * nowPlaying['userVolumeSliderValue'], audioCtx.currentTime);
                    
                    gainNode.gain.value = (gain * nowPlaying['userVolumeSliderValue']);
                    document.getElementById("song-info-normalization").innerHTML = gainNode.gain.value + " = " + gain + "x" + nowPlaying['userVolumeSliderValue'];
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
    nowPlaying['startTime'] = Date.now();
    //nowPlaying['song']['index'] = songs['All Songs']['songs'].indexOf(songData)
    //console.log("song playing")

    document.getElementById('now-playing').classList.remove('no-song')
    document.getElementById('song-info-art').src = getSongImage(songData)
    document.getElementById('song-info-title').innerHTML  = songData[0]['title'];
    document.getElementById('song-info-album').innerHTML  = songData[0]['album'];
    document.getElementById('song-info-artist').innerHTML = songData[0]['artist'];

    document.getElementById('song-info-title2').innerHTML = songData[0]['title'] + " - " + songData[0]['album'] + " - " + songData[0]['artist'];
    document.getElementById('song-info-genre').innerHTML = songData[0]['genre'][0] + " - " + songData[0]['comment'][0];
    document.getElementById('song-info-line1').innerHTML = songData[0]['year'].toString() + " - " + songData[0]['duration'] + " - [" + songData[0]['disk']['no'] + "/" + songData[0]['disk']['of'] + "] - [" + songData[0]['track']['no'] + "/" + songData[0]['track']['of'] + "]";
    document.getElementById('song-info-line2').innerHTML = songData[1]["codec"] + " - " + songData[1]['container'] + " - lossless: " + songData[1]['lossless']
    
    var seek = document.getElementById('now-playing-seek-slider');

    song.play();
    nowPlaying['playbackState'] = "Playing"
    seek.max = songData[1].duration;
    seek.value = 0;
    updateRPC();
}

async function createSongListEntryFromSongData(fileLocation) {
    var entry = "";
    var songData = null;
    var metaData = null
    //console.log(fileName);
    data = await getSongData(fileLocation);
    songData = data[0];
    metaData = data[1];
    
    //songData['fileLocation'] = fileLocation;
    //<div class='song-entry'>
        //<span class="uiassetfont"></span>
        //<span>Example Song</span>
        //<span class="entry-duration">0:00</span>
    //</div>
    entry = "<tr onclick=\"playSongFromFile('" + fileLocation.replace("'", "\\'") + "')\"><td></td><td>" + songData['track']['no'] + "</td><td>" + songData['title'] + "</td><td>" + songData['duration'] +  "</td></tr>"
    //console.log(songData['track'])
    return entry
}

async function getSongData(fileName) {
    var songData = null;
    var metaData = null;
    //console.log(fileName)
    await mm.parseFile(fileName, {duration: true}).then(metadata => {songData = metadata['common']; metaData = metadata['format']});
    var folderPathNames = fileName.replace(/\\/g, "/").split("/");
    //console.log(folderPathNames);
    folderPathNames.reverse().pop();
    //console.log(folderPathNames);
    folderPathNames.reverse();
    //console.log(folderPathNames);
    var folderPath = ""
    for (dir in folderPathNames) {
        folderPath += folderPathNames[dir]
        if (dir < folderPathNames.length-1) {
            folderPath += "/"
        }
    }
    //console.log(folderPathNames);
    //return

    songData['folder'] = folderPath;
    //console.log(folderPath)
    songData['fileName'] = fileName.split("/")[fileName.split('/').length-1]
    if (!songData['title']) {
        var title = fileName.split('/')[fileName.split('/').length - 1].split('.mp3')[0];
        //console.log(title);
        songData['title'] = title
    }

    songData['track']["no"] = songData['track']["no"] || "--";
    songData['track']["of"] = songData['track']["of"] || "--";
    songData['album'] = songData['album'] || "Other";
    songData['artist'] = songData['artist'] || "Unknown";
    songData['genre'] = songData['genre'] || ["Unknown"];
    songData['comment'] = songData['comment'] || ["No Comment"];
    songData['year'] = songData['year'] || 0;
    songData['disk']["no"] = songData['disk']["no"] || "-";
    songData['disk']["of"] = songData['disk']["of"] || "-";

    songData['duration'] = fancyTimeFormat(metaData["duration"]);
    songData['fileLocation'] = fileName.replace(/\\/g, "/");
    songData['fileLocation'] = songData['fileLocation'].replace(/\\/g, "/")
    //songData['fileLocation'] = songData['fileLocation'].replace("'", "'")
    //console.log(songData)
    return [songData, metaData];
}

async function loadSongsFromFolder(directory) {
    directory = directory.replace(/\\/g, "/");
    var files = fs.readdirSync(directory)
    //console.log(files)
    for (var f in files) {
        if (files[f].split('.').length == 1) {
            try {
                loadSongsFromFolder(directory + "/" + files[f])
            } catch (error) {
                console.log(files[f] + " doesnt have file extension, but isnt folder either!")
            }
        } else if (files[f].endsWith('.mp3')) {
            //document.getElementById('song-list-tbody').innerHTML += await createSongListEntryFromSongData(files[f]);
            var thisSong = await getSongData(directory + "/" + files[f]);
            if (!(songs[thisSong[0]['album']])) {
                songs[thisSong[0]['album']] = {
                    "albumArt": "./unknown.png",
                    "artists": [],
                    "songs": {},
                    "songFilePaths": [],
                    "duration": 0
                }
            }

            songs[thisSong[0]['album']]['songs'][directory + "/" + files[f]] = thisSong
            songs[thisSong[0]['album']]['songFilePaths'].push(directory + "/" + files[f])
            songs[thisSong[0]['album']]["duration"] += thisSong[1]['duration']
            songs["All Songs"]['songs'][directory + "/" + files[f]] = thisSong
            songs["All Songs"]['duration'] += thisSong[1]['duration']
            songs["All Songs"]['songFilePaths'].push(directory + "/" + files[f])


            // if the songs 'albumartist' isnt in the albums artist list, add them
            if (!songs[thisSong[0]['album']]['artists'].includes(thisSong[0]['albumartist'])) {
                songs[thisSong[0]['album']]['artists'].push(thisSong[0]['albumartist']);
            }

            if (songs[thisSong[0]['album']]['albumArt'] == './unknown.png' && thisSong[0]['picture']) {
                songs[thisSong[0]['album']]['albumArt'] = getSongImage(thisSong);
            }
        } else if (files[f] == ".ssbu-music") {
            //parseFolderDataFile(files[f])
        }
    }
    return true;
    //hasLoadedSongs = true;
}

async function loadSongsFromMusicFolder() {
    var a = await loadSongsFromFolder(platFolders.getMusicFolder());
    //console.log(a)
    var b = await loadAlbums()
    //console.log(b)
    //await loadSongsFromFolder(platFolders.getMusicFolder()).then(loadAlbums())
}