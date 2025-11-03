import { ROW_WIDTHS } from "./consts.js";
import { showWinOverlay } from "./overlay_handler.js";

let solutions = {};
let mirrors = {};

function mirrored(s) {
    let offset = 0;
    let mirr = "";
    for (const rowWidth of ROW_WIDTHS) {
        for (let i = rowWidth - 1; i >= 0; i--) {
            mirr += s[i + offset];
        }
        offset += rowWidth;
    }
    return mirr;
}

export function populateSolutions(solutionRows) {
    for (let i = 1; i < solutionRows.length; i++) {
        // deliberately skipping row 1 because it's headers. and length 0 means we're at the last line (blank).
        const s = solutionRows[i][4];
        if (!s) {
            return;
        }
        const solData = {
            "author": solutionRows[i][2] || "Anonymous",
            "id": solutionRows[i][0] + "." + solutionRows[i][1],
        }
        if (solutionRows[i][3]) {
            solData["date"] = solutionRows[i][3];
        }
        solutions[s] = solData;
        mirrors[mirrored(s)] = s;
    }
}

export function solve(puzzle, pieces) {
    // map piece IDs to pieces, clear existing placement
    const piece_ids = {};
    for (const p of pieces) {
        piece_ids[p.id] = p;
        p.remove();
    }

    // flatten puzzle into a list of triangles
    let triangles = [];
    puzzle.forEach(row => triangles = triangles.concat(row));

    // pick an arbitrary solution to show
    const s = Object.keys(solutions)[0];

    // assign new triangles to each piece
    for (let i=0; i<s.length; i++) {
        const p = piece_ids[s[i]];
        p.triangles.push(triangles[i]);
    }
}

export function checkSolution(puzzle, puzzleLocs, pieces) {
    const solMap = new Map();
    for (const p of pieces) {
        for (const t of p.triangles) {
            if (!puzzleLocs.has(t) || solMap.has(t)) {
                return;
            }
            solMap.set(t, p.id);
        }
    }

    let sol = "";
    for (const row of puzzle) {
        for (const t of row) {
            sol += solMap.get(t);
        }
    }

    let isMirror = false;
    let solData = solutions[sol];
    if (!solData && mirrors[sol]) {
        isMirror = true;
        solData = solutions[mirrors[sol]];
    }
    showWinOverlay(sol, solData, isMirror);
}
