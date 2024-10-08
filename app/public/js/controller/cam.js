export class Camera {

    constructor(url, metadata, parentSelector) {
        this.url = url;
        this.metadata = metadata;
        this.parentSelector = parentSelector;

        this.video = document.createElement("video");
        this.video.src = this.url;
        document.querySelector(this.parentSelector).appendChild(this.video);
    }

    start() {
        this.video.play();
    }

    stop() {
        this.video.pause();
    }

    restart() {
        this.video.pause();
        this.video.currentTime = 0;
    }

    getPointsAtTime(t) {
        return this.metadata.scoreList[t];
    }

    async init() {
    }

}