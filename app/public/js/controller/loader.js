import {Camera} from "./cam.js";
import {MAX_CAMS, SCORE_INTERVAL} from "/js/constants.js";

export async function fetchAvailableCams() {

    let cams = [];

    for(let i = 1; i <= MAX_CAMS; i++) {
        let res = await fetch("/video/cam" + i + ".mp4");
        if(!res.ok) continue;

        res = await fetch("/video/cam" + i + ".json");
        if(!res.ok) {
            console.warn("No metadata for cam" + i);
            continue;
        }

        let metadata = await res.json();
        metadata.scoreList = parseScoreList(metadata);
        const cam = new Camera("/video/cam" + i + ".mp4", metadata, "#cameras");
        await cam.init();
        cams.push(cam);
    }

    return cams;
}

function parseScoreList(metadata) {
    let entries = metadata.duration * 1000 / SCORE_INTERVAL;
    let scoreList = new Array(entries).fill(0);

    metadata.scoreList.forEach(score => {
        let from = score.from * 1000 / SCORE_INTERVAL;
        let to = score.to * 1000 / SCORE_INTERVAL;
        for(let i = from; i < to; i++) {
            scoreList[i] = score.points;
        }
    });

    return scoreList;
}
