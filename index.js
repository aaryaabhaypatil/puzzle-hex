import "./AACWebComponent/aac.js";
import { AACBoard } from "./AACWebComponent/aac.js";
import { SvgPlus } from "./AACWebComponent/utils.js";
import { OBBoardManager } from "./openboard.js";

SvgPlus.defineHTMLElement(AACBoard, "aac-board");

let isSquidly = true;
if (!window.SquidlyAPI) {
    window.SquidlyAPI = {
        firebaseOnValue: () => {},
        firebaseSet: () => {},
        speak: () => {},
        loadUtterances: () => {},
        setGridSize: () => {},
    }
    isSquidly = false;

}

const aacBoard = document.querySelector("aac-board");
aacBoard.root.toggleAttribute("squidly", isSquidly);
let manager;
aacBoard.addEventListener("change", e => {
    // UPDATE STATE 
    window.SquidlyAPI.firebaseSet("value1", JSON.stringify(aacBoard.state));

    if (e.changes.indexOf("history") !== -1) {
        console.log("HISTORY CHANGED. CURRENT BOARD:", aacBoard.currentBoardID);
        let board = manager.getBoard(aacBoard.currentBoardID);

        const utterances = board.buttons.map(button => {
            return button.textInserted ? button.utterance : null;
        }).filter(utterance => utterance !== null)
        // Load utternaces
        window.SquidlyAPI.loadUtterances(utterances);

        window.SquidlyAPI.setGridSize(board.grid.rows+1, board.grid.columns);
    }
});

aacBoard.addEventListener("insert", e => {
    let utterance = e.button.utterance;
    window.SquidlyAPI.speak(utterance);
});

export async function setup(url) {
    manager = await OBBoardManager.load(url, (p) => {
        console.log(`Loading board set: ${Math.round(p * 100)}%`);
        document.body.style.setProperty("--p", p);
    });
    aacBoard.manager = manager;
    aacBoard 

    window.SquidlyAPI.firebaseOnValue("value1", value => {
        if (value) {
            aacBoard.state = JSON.parse(value);
        }
    });
    document.body.toggleAttribute("loaded", true);    
}

