
    ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
    import ffmpeg from 'fluent-ffmpeg';

// set ffmpeg package path
ffmpeg.setFfmpegPath(ffmpegPath);

    export function audioProcessTest() {
        var command = ffmpeg();
    }