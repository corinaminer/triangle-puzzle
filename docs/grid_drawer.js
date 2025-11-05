import { COLS, H, L, ROWS } from "./consts.js";
import { colors, Point, toStyle } from "./utils.js";

const gridlines = [];
const borderline = [];

function initForGridAndPuzzle(grid, puzzle) {
    const row_starts = new Set();
    const pos_slope_starts = new Set();
    const neg_slope_starts = new Set();

    for (const t of grid[0]) {
        // First row of triangles: upper tips start neg slope lines
        if (t.up) {
            neg_slope_starts.add(t.tip);
        }
    }
    for (const row of grid) {
        const t = row[0];
        // First triangle in each row: tips & left edges start row lines, left edge starts pos & neg slope lines
        row_starts.add(t.tip);
        row_starts.add(t.left);
        pos_slope_starts.add(t.left);
        neg_slope_starts.add(t.left);
    }
    for (const t of grid[grid.length - 1]) {
        // Last row of triangles: lower tips start pos slope lines
        if (!t.up) {
            pos_slope_starts.add(t.tip);
        }
    }

    // Populate gridlines
    const width = L * Math.ceil(COLS / 2);
    const height = H * ROWS;
    for (const p of row_starts) {
        length = p.x > 0 ? width - L : width;
        gridlines.push([p, new Point(p.x + length, p.y)]);
    }
    for (const p of pos_slope_starts) {
        let x = p.x + L / 2;
        let y = p.y - H;
        while (x < width && y > 0) {
            x += L / 2;
            y -= H;
        }
        gridlines.push([p, new Point(x, y)]);
    }
    for (const p of neg_slope_starts) {
        let x = p.x + L / 2;
        let y = p.y + H;
        while (x < width && y < height) {
            x += L / 2;
            y += H;
        }
        gridlines.push([p, new Point(x, y)]);
    }

    // Populate borderline
    borderline.push(puzzle[0][0].tip);
    borderline.push(puzzle[5][0].left);
    borderline.push(puzzle[7][0].tip);
    borderline.push(puzzle[7][puzzle[7].length - 1].tip);
    borderline.push(puzzle[5][puzzle[5].length - 1].right);
    borderline.push(puzzle[0][puzzle[0].length - 1].tip);
    borderline.push(puzzle[0][0].tip);
}

export function draw_gridlines_and_border(ctx, grid, puzzle) {
    if (!gridlines.length) {
        initForGridAndPuzzle(grid, puzzle);
    }

    const gridlineStyle = toStyle(colors.gridlines);
    const borderlineStyle = toStyle(colors.puzzleBorder);

    // Draw gridlines
    ctx.strokeStyle = gridlineStyle;
    for (const g of gridlines) {
        ctx.beginPath();
        ctx.moveTo(g[0].x, g[0].y);
        ctx.lineTo(g[1].x, g[1].y);
        ctx.stroke();
    }

    // Draw puzzle border
    ctx.strokeStyle = borderlineStyle;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (const vertex of borderline) {
        ctx.lineTo(vertex.x, vertex.y);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
}
