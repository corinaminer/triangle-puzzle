export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }
    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
}

const WHITE = "255 255 255";
const BLACK = "0 0 0";
const GREY = "210 210 210";
const RED = "255 0 0";
const GREEN = "0 255 0";
const BLUE = "0 0 255";
const ORANGE = "255 170 0";
const YELLOW = "255 255 0";

class Colors {
    constructor(darkMode) {
        this.darkMode = darkMode;
        this.setColors();
    }
    setColors() {
        this.backgrd = this.darkMode ? BLACK : WHITE;
        this.gridlines = GREY;
        this.puzzleBorder = this.darkMode ? WHITE : BLACK;
        this.red = RED;
        this.green = GREEN;
        this.blue = BLUE;
        this.white = WHITE;
        this.orange = ORANGE;
        this.yellow = YELLOW;
    }
    switch() {
        this.darkMode = !this.darkMode;
        this.setColors();
    }
}

export function toStyle(color) {
    return "rgb(" + color + ")";
}

export const colors = new Colors(true);
