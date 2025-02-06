const ROW_WIDTHS = [3, 5, 7, 9, 11, 13, 13, 11];

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
    let rediscoverMsg;
    if (mirrors[sol]) {
        isMirror = true;
        sol = mirrors[sol];
    }
    const solData = solutions[sol];
    if (solData) {
        rediscoverMsg = "Congratulations! You've found " + (isMirror ? "the mirror image of " : "") + "solution "
        rediscoverMsg += solData["id"] + ", first discovered by " + solData["author"] + " on " + (solData["date"] || " an unknown date (2001-2014)") + "!";
    }

    if (rediscoverMsg) {
        alert(rediscoverMsg);
    } else {
        alert("Congratulations, you have discovered a new solution!!!\n" + sol);
    }
}
