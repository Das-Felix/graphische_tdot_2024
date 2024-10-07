import {MAX_CAMS} from "/js/constants.js";

export function listenForInputs() {

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

}