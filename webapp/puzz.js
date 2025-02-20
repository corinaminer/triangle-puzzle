import { COLS, H, L, ROWS } from "./consts.js";
import { draw_gridlines_and_border } from "./grid_drawer.js";
import { initOverlays } from "./overlay_handler.js";
import { initPieces } from "./pieces.js";
import { checkSolution, populateSolutions } from "./solution_handler.js";
import { colors, Point } from "./utils.js";

initOverlays(document);

fetch("../solutions.csv")
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
    }
    addPath() {
        this.path = new Path2D();
        this.path.lineTo(this.tip.x, this.tip.y);
        this.path.lineTo(this.left.x, this.left.y);
        this.path.lineTo(this.right.x, this.right.y);
        this.path.lineTo(this.tip.x, this.tip.y);
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

function get_canvas_coord(clickX, clickY) {
    const canvasRect = canvas.getBoundingClientRect();
    return new Point(clickX - canvasRect.left - window.scrollX, clickY - canvasRect.top - window.scrollY);
}

canvas.addEventListener("mousedown", event => {
    if (event.button == 2) {
        // Handled by contextmenu listener
        return;
    }
    event.preventDefault();
    const click = get_canvas_coord(event.layerX, event.layerY);
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
});

canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
    const click = get_canvas_coord(event.layerX, event.layerY);
    for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        if (ctx.isPointInPath(piece.path, click.x, click.y)) {
            piece.flip();
            redraw();
            checkSolution(puzzle, puzzleLocs, pieces);
            break;
        } 
    }
})

canvas.addEventListener("mousemove", event => {
    event.preventDefault();
    if (!clickedPiece || isDrawing) {
        return;
    }
    const cursor = get_canvas_coord(event.layerX, event.layerY);
    isDragging = true;
    isDrawing = true;
    redraw();
    clickedPiece.draw_with_offset(ctx, cursor.x - pickupCoords.x, cursor.y - pickupCoords.y);
    isDrawing = false;
})

canvas.addEventListener("mouseup", async event => {
    event.preventDefault();
    if (!clickedPiece) {
        return;
    }
    const cursor = get_canvas_coord(event.layerX, event.layerY);
    if (isDragging) {
        clickedPiece.move(cursor.x - pickupCoords.x, cursor.y - pickupCoords.y);
    } else {
        let clickedT;
        for (const t of clickedPiece.triangles) {
            if (!t.path) {
                t.addPath();
            }
            if (ctx.isPointInPath(t.path, cursor.x, cursor.y) || ctx.isPointInStroke(t.path, cursor.x, cursor.y)) {
                clickedT = t;
                break;
            }
        }
        clickedPiece.rotate(clickedT);
    }
    clickedPiece = undefined;
    pickupCoords = undefined;
    isDragging = false;
    redraw();
    await new Promise(r => setTimeout(r, 4));
    checkSolution(puzzle, puzzleLocs, pieces);
})

canvas.addEventListener("mouseout", event => {
    event.preventDefault();
    if (!clickedPiece) {
        return;
    }
    clickedPiece.move(event.pageX - pickupCoords.x, event.pageY - pickupCoords.y);
    clickedPiece = undefined;
    pickupCoords = undefined;
    isDragging = false;
    redraw();
})

document.getElementById("resetButton").onclick = () => {
    pieces = initPieces();
    redraw();
}

const modeButton = document.getElementById("modeButton");
modeButton.onclick = () => {
    modeButton.innerHTML = colors.darkMode ? "Dark Mode" : "Light Mode";
    colors.switch();
    redraw();
}
