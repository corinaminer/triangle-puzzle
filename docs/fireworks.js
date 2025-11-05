import { Style } from "./utils.js";

const Direction = {
    UP_LEFT: "UP_LEFT",
    UP_RIGHT: "UP_RIGHT",
    RIGHT: "RIGHT",
    DOWN_RIGHT: "DOWN_RIGHT",
    DOWN_LEFT: "DOWN_LEFT",
    LEFT: "LEFT",
};

function nextTriangle(grid, lastT, direction) {
    let nextR, nextC;
    switch(direction) {
        case Direction.UP_LEFT:
            nextR = lastT.up ? lastT.r : lastT.r - 1;
            nextC = lastT.up ? lastT.c - 1 : lastT.c;
            break;
        case Direction.UP_RIGHT:
            nextR = lastT.up ? lastT.r : lastT.r - 1;
            nextC = lastT.up ? lastT.c + 1 : lastT.c;
            break;
        case Direction.RIGHT:
            nextR = lastT.r;
            nextC = lastT.c + 1;
            break;
        case Direction.DOWN_RIGHT:
            nextR = lastT.up ? lastT.r + 1 : lastT.r;
            nextC = lastT.up ? lastT.c : lastT.c + 1;
            break;
        case Direction.DOWN_LEFT:
            nextR = lastT.up ? lastT.r + 1 : lastT.r;
            nextC = lastT.up ? lastT.c : lastT.c - 1;
            break;
        case Direction.LEFT:
            nextR = lastT.r;
            nextC = lastT.c - 1;
            break;
    }
    if (nextR < 0 || nextC < 0 || nextR >= grid.length || nextC >= grid[0].length) {
        return null;
    }
    return grid[nextR][nextC];
}

function* getBorderTriangles(puzzle, pieces) {
    const topAndBottom = puzzle[0].concat(puzzle[puzzle.length - 1])
    for (const t of topAndBottom) {
        const color = pieces.find(p => p.triangles.indexOf(t) !== -1).color();
        yield [t, color];
    }
    // middle rows
    for (let i = 1; i < 7; i++) {
        const row = puzzle[i];
        const startT = row[0];
        const endT = row[row.length - 1];
        const startColor = pieces.find(p => p.triangles.indexOf(startT) !== -1).color();
        const endColor = pieces.find(p => p.triangles.indexOf(endT) !== -1).color();
        yield [startT, startColor];
        yield [endT, endColor];
    }
}

class Worm {
    constructor(id, startT, styles, direction) {
        this.id = id;
        this.triangles = [startT];
        this.styles = styles;
        this.direction = direction;
    }
    iterate(grid) {
        if (this.triangles[0].styles && this.triangles[0].styles[this.id]) {
            // If we've already styled the first triangle, add the next one
            const nextT = nextTriangle(grid, this.triangles[this.triangles.length - 1], this.direction);
            if (nextT) {
                this.triangles.push(nextT);
            }
            for (let i=this.triangles.length - 1; i > 0; i--) {
                this.triangles[i].addStyle(this.id, this.triangles[i - 1].styles[this.id]);
            }
        }
        if (this.styles.length) {
            this.triangles[0].addStyle(this.id, this.styles.shift());
        } else {
            this.triangles[0].removeStyle(this.id);
            this.triangles.shift();
        }
    }
}

function* worms(grid, puzzle, puzzleLocs, pieces) {
    let runningWorms = [];
    const opacities = Array.from({ length: 10 }, (_, i) => 1 - 0.1 * i);
    let wormCount = 0;
    for (const [t, color] of getBorderTriangles(puzzle, pieces)) {
        for (const direction in Direction) {
            const nextT = nextTriangle(grid, t, direction);
            if (!puzzleLocs.has(nextT)) {
                wormCount++;
                const styles = opacities.map(o => new Style(color, o));
                runningWorms.push(new Worm(wormCount.toString(), nextT, styles, direction));
            }
        }
    }

    let iterationCount = 0;
    while (runningWorms.length) {
        const stillRunning = [];
        for (const worm of runningWorms) {
            worm.iterate(grid);
            if (worm.triangles.length) {
                stillRunning.push(worm);
            }
        }
        runningWorms = stillRunning;
        // Decent for slo-mo
        // yield 1000 - iterationCount ** 2;
        yield 30 + iterationCount ** 1.2;
        iterationCount++;
    }

    /*
    // Useful for debugging: shoots off each worm one by one
    for (const worm of runningWorms) {
        while (worm.triangles.length) {
            worm.iterate(grid);
            yield 5;
        }
    }

    // Also useful for debugging: just shoots off one worm
    const worm = runningWorms[0]
    while (worm.triangles.length) {
        worm.iterate(grid);
        yield 50;
    }
    */
}

const fireworksFns = [worms]

export function* fireworks(grid, puzzle, puzzleLocs, pieces) {
    // Randomly choose a fireworks function
    const fnIndex = Math.floor(Math.random() * (fireworksFns.length - 1));
    const fireworksFn = fireworksFns[fnIndex];
    yield* fireworksFn(grid, puzzle, puzzleLocs, pieces);
}
