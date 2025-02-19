import { COLS, H, L, ROWS } from "./consts.js";
import { grid } from "../puzz.js";
import { colors, Point, toStyle } from "./utils.js";

const PIECE_OPACITY = 0.7;

function toPieceFillStyle(color) {
    return "rgb(" + color + " / " + PIECE_OPACITY + ")";
}

class VertexMapping {
    constructor(tIndex, cornerId) {
        this.tIndex = tIndex;
        this.cornerId = cornerId;
    }
    mapToVertex(triangles) {
        const t = triangles[this.tIndex];
        if (this.cornerId == 0) {
            return t.tip;
        } else if (this.cornerId == 1) {
            return t.right;
        }
        return t.left;
    }
    applyRotation(postRotationTriangles) {
        const t = postRotationTriangles[this.tIndex];
        if (t.up) {
            // Previously referred to a down-pointing triangle
            if (this.cornerId == 2) {
                this.cornerId = 0;
            } else if (this.cornerId == 0) {
                this.cornerId = 2;
            }
        } else {
            // Previously referred to an up-pointing triangle
            if (this.cornerId == 1) {
                this.cornerId = 0;
            } else if (this.cornerId == 0) {
                this.cornerId = 1;
            }
        }
    }
    applyFlip() {
        if (this.cornerId == 1) {
            this.cornerId = 2;
        } else if (this.cornerId == 2) {
            this.cornerId = 1;
        }
    }
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

const rotationMapping = new Map([
    [
        -2, 
        new Map([
            [-3, [-1, 5]],
            [-2, [0, 4]],
            [-1, [0, 4]],
            [0, [1, 3]],
            [1, [1, 3]],
            [2, [2, 2]],
            [3, [2, 2]],
        ])
    ],
    [
        -1, 
        new Map([
            [-4, [-2, 4]],
            [-3, [-1, 3]],
            [-2, [-1, 3]],
            [-1, [0, 2]],
            [0, [0, 2]],
            [1, [1, 1]],
            [2, [1, 1]],
            [3, [2, 0]],
            [4, [2, 0]],
        ])
    ],
    [
        0, 
        new Map([
            [-5, [-3, 3]],
            [-4, [-2, 2]],
            [-3, [-2, 2]],
            [-2, [-1, 1]],
            [-1, [-1, 1]],
            [0, [0, 0]],
            [1, [0, 0]],
            [2, [1, -1]],
            [3, [1, -1]],
            [4, [2, -2]],
            [5, [2, -2]],
    ])
    ],
    [
        1, 
        new Map([
            [-4, [-3, 1]],
            [-3, [-2, 0]],
            [-2, [-2, 0]],
            [-1, [-1, -1]],
            [0, [-1, -1]],
            [1, [0, -2]],
            [2, [0, -2]],
            [3, [1, -3]],
            [4, [1, -3]],
        ])
    ],
    [
        2, 
        new Map([
            [-3, [-3, -1]],
            [-2, [-2, -2]],
            [-1, [-2, -2]],
            [0, [-1, -3]],
            [1, [-1, -3]],
            [2, [0, -4]],
            [3, [0, -4]],
        ])
    ],
    [
        3, 
        new Map([
            [-2, [-3, -3]],
            [0, [-2, -4]],
            [2, [-1, -5]],
        ])
    ],
]);

class Piece {
    constructor() {}
    vertices() {
        return this._vertexMappings.map(vm => vm.mapToVertex(this.triangles));
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
    move(xOffset, yOffset) {
        // These must either both be even or both be odd
        let rowChange = Math.round(yOffset / H);
        let colChange = Math.round(xOffset / (L / 2));

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

        // Define new triangles based on these offsets
        this.triangles = newCoords.map(rc => grid[rc[0]][rc[1]]);
    }
    rotate(clickedTriangle) {
        clickedTriangle = this.triangles[this.rotationIndex];
        const newCoords = [];
        for (const t of this.triangles) {
            const rOffset = t.r - clickedTriangle.r;
            const cOffset = t.c - clickedTriangle.c;
            if (clickedTriangle.up) {
                const displacement = rotationMapping.get(rOffset).get(cOffset);
                newCoords.push([t.r + displacement[0], t.c + displacement[1] + 1]);
            } else {
                const displacement = rotationMapping.get(-1 * rOffset).get(-1 * cOffset);
                newCoords.push([t.r - displacement[0], t.c - displacement[1] - 1]);
            }
        }
        if (newCoords.length != 6) {
            console.error("Missing rotation case. Initial triangle coords and proposed new coords:");
            console.log(this.triangles.map(t => [t.r, t.c]));
            console.log(newCoords);
        }

        // Bring landing spot in bounds if necessary
        moveInBounds(newCoords);

        this.triangles = newCoords.map(rc => grid[rc[0]][rc[1]]);
        this._vertexMappings.forEach(vm => vm.applyRotation(this.triangles));
    }
    flip() {
        const flipT = this.triangles[this.rotationIndex];
        const newCoords = [];
        for (const t of this.triangles) {
            const cOffset = t.c - flipT.c;
            newCoords.push([t.r, t.c - 2 * cOffset]);
        }

        // Bring landing spot in bounds if necessary
        moveInBounds(newCoords);
        this.triangles = newCoords.map(rc => grid[rc[0]][rc[1]]);
        this._vertexMappings.forEach(vm => vm.applyFlip());
    }
}

class Heart extends Piece {
    constructor() {
        super();
        this.id = "0";
        const start_row = 1;
        const start_col = 5;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row][start_col + 2],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 2][start_col + 1],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(0, 2),
            new VertexMapping(5, 0),
            new VertexMapping(1, 1),
            new VertexMapping(1, 0),
            new VertexMapping(1, 2),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 3;
    }
    color() {
        return colors.red;
    }
}

