import express from "express";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Server } from "socket.io";
import * as http from "node:http";

//Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));


// Sockets

io.on("connection", (socket) => {
    console.log("New connection: " + socket.id);
    socket.emit("newHighscore", getHighscore());

    socket.on("startAllCams", () => {
        io.emit("startAllCams");
        console.log("Starting all cams");
    });

    socket.on("stopAllCams", () => {
        io.emit("stopAllCams");
    });

    socket.on("restartAllCams", () => {
        io.emit("restartAllCams");
    });

    socket.on("selectCam", (index) => {
        io.emit("selectCam", index);
    });

    socket.on("submitScore", (score) => {
        saveHighscore(score);
        socket.broadcast.emit("newHighscore", score);
    });
});


//Routes
app.get("/player", (req, res) => {
    res.sendFile(__dirname + "/routes/player.html");
});

app.get("/controller", (req, res) => {
    res.sendFile(__dirname + "/routes/controller.html");
});

function saveHighscore(score) {
    const highscoreFile = path.join(__dirname, 'highscore.txt');

    if (!fs.existsSync(highscoreFile)) {
        fs.writeFileSync(highscoreFile, score.toString(), 'utf8');
        console.log('Highscore file created with score:', score);
    } else {
        const currentHighscore = parseInt(fs.readFileSync(highscoreFile, 'utf8'), 10);

        if (score > currentHighscore) {
            fs.writeFileSync(highscoreFile, score.toString(), 'utf8');
            console.log('Highscore updated to:', score);
        }
    }
}

function getHighscore() {
    const highscoreFile = path.join(__dirname, 'highscore.txt');

    if (!fs.existsSync(highscoreFile)) {
        return 0;
    }

    return parseInt(fs.readFileSync(highscoreFile, 'utf8'), 10);
}



//Start server
server.listen(PORT, () => {
    console.info(`Listening on port: ${PORT}`);
})