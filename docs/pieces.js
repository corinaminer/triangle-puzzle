import { COLS, H, L, ROWS } from "./consts.js";
import { grid } from "./puzz.js";
import { colors, Point, toStyle } from "./utils.js";

const PIECE_OPACITY = 0.7;

const STARTING_POINTS = [
    [1, 7],
    [2, 14],
    [5, 3],
    [6, 12],
    [9, 5],
    [12, 10],
    [6, 30],
    [6, 38],
    [9, 37],
    [2, 36],
    [12, 30],
    [2, 28],
];

export function shufflePieces(pieces) {
    // Shuffle piece order so that which piece goes to which starting spot will be random
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        // Rotate 0-5 times
        const rotations = Math.floor(Math.random() * 6);
        for (let n = 0; n < rotations; n++) {
            piece.rotate(piece.triangles[0], false);
        }
        // Flip?
        if (Math.random() < 0.5) {
            piece.flip(piece.triangles[0]);
        }
        // Move to starting spot
        const destRow = STARTING_POINTS[i][0] + 1;
        const destCol = STARTING_POINTS[i][1] + 1;
        const randomT = piece.triangles[Math.floor(Math.random() * 6)];
        piece.moveByRowColOffset(destRow - randomT.r, destCol - randomT.c);
    }
}

function toPieceFillStyle(color) {
    return "rgb(" + color + " / " + PIECE_OPACITY + ")";
}

function shiftTo(coords, clickedTriangle) {
    // Shifts the provided set of triangle coords to include the coordinate of the clicked triangle, so pieces don't jump out from under u.
    // coords format: [[r1,c1], [r2,c2],... [r6,c6]]
    const goalR = clickedTriangle.r;
    const goalC = clickedTriangle.c;
    let closest;
    let closestDistance;
    for (let coord of coords) {
        const distance = Math.abs(coord[0] - goalR) + Math.abs(coord[1] - goalC);
        if (distance == 0) {
            return; // already on the target triangle
        } else if (distance % 2) {
            continue; // this triangle would be the opposite orientation from our target triangle
        } else if (!closestDistance || distance < closestDistance) {
            closestDistance = distance;
            closest = coord;
        }
    }
    const rOffset = goalR - closest[0];
    const cOffset = goalC - closest[1];
    coords.forEach(c => {
        c[0] += rOffset;
        c[1] += cOffset;
    })
}

function moveInBounds(coords) {
    let rOffset = 0;
    let cOffset = 0;
    const rows = coords.map(rc => rc[0]);
    const cols = coords.map(rc => rc[1]);
    const minRow = Math.min(...rows);
    const minCol = Math.min(...cols);
    if (minRow < 0) {
        // OOB above canvas. Shift down by at least abs(minRow).
        rOffset = -1 * minRow;
    } else {
        const maxRow = Math.max(...rows);
        if (maxRow >= ROWS) {
            // OOB below canvas. Actually don't understand why this 2 is not a 1.
            rOffset = -1 * (maxRow - (ROWS - 2));
        }
    }
    if (minCol < 0) {
        // OOB left of canvas. Shift right by at least abs(minCol).
        cOffset = -1 * minCol;
    } else {
        const maxCol = Math.max(...cols);
        if (maxCol >= COLS) {
            // OOB right of canvas. Actually don't understand why this 2 is not a 1.
            cOffset = -1 * (maxCol - (COLS - 2));
        }
    }

    // Ensure that rOffset and cOffset are either both even or both odd, to retain original triangle orientations.
    if ((rOffset + cOffset) % 2) {
        if (rOffset) {
            rOffset = rOffset > ROWS / 2 ? rOffset - 1 : rOffset + 1;
        } else {
            cOffset = cOffset > COLS / 2 ? cOffset - 1 : cOffset + 1;
        }
    }

    coords.forEach(rc => {
        rc[0] += rOffset;
        rc[1] += cOffset;
    })
}

/*
First value: Current relative coord, where (0,0) is the center of rotation.
Second value: Target relative coord when rotating 30˚ clockwise.
_____________________________________________________________________
\       /   \ -2,-3 /   \ -2,-1 /   \ -2,1  /   \ -2,3  /   \       /
 \     /     \-3,3 /-2,-2\-2,4 /-2,0 \-1,5 /-2,2 \ 0,6 /     \     /
  \   /       \   / -2,3  \   / -1,4  \   /  0,5  \   /       \   /
---}-{---------}-{---------}-{---------}-{---------}-{---------}-{
  /   \ -1,-4 /   \ -1,-2 /   \ -1,0  /   \ -1,2  /   \ -1,4  /   \
 /     \-3,1 /-1,-3\-2,2 /-1,-1\-1,3 /-1,1 \ 0,4 /-1,3 \ 1,5 /     \
/       \   / -2,1  \   / -1,2  \   /  0,3  \   /  1,4  \   /       \
---------}-{---------}-{---------}-{---------}-{---------}-{---------}
\ 0,-5  /   \ 0,-3  /   \ 0,-1  / * \  0,1  /   \  0,3  /   \  0,5  /
 \-3,-1/0,-4 \-2,0 /0,-2 \-1,1 / 0,0 \ 0,2 / 0,2 \ 1,3 / 0,4 \ 2,4 /
  \   / -2,-1 \   / -1,0  \   /* 0,1 *\   /  1,2  \   /  2,3  \   /
---}-{---------}-{---------}-{---------}-{---------}-{---------}-{
  /   \ 1,-4  /   \ 1,-2  /   \  1,0  /   \  1,2  /   \  1,4  /   \
 /     \-2,-2/1,-3 \-1,-1/ 1,-1\ 0,0 / 1,1 \ 1,1 / 1,3 \ 2,2 /     \
/       \   / -1,-2 \   /  0,-1 \   /  1,0  \   /  2,1  \   /       \
---------}-{---------}-{---------}-{---------}-{---------}-{---------}
\       /   \ 2,-3  /   \ 2,-1  /   \  2,1  /   \  2,3  /   \       /
 \     /     \-1,-3/2,-2 \0,-2 / 2,0 \1,-1 / 2,2 \ 2,0 /     \     /
  \   /       \   / 0,-3  \   / 1,-2  \   / 2,-1  \   /       \   /
---}-{---------}-{---------}-{---------}-{---------}-{---------}-{
  /   \       /   \ 3,-2  /   \  3,0  /   \  3,2  /   \       /   \
 /     \     /     \0,-4 /     \1,-3 /     \2,-2 /     \     /     \
/       \   /       \   /       \   /       \   /       \   /       \
---------------------------------------------------------------------
*/
/**
 * Computes displacements to add to a triangle's row and column to find its new position after its piece is rotated.
 * Note that these values are NOT the second coord pairs shown above, but the difference between the two coord pairs.
 *
 * @param rOffset Triangle's row offset from the center-of-rotation triangle (0,0 above)
 * @param cOffset Triangle's column offset from the center-of-rotation triangle
 * @param centerIsUp Whether the center-of-rotation triangle points up
 * @param counterclockwise Whether the piece is being rotated counterclockwise
 * @returns 2-element list containing row and column displacements to add to the current triangle's coords to get the post-rotation coords
 */
function getRcDisplacement(rOffset, cOffset, centerIsUp, counterclockwise) {
    const rFactorOnR = -0.5 * rOffset;
    const cFactorOnR = (counterclockwise ? -0.5 : 0.5) * cOffset;
    const rFactorOnC = (counterclockwise ? 1.5 : -1.5) * rOffset;
    const cFactorOnC = -0.5 * cOffset;
    let rChange = rFactorOnR + cFactorOnR;
    // Offset by 1 to switch triangle's up/down orientation. Switching sign for counterclockwise means a clockwise
    // rotation followed by a counterclockwise rotation will usually put the piece back in its original position.
    let cChange = rFactorOnC + cFactorOnC + (counterclockwise ? -1 : 1);
    if ((rOffset + cOffset) % 2) {
        // rChange and cChange are odd multiples of 0.5 and must be rounded. Don't fully understand the reasoning
        // for when to round up vs down, but trial and error followed by logic simplification brought us here.
        rChange = centerIsUp ? Math.floor(rChange) : Math.ceil(rChange);
        cChange = (centerIsUp == counterclockwise) ? Math.floor(cChange) : Math.ceil(cChange);
    }
    return [rChange, cChange];
}

