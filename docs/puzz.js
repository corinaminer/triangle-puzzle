import { COLS, H, L, ROWS } from "./consts.js";
import { fireworks } from "./fireworks.js";
import { draw_gridlines_and_border } from "./grid_drawer.js";
import { initOverlays, showWinOverlay } from "./overlay_handler.js";
import { initPieces, shufflePieces } from "./pieces.js";
import { getSolution, populateSolutions, solve } from "./solution_handler.js";
import { colors, combineStyles, Point, sleep } from "./utils.js";

initOverlays(document);

fetch("https://raw.githubusercontent.com/corinaminer/triangle-puzzle/master/solutions.csv")
  .then(response => response.text())
  .then(csvText => populateSolutions(csvText.split('\n').map(row => row.split(','))));

function triangle_tip_coords(r, c, up) {
    const tip_x = (c + 1) * L / 2;
    let tip_y = r * H;
    if (!up) {
        tip_y += H;
    }
    return new Point(tip_x, tip_y);
}

class Triangle {
    constructor(r, c, up) {
        this.r = r;
        this.c = c;
        this.up = up;
        this.tip = triangle_tip_coords(r, c, up);
        this.left = new Point(this.tip.x - L / 2, this.up ? this.tip.y + H : this.tip.y - H);
        this.right = new Point(this.tip.x + L / 2, this.left.y);
        this.styles = {};
    }
    getPath() {
        if (!this.path) {
            this.path = new Path2D();
            this.path.lineTo(this.tip.x, this.tip.y);
            this.path.lineTo(this.left.x, this.left.y);
            this.path.lineTo(this.right.x, this.right.y);
            this.path.lineTo(this.tip.x, this.tip.y);
        }
        return this.path;
    }
    addStyle(id, style) {
        this.styles[id] = style;
    }
    removeStyle(id) {
        delete this.styles[id];
    }
    computeStyle() {
        return combineStyles(Object.values(this.styles));
    }
}

export const grid = []
for (let r = 0; r < ROWS; r ++) {
    const row = [];
    let up = r % 2 == 0;
    for (let c = 0; c < COLS; c++) {
        row.push(new Triangle(r, c, up));
        up = !up;
    }
    grid.push(row);
}

// Puzzle has 8 rows
const puzzle = []
const puzzleLocs = new Set();
let puzzleRow = ROWS / 2 - 4;
let puzzleCol = Math.floor(COLS / 2) - 1;
let rowLen = 3
for (let i = 0; i < 8; i++) {
    const row = []
    for (let j = 0; j < rowLen; j++) {
        const t = grid[puzzleRow][puzzleCol + j];
        row.push(t);
        puzzleLocs.add(t);
    }
    puzzle.push(row)
    puzzleRow++;
    if (i < 5) {
        puzzleCol--;
        rowLen += 2;
    } else if (i == 6) {
        puzzleCol++;
        rowLen -= 2;
    }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let pieces = initPieces();

let clickedPiece;
let pickupCoords;
let isDragging = false;
let isDrawing = false;

function redraw() {
    ctx.fillStyle = "rgb(" + colors.backgrd + " / 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const row of grid) {
        for (const t of row) {
            const style = t.computeStyle();
            if (style) {
                ctx.fillStyle = style;
                ctx.fill(t.getPath());
            }
            /*
            // Different overlap approach: just draw the triangle in each style, overlapping
            if (t.styles) {
                for (const s of Object.values(t.styles)) {
                    ctx.fillStyle = toStyle(s.color, s.opacity);
                    ctx.fill(t.getPath());
                }
            }
            */
        }
    }
    draw_gridlines_and_border(ctx, grid, puzzle);
    // Draw first 11 pieces
    for (let i = 0; i < 11; i++) {
        pieces[i].draw(ctx);
    }
    // If not actively moving a piece, draw 12th piece too
    if (!clickedPiece) {
        pieces[11].draw(ctx);
    } 
}
redraw();

async function checkSolution() {
    const [sol, solData, isMirror] = getSolution(puzzle, puzzleLocs, pieces);
    if (sol) {
        allowInputs(false);
        for (const frameDuration of fireworks(grid, puzzle, puzzleLocs, pieces)) {
            redraw();
            await sleep(frameDuration);
        }
        grid.forEach(row => row.forEach(t => t.styles = {}));
        redraw();
        showWinOverlay(sol, solData, isMirror);
        allowInputs(true);
    }
}

