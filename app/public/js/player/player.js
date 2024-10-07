function initPlayer() {
    var urlParams = new URLSearchParams(window.location.search);
    var cam = urlParams.get('cam');

    if (!cam) {
        document.body.innerHTML = "No camera selected";
        return;
    }

    var socket = io();

    document.body.innerHTML = "";
    let video = document.createElement("video");
    document.body.appendChild(video);
    video.src = "/video/cam" + cam + ".mp4";

    let videoId = document.createElement("span");
    videoId.id = "videoId";
    videoId.classList.add("cam" + cam);
    document.body.appendChild(videoId);

    document.getElementById("videoId").innerHTML = cam;
    document.getElementById("videoId").classList.add("cam" + cam);

    socket.on("startAllCams", () => {
        video.play();
    });

    socket.on("stopAllCams", () => {
        console.log("Stopping all cams");
        video.pause();
    });

    socket.on("restartAllCams", () => {
        video.currentTime = 0;
    });

    socket.on("selectCam", (index) => {
        if(index == cam) {
            console.log("live")
            video.classList.add("live");
        } else {
            video.classList.remove("live");
        }
    })
}