class Hook extends Piece {
    constructor() {
        super();
        this.id = "1";
        const start_row = 2;
        const start_col = 12;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 1],
            grid[start_row + 2][start_col],
            grid[start_row + 2][start_col + 1],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(3, 2),
            new VertexMapping(3, 0),
            new VertexMapping(5, 0),
            new VertexMapping(5, 1),
            new VertexMapping(5, 2),
            new VertexMapping(0, 1),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 2;
    }
    color() {
        return colors.green;
    }
}

class Mountain extends Piece {
    constructor() {
        super();
        this.id = "2";
        const start_row = 5;
        const start_col = 1;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row][start_col + 2],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 1][start_col + 3],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(0, 2),
            new VertexMapping(2, 0),
            new VertexMapping(5, 1),
            new VertexMapping(1, 0),
            new VertexMapping(1, 2),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 3;
    }
    color() {
        return colors.blue;
    }
}

class Y extends Piece {
    constructor() {
        super();
        this.id = "3";
        const start_row = 6;
        const start_col = 10;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 2],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 2][start_col + 1],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(0, 2),
            new VertexMapping(1, 2),
            new VertexMapping(1, 0),
            new VertexMapping(5, 2),
            new VertexMapping(5, 0),
            new VertexMapping(5, 1),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 3;
    }
    color() {
        return colors.white;
    }
}

class Bow extends Piece {
    constructor() {
        super();
        this.id = "4";
        const start_row = 9;
        const start_col = 3;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 2][start_col + 1],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(1, 2),
            new VertexMapping(1, 1),
            new VertexMapping(5, 0),
            new VertexMapping(4, 1),
            new VertexMapping(4, 2),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 3;
    }
    color() {
        return colors.orange;
    }
}

class Hexagon extends Piece {
    constructor() {
        super();
        this.id = "5";
        this.triangles = [];
        for (let j = 0; j < 2; j++) {
            for (let i = 0; i < 3; i++) {
                this.triangles.push(grid[12 + j][8 + i]);
            }
        }
    }
    vertices() {
        const topLeftT = this.triangles[0];
        const bottomT = this.triangles[4];
        const topRightT = this.triangles[2];
        return [topLeftT.tip, topLeftT.left, bottomT.left, bottomT.right, topRightT.right, topRightT.tip, topLeftT.tip];
    }
    rotate(clickedTriangle) {
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
        const start_row = 6;
        const start_col = 28;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 2][start_col],
            grid[start_row + 2][start_col + 1],
            grid[start_row + 3][start_col],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(0, 2),
            new VertexMapping(2, 2),
            new VertexMapping(5, 2),
            new VertexMapping(5, 0),
            new VertexMapping(2, 1),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 3;
    }
    color() {
        return colors.red;
    }
}

class Lightning extends Piece {
    constructor() {
        super();
        this.id = "7";
        const start_row = 6;
        const start_col = 36;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 3],
            grid[start_row + 1][start_col - 2],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 3],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(0, 2),
            new VertexMapping(1, 0),
            new VertexMapping(1, 2),
            new VertexMapping(5, 0),
            new VertexMapping(5, 1),
            new VertexMapping(4, 0),
            new VertexMapping(0, 1),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 3;
    }
    color() {
        return colors.green;
    }
}

class Check extends Piece {
    constructor() {
        super();
        this.id = "8";
        const start_row = 9;
        const start_col = 35;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 3],
            grid[start_row + 2][start_col - 2],
            grid[start_row + 2][start_col - 1],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(3, 1),
            new VertexMapping(3, 2),
            new VertexMapping(3, 0),
            new VertexMapping(4, 1),
            new VertexMapping(0, 1),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 5;
    }
    color() {
        return colors.blue;
    }
}

class Line extends Piece {
    constructor() {
        super();
        this.id = "9";
        const start_row = 2;
        const start_col = 34;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 2][start_col - 2],
            grid[start_row + 2][start_col - 1],
            grid[start_row + 3][start_col - 2],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(5, 2),
            new VertexMapping(5, 0),
            new VertexMapping(0, 1),
            new VertexMapping(0, 0),
        ]
        this.rotationIndex = 2;
    }
    color() {
        return colors.white;
    }
}

class A extends Piece {
    constructor() {
        super();
        this.id = "a";
        const start_row = 12;
        const start_col = 28;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 2],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(0, 2),
            new VertexMapping(1, 2),
            new VertexMapping(1, 0),
            new VertexMapping(5, 0),
            new VertexMapping(5, 1),
            new VertexMapping(0, 1),
            new VertexMapping(0, 0),
        ];
        this.rotationIndex = 3;
    }
    color() {
        return colors.orange;
    }
}

class Triangly extends Piece {
    constructor() {
        super();
        this.id = "b";
        const start_row = 2;
        const start_col = 26;
        this.triangles = [
            grid[start_row][start_col],
            grid[start_row + 1][start_col - 1],
            grid[start_row + 1][start_col],
            grid[start_row + 1][start_col + 1],
            grid[start_row + 1][start_col + 2],
            grid[start_row + 1][start_col + 3],
        ];
        this._vertexMappings = [
            new VertexMapping(0, 0),
            new VertexMapping(1, 2),
            new VertexMapping(5, 1),
            new VertexMapping(5, 0),
            new VertexMapping(0, 1),
            new VertexMapping(0, 0),
        ];
        this.rotationIndex = 3;
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