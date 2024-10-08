import {fetchAvailableCams} from "./loader.js";
import {listenForInputs} from "./inputHandler.js";
import { SCORE_INTERVAL } from "../constants.js";

class Controller {

    constructor() {
        this.cameras = [];
        this.socket = io();
        this.currentCam = 0;
        this.points = 0;
        this.gameState = "menu";
        this.highscore = 0;

        this.socket.on("newHighscore", (score) => {
            this.highscore = score;
            console.log("New highscore: " + score);
        });
    }

    async init() {
        await this.fetchCameras();

        listenForInputs();

        document.addEventListener("selectCam", ((event) => {
            this.selectCam(event.detail - 1);
        }).bind(this));

        document.addEventListener("confirmPressed", (() => {
            if(this.gameState === "menu") {
                this.startGame();
            } else if(this.gameState === "end") {
                this.restartGame();
            }
        }).bind(this));


        this.timeRemainingElem = document.getElementById("timeRemaining");
        this.timePassedElem = document.getElementById("timePassed");
        this.countdownElem = document.getElementById("countdown");
        this.camerasElem = document.getElementById("cameras");
        this.pointsElem = document.getElementById("points");
        this.cameraIdElem = document.getElementById("cameraId");
        this.startScreenElem = document.querySelector(".start-screen");
        this.endScreenElem = document.querySelector(".end-screen");
    }

    async startGame() {
        if(this.gameState !== "menu") {
            console.warn("Game already started");
            return;
        }

        this.startScreenElem.style.display = "none";
        this.endScreenElem.style.display = "none";

        this.countdownElem.innerHTML = "3";
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.countdownElem.innerHTML = "2";
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.countdownElem.innerHTML = "1";
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.countdownElem.innerHTML = "";

        this.gameState = "playing";
        await this.selectCam(0);
        this.camerasElem.classList.add("running");

        await this.startAllCams();

        let totalTime = this.cameras[0].metadata.duration * 1000 / SCORE_INTERVAL;
        let t = 0;

        let interval = setInterval(() => {

            if(t >= totalTime) {
                clearInterval(interval);
                this.gameState = "end";
                this.stopAllCams();
                console.log("Game ended");
                this.points = (this.points * 1.2934593).toFixed(0);
                this.socket.emit("submitScore", this.points);
                console.log("Points: " + this.points);
                this.endScreenElem.style.display = "block";
                this.pointsElem.innerHTML = this.formatPoints(this.points);
                return;
            }

            t ++;

            const pointsAtTime = this.cameras[this.currentCam].getPointsAtTime(t);
            if(!isNaN(pointsAtTime)) {
                this.points += pointsAtTime;
            }

            this.timePassedElem.innerHTML = this.formatTime(t * SCORE_INTERVAL);
            this.timeRemainingElem.innerHTML = this.formatTime(totalTime * SCORE_INTERVAL - t * SCORE_INTERVAL);
        }, SCORE_INTERVAL);
    }

    async restartGame() {
        //Reset all values so that startGame can be called again
        this.points = 0;
        this.gameState = "menu";
        this.timePassedElem.innerHTML = "00:00:00";
        this.timeRemainingElem.innerHTML = "00:00:00";
        this.startScreenElem.style.display = "block";
        this.endScreenElem.style.display = "none";

        this.camerasElem.classList.remove("running");
        this.cameras.forEach(cam => cam.restart());

        this.socket.emit("restartGame");
        await this.stopAllCams();
        await this.restartAllCams();
        window.location.reload();
    }

    async fetchCameras() {
        let cams = await fetchAvailableCams();
        this.cameras = cams;

        if(this.cameras.length <= 0) {
            document.body.innerHTML = "No cameras available";
            return;
        }
    }

    async selectCam(index) {
        if(this.gameState !== "playing") {
            return;
        }

        if(index < 0 || index >= this.cameras.length) {
            console.warn("Invalid camera index: " + index);
            return;
        }

        for(let i = 0; i < this.cameras.length; i++) {
            if(i === index) {
                this.cameras[i].video.classList.add("selected");
            } else {
                this.cameras[i].video.classList.remove("selected");
            }
        }

        this.currentCam = index;
        this.socket.emit("selectCam", index + 1);
        this.cameraIdElem.innerHTML = index + 1;

    }

    async startAllCams() {
        this.socket.emit("startAllCams");
        this.cameras.forEach(cam => cam.start());
    }

    async stopAllCams() {
        this.socket.emit("stopAllCams");
        this.cameras.forEach(cam => cam.stop());
    }

    async restartAllCams() {
        this.socket.emit("restartAllCams");
        this.cameras.forEach(cam => cam.restart());
    }


     formatTime(ms) {
        //Format to MM:SS:MS and force the two digits
        let minutes = Math.floor(ms / 60000);
        let seconds = Math.floor((ms % 60000) / 1000);
        let milliseconds = Math.floor((ms % 1000) / 10);

        return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + ":" + (milliseconds < 10 ? "0" : "") + milliseconds;
    }

    formatPoints(points) {
        return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

export default Controller