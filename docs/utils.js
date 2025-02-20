export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }
    equals(other) {
        return other instanceof Point && this.x == other.x && this.y == other.y;
    }
}

// Piece colors
const RED = "255 0 0";
const GREEN = "0 255 0";
const BLUE = "0 0 255";
const WHITE = "255 255 255";
const ORANGE = "255 170 0";
const YELLOW = "255 255 0";
// Colors for other elements
const BLACK = "0 0 0";
const LIGHT_GREY = "190 190 190";
const DARK_GREY = "110 110 110";
const DARK_BKGD = "60 60 68";
const LIGHT_BKGD = "240 240 220";

class Colors {
    constructor(darkMode) {
        this.darkMode = darkMode;
        // colors that do not change between dark mode and light mode
        this.red = RED;
        this.green = GREEN;
        this.blue = BLUE;
        this.white = WHITE;
        this.orange = ORANGE;
        this.yellow = YELLOW;
        this.pieceBorder = BLACK;
        this.setColors();
    }
    setColors() {
        this.backgrd = this.darkMode ? DARK_BKGD : LIGHT_BKGD;
        this.gridlines = this.darkMode ? DARK_GREY : LIGHT_GREY;
        this.puzzleBorder = this.darkMode ? LIGHT_GREY : DARK_GREY;
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
