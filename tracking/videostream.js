videostream = {
    video: document.createElement("video"),
    playing: false,
    onStreamStart: false
};

addListener(window, "load", function() {
    if (typeof navigator.getUserMedia == "undefined")
        return console.log("(videostream) getUserMedia is not supported!");

    console.log("(videostream) Acquiring videostream ...");
    navigator.getUserMedia({video: true, audio: false}, onVideoStreamAcquired, onVideoStreamError);

    function onVideoStreamAcquired(userMediaStream) {
        console.log("(videostream) Videostream acquired, starting ...");
        addListener(videostream.video, "playing", mediaStreamStartCheck);
        videostream.video.autoplay = 1;
        videostream.video.src = window.URL.createObjectURL(userMediaStream);
    }

    function onVideoStreamError(e) {
        console.log("(videostream) Acquiring videostream failed!", e);
    }

    function mediaStreamStartCheck() {
        console.log("(videostream) Checking videostream status ...");
        if (videostream.video.videoWidth) {
            removeListener(videostream.video, "playing", mediaStreamStartCheck);
            onMediaStreamStart();
        } else {
            window.requestAnimationFrame(mediaStreamStartCheck);
        }
    }

    function onMediaStreamStart() {
        videostream.width = videostream.video.videoWidth;
        videostream.height = videostream.video.videoHeight;
        videostream.playing = true;
        
        console.log("(videostream) Videostream started (" + videostream.video.videoWidth + "x" + videostream.video.videoHeight + ").");

        if (typeof videostream.onStreamStart == "function")
            videostream.onStreamStart();
    }
});