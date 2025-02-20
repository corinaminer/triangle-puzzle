// Keep ROWS even to make corners rounded (ups at ends of top row, downs at ends of bottom row)
// Keep COLS odd to make triangles at beginning and end of each row the same orientation
export const ROWS = 16;
export const COLS = 39;

// Dimensions of a triangle
export const L = 50;
export const H = Math.round(L * Math.sqrt(3) / 2);

// Widths of each row in the puzzle
export const ROW_WIDTHS = [3, 5, 7, 9, 11, 13, 13, 11];