class Piece {
    constructor() {}
    vertices() {
        if (this._vertices) {
            return this._vertices;
        }
        const segments = [];
        for (let triangle of this.triangles) {
            if (triangle.c == 0 || this.triangles.indexOf(grid[triangle.r][triangle.c - 1]) == -1) {
                // Triangle's left edge is part of the piece's edge
                segments.push([triangle.tip, triangle.left]);
            }
            if (triangle.c == COLS - 1 || this.triangles.indexOf(grid[triangle.r][triangle.c + 1]) == -1) {
                // Triangle's right edge is part of the piece's edge
                segments.push([triangle.tip, triangle.right]);
            }
            if (triangle.up && (triangle.r == ROWS - 1 || this.triangles.indexOf(grid[triangle.r + 1][triangle.c]) == -1)) {
                // Triangle's bottom edge is part of the piece's edge
                segments.push([triangle.left, triangle.right]);
            } else if (!triangle.up && (triangle.r == 0 || this.triangles.indexOf(grid[triangle.r - 1][triangle.c]) == -1)) {
                // Triangle's top edge is part of the piece's edge
                segments.push([triangle.left, triangle.right]);
            }
        }
        this._vertices = segments.pop();
        let lastVertex = this._vertices[this._vertices.length - 1];
        while (!this._vertices[0].equals(lastVertex)) {
            // Add to vertices by finding the one other segment that connects to its final point
            let found = false;
            for (let i = 0; i < segments.length; i++) {
                const lastVertexIndex = segments[i].findIndex(v => v.equals(lastVertex));
                if (lastVertexIndex != -1) {
                    const nextSegment = segments.splice(i, 1)[0];
                    const nextVertexIndex = lastVertexIndex == 0 ? 1 : 0;
                    this._vertices.push(nextSegment[nextVertexIndex]);
                    lastVertex = this._vertices[this._vertices.length - 1];
                    found = true;
                    break;
                }
            }
        }
        return this._vertices;
    }

    draw(ctx) {
        this._draw(ctx, this.vertices());
    }
    draw_with_offset(ctx, xOffset, yOffset) {
        const offset_vertices = this.vertices().map(v => new Point(v.x + xOffset, v.y + yOffset));
        this._draw(ctx, offset_vertices);
    }
    _draw(ctx, vertices) {
        this.path = new Path2D();
        for (const v of vertices) {
            this.path.lineTo(v.x, v.y);
        }
        ctx.fillStyle = toPieceFillStyle(this.color());
        ctx.strokeStyle = toStyle(colors.pieceBorder);
        ctx.fill(this.path);
        ctx.stroke(this.path);
    }
    moveByPixelOffset(xOffset, yOffset) {
        let rowChange = Math.round(yOffset / H);
        let colChange = Math.round(xOffset / (L / 2));
        this.moveByRowColOffset(rowChange, colChange);
    }
    moveByRowColOffset(rowChange, colChange) {
        // Force both row and column changes to either both be even or both be odd.
        // TODO Could probably be cleaner on where it snaps.
        if ((rowChange + colChange) % 2) {
            if (rowChange > 0) {
                rowChange -= 1;
            } else if (rowChange < 0) {
                rowChange += 1;
            } else if (colChange > 0) {
                colChange -= 1;
            } else if (colChange < 0) {
                colChange += 1;
            }
        }
        const newCoords = this.triangles.map(t => [t.r + rowChange, t.c + colChange]);

        // Bring landing spot in bounds if necessary
        moveInBounds(newCoords);

        // Define new triangles based on these offsets and clear vertices cache
        this._vertices = null;
        this.triangles = newCoords.map(rc => grid[rc[0]][rc[1]]);
    }
    rotate(clickedTriangle, counterclockwise) {
        const rotationT = clickedTriangle;
        const newCoords = [];
        for (const t of this.triangles) {
            const rOffset = t.r - rotationT.r;
            const cOffset = t.c - rotationT.c;
            const displacement = getRcDisplacement(rOffset, cOffset, rotationT.up, counterclockwise);
            newCoords.push([t.r + displacement[0], t.c + displacement[1]]);
        }

        // Shift the piece onto the clicked triangle if it's not on it already
        shiftTo(newCoords, clickedTriangle);

        // Bring landing spot in bounds if necessary. TODO also try to keep it on the clicked triangle if possible
        moveInBounds(newCoords);

        this._vertices = null;
        this.triangles = newCoords.map(rc => grid[rc[0]][rc[1]]);
    }
    flip(clickedTriangle) {
        const flipT = clickedTriangle;
        const newCoords = [];
        for (const t of this.triangles) {
            const cOffset = t.c - flipT.c;
            newCoords.push([t.r, t.c - 2 * cOffset]);
        }

        // Shift the piece onto the clicked triangle if it's not on it already
        shiftTo(newCoords, clickedTriangle);

        // Bring landing spot in bounds if necessary. TODO also try to keep it on the clicked triangle if possible
        moveInBounds(newCoords);
        this._vertices = null;
        this.triangles = newCoords.map(rc => grid[rc[0]][rc[1]]);
    }
    remove() {
        // "Removes" the piece from the puzzle board (to be placed somewhere new programmatically)
        this._vertices = null;
        this.triangles = [];
    }
}

