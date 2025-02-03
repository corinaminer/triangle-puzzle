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
