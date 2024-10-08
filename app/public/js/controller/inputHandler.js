import {MAX_CAMS, MODE} from "/js/constants.js";

export function listenForInputs() {

    if(MODE === "DEV") {
        document.addEventListener("keydown", (event) => {
            for(let i = 1; i <= MAX_CAMS; i++) {
                if(event.key === i.toString()) {
                    document.dispatchEvent(new CustomEvent("selectCam", {detail: i}));
                }
            }

            if(event.key === "Enter") {
                document.dispatchEvent(new CustomEvent("confirmPressed"));
            }
        });

        return;
    }

    document.addEventListener("keydown", (event) => {

        //Cam 1
        const camKeys = {
            1: ["Backspace", "Alt", "-", "*"],
            2: ["+", "PageUp", "ArrowRight"],
            3: ["Enter", "PageDown", "Delete"]
        }

        for(let i = 1; i <= MAX_CAMS; i++) {
            if(camKeys[i].includes(event.key)) {
                document.dispatchEvent(new CustomEvent("selectCam", {detail: i}));
            }
        }

        const confirmKeys = ["Insert", "End", "ArrowLeft", "Home"]

        if(event.key === "Enter") {
            document.dispatchEvent(new CustomEvent("confirmPressed"));
        }
    });

}