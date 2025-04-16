import { ROW_WIDTHS } from "./consts.js";

let overlayBackgroundDiv;
let overlayDiv;
let overlayTextDiv;
let justWon = false;

function resetOverlayText() {
    overlayTextDiv.innerHTML = `
        <b>Welcome!</b>
        <p>Can you fit the pieces into the hexagonal frame? There are over 5000 unique solutions!</p>
        <p>Click a piece to rotate it. Shift + click for counterclockwise. Right-click to flip. Sorry, mobile users.</p>
        <p>See <a href="//github.com/corinaminer/triangle-puzzle/" target="_blank">Corina Miner's Github repo</a> to learn more about this puzzle.</p>
    `;
}

function closeOverlay() {
    if (justWon) {
        justWon = false;
        resetOverlayText();
    }
    overlayDiv.classList.remove("active");
    overlayBackgroundDiv.classList.remove("active");
}

function openOverlay() {
    overlayDiv.classList.add("active");
    overlayBackgroundDiv.classList.add("active");
}

export function initOverlays(document) {
    overlayBackgroundDiv = document.querySelector(".overlay-bkgd");
    overlayDiv = document.querySelector(".overlay");
    overlayTextDiv = document.getElementById("overlayText");
    resetOverlayText();

    // Bring up the overlay when user clicks "?" icon
    // Remove overlay when user clicks "x" icon or page outside overlay, or hits escape
    document.querySelector(".help-icon").onclick = openOverlay;
    document.querySelector(".overlay-bkgd").onclick = closeOverlay;
    document.querySelector(".close-btn").onclick = closeOverlay;
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeOverlay();
        }
    });
}

function formatSolution(sol) {
    let rows = [];
    let offset = 0;
    for (const rowWidth of ROW_WIDTHS) {
        const spaces = " ".repeat((13 - rowWidth) / 2);
        rows.push(spaces + sol.substring(offset, offset + rowWidth));
        offset += rowWidth;
    }
    return rows.join("\n");
}

export function showWinOverlay(sol, solData, isMirror) {
    justWon = true;
    let winText = "<b>Congratulations!</b>";

    if (solData) {
        winText += `<p>You've found ${isMirror ? "the mirror image of " : ""} solution ${solData["id"]}! This solution was first discovered by ${solData["author"]} on ${solData["date"] || " an unknown date (2001-2014)"}.</p>`;
    } else {
        winText += `
            <p>You have discovered a new solution!!!</p>
            <p>If you'd like to add this solution to the recorded collection, please <a href="//github.com/corinaminer/triangle-puzzle/issues/new?template=report-a-new-solution.md" target="_blank">open a Github issue</a> and report the following encoding:</p>
            <pre>${formatSolution(sol)}</pre>
        `;
    }
    overlayTextDiv.innerHTML = winText;
    openOverlay();
}