class Heart extends Piece {
    constructor() {
        super();
        this.id = "0";
        const start_row = STARTING_POINTS[0][0];
        const start_col = STARTING_POINTS[0][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row][start_col + 2],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 2][start_col + 1],
        ];
    }
    color() {
        return colors.red;
    }
}

class Hook extends Piece {
    constructor() {
        super();
        this.id = "1";
        const start_row = STARTING_POINTS[1][0];
        const start_col = STARTING_POINTS[1][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 1],
            grid[start_row + 2][start_col],
            grid[start_row + 2][start_col + 1],
        ];
    }
    color() {
        return colors.green;
    }
}

class Mountain extends Piece {
    constructor() {
        super();
        this.id = "2";
        const start_row = STARTING_POINTS[2][0];
        const start_col = STARTING_POINTS[2][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row][start_col + 2],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 1][start_col + 3],
        ];
    }
    color() {
        return colors.blue;
    }
}

class Y extends Piece {
    constructor() {
        super();
        this.id = "3";
        const start_row = STARTING_POINTS[3][0];
        const start_col = STARTING_POINTS[3][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 2],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 2][start_col + 1],
        ];
    }
    color() {
        return colors.white;
    }
}

class Bow extends Piece {
    constructor() {
        super();
        this.id = "4";
        const start_row = STARTING_POINTS[4][0];
        const start_col = STARTING_POINTS[4][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 2][start_col + 1],
        ];
    }
    color() {
        return colors.orange;
    }
}

class Hexagon extends Piece {
    constructor() {
        super();
        this.id = "5";
        const start_row = STARTING_POINTS[5][0];
        const start_col = STARTING_POINTS[5][1];
        this.triangles = [];
        for (let j = 0; j < 2; j++) {
            for (let i = 0; i < 3; i++) {
                this.triangles.push(grid[start_row + j][start_col + i]);
            }
        }
    }
    vertices() {
        const topLeftT = this.triangles[0];
        const bottomT = this.triangles[4];
        const topRightT = this.triangles[2];
        return [topLeftT.tip, topLeftT.left, bottomT.left, bottomT.right, topRightT.right, topRightT.tip, topLeftT.tip];
    }
    rotate() {
        return;
    }
    flip() {
        return;
    }
    color() {
        return colors.yellow;
    }
}

class Chevron extends Piece {
    constructor() {
        super();
        this.id = "6";
        const start_row = STARTING_POINTS[6][0];
        const start_col = STARTING_POINTS[6][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 2][start_col],
            grid[start_row + 2][start_col + 1],
            grid[start_row + 3][start_col],
        ];
    }
    color() {
        return colors.red;
    }
}

class Lightning extends Piece {
    constructor() {
        super();
        this.id = "7";
        const start_row = STARTING_POINTS[7][0];
        const start_col = STARTING_POINTS[7][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 3],
            grid[start_row + 1][start_col - 2],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 3],
        ];
    }
    color() {
        return colors.green;
    }
}

class Check extends Piece {
    constructor() {
        super();
        this.id = "8";
        const start_row = STARTING_POINTS[8][0];
        const start_col = STARTING_POINTS[8][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 3],
            grid[start_row + 2][start_col - 2],
            grid[start_row + 2][start_col - 1],
        ];
    }
    color() {
        return colors.blue;
    }
}

class Line extends Piece {
    constructor() {
        super();
        this.id = "9";
        const start_row = STARTING_POINTS[9][0];
        const start_col = STARTING_POINTS[9][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 2],
            grid[start_row + 2][start_col - 1],
            grid[start_row + 3][start_col - 2],
        ];
    }
    color() {
        return colors.white;
    }
}

class A extends Piece {
    constructor() {
        super();
        this.id = "a";
        const start_row = STARTING_POINTS[10][0];
        const start_col = STARTING_POINTS[10][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 2],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
        ];
    }
    color() {
        return colors.orange;
    }
}

class Triangly extends Piece {
    constructor() {
        super();
        this.id = "b";
        const start_row = STARTING_POINTS[11][0];
        const start_col = STARTING_POINTS[11][1];
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 1][start_col + 3],
        ];
    }
    color() {
        return colors.yellow;
    }
}

export function initPieces() {
    return [
        new Heart(),
        new Hook(),
        new Mountain(),
        new Y(),
        new Bow(),
        new Hexagon(),
        new Chevron(),
        new Lightning(),
        new Check(),
        new Line(),
        new A(),
        new Triangly(),
    ];
}