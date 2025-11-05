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

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

export class Style {
    constructor(color, opacity) {
        this.color = color;
        this.opacity = opacity;
    }
}

export function toStyle(color, opacity=1) {
    return `rgb(${color} / ${opacity})`;
}

export function combineStyles(styles) {
    if (styles.length === 0) {
        return null;
    } else if (styles.length === 1) {
        return toStyle(styles[0].color, styles[0].opacity);
    }
    
    let newColors = [0, 0, 0];
    let maxOpacity = 0, opacitySum = 0;
    for (const s of styles) {
        maxOpacity = Math.max(maxOpacity, s.opacity);
        opacitySum += s.opacity;
        const colors = s.color.split(" ").map(c => parseFloat(c));
        for (let i=0; i < 3; i++) {
            newColors[i] += colors[i] * s.opacity;
        }
    }

    // Average RGB values weighted by opacity
    newColors = newColors.map(c => c / opacitySum);
    return toStyle(newColors.join(" "), maxOpacity);
}

export const colors = new Colors(true);
