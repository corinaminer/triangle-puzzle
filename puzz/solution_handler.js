import { Point } from "./utils.js";

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
    const sol = [];
    for (const row of puzzle) {
        sol.push(row.map(t => solMap.get(t)));
    }
    alert("you win! your solution is: " + sol.join(""));
}