function getCanvasCoord(clickX, clickY) {
    const canvasRect = canvas.getBoundingClientRect();
    return new Point(clickX - canvasRect.left - window.scrollX, clickY - canvasRect.top - window.scrollY);
}

function findClickedT(clickedPiece, cursorX, cursorY) {
    // Finds which triangle within a clicked piece was clicked
    for (const t of clickedPiece.triangles) {
        const tPath = t.getPath();
        if (ctx.isPointInPath(tPath, cursorX, cursorY) || ctx.isPointInStroke(tPath, cursorX, cursorY)) {
            return t;
        }
    }
}

const mousedownFunc = event => {
    if (event.button == 2) {
        // Handled by contextmenu listener
        return;
    }
    event.preventDefault();
    const click = getCanvasCoord(event.layerX, event.layerY);
    for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        if (ctx.isPointInPath(piece.path, click.x, click.y)) {
            clickedPiece = piece;
            pickupCoords = click;
            pieces.splice(i, 1);
            pieces.push(piece);
            break;
        } 
    }
};

const rightClickFunc = event => {
    event.preventDefault();
    const click = getCanvasCoord(event.layerX, event.layerY);
    for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        if (ctx.isPointInPath(piece.path, click.x, click.y)) {
            piece.flip(findClickedT(piece, click.x, click.y));
            redraw();
            checkSolution();
            break;
        } 
    }
};

const mouseMoveFunc = event => {
    event.preventDefault();
    if (!clickedPiece || isDrawing) {
        return;
    }
    const cursor = getCanvasCoord(event.layerX, event.layerY);
    isDragging = true;
    isDrawing = true;
    redraw();
    clickedPiece.draw_with_offset(ctx, cursor.x - pickupCoords.x, cursor.y - pickupCoords.y);
    isDrawing = false;
};

const mouseUpFunc = async event => {
    event.preventDefault();
    if (!clickedPiece) {
        return;
    }
    const cursor = getCanvasCoord(event.layerX, event.layerY);
    if (isDragging) {
        clickedPiece.moveByPixelOffset(cursor.x - pickupCoords.x, cursor.y - pickupCoords.y);
    } else {
        clickedPiece.rotate(findClickedT(clickedPiece, cursor.x, cursor.y), event.shiftKey);
    }
    clickedPiece = undefined;
    pickupCoords = undefined;
    isDragging = false;
    redraw();
    await new Promise(r => setTimeout(r, 4));
    checkSolution();
};

const mouseOutFunc = event => {
    event.preventDefault();
    if (!clickedPiece) {
        return;
    }
    clickedPiece.moveByPixelOffset(event.pageX - pickupCoords.x, event.pageY - pickupCoords.y);
    clickedPiece = undefined;
    pickupCoords = undefined;
    isDragging = false;
    redraw();
};

const resetButton = document.getElementById("resetButton");
const shuffleButton = document.getElementById("shuffleButton");
const modeButton = document.getElementById("modeButton");
const solveButton = document.getElementById("solveButton");

const resetFunc = () => {
    pieces = initPieces();
    redraw();
}
const shuffleFunc = () => {
    shufflePieces(pieces);
    redraw();
}
const modeFunc = () => {
    modeButton.innerHTML = colors.darkMode ? "Dark Mode" : "Light Mode";
    colors.switch();
    redraw();
}
const solveFunc = () => {
    solve(puzzle, pieces);
    redraw();
}

function allowInputs(allow) {
    if (allow) {
        canvas.addEventListener("mousedown", mousedownFunc);
        canvas.addEventListener("contextmenu", rightClickFunc);
        canvas.addEventListener("mousemove", mouseMoveFunc);
        canvas.addEventListener("mouseup", mouseUpFunc);
        canvas.addEventListener("mouseout", mouseOutFunc);
        resetButton.onclick = resetFunc;
        shuffleButton.onclick = shuffleFunc;
        modeButton.onclick = modeFunc;
        solveButton.onclick = solveFunc;
    } else {
        canvas.removeEventListener("mousedown", mousedownFunc);
        canvas.removeEventListener("contextmenu", rightClickFunc);
        canvas.removeEventListener("mousemove", mouseMoveFunc);
        canvas.removeEventListener("mouseup", mouseUpFunc);
        canvas.removeEventListener("mouseout", mouseOutFunc);
        resetButton.onclick = null;
        shuffleButton.onclick = null;
        modeButton.onclick = null;
        solveButton.onclick = null;
    }
}

allowInputs(true);