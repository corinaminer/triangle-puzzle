import matplotlib.pyplot as plt
from matplotlib.patches import Polygon

COLOR_DICT = {'r':(1,0.2,0.2), 'g':(0.2,1,0.2), 'b':(0.2,0.2,1), 'w':(1,1,1), 'o':(1,0.6,0.2), 'y':(1,1,0.2)}
TILE_COLORS = ['r', 'g', 'b', 'w', 'o', 'y', 'r', 'g', 'b', 'w', 'o', 'y']

ROW_WIDTHS = [3, 5, 7, 9, 11, 13, 13, 11]
COL_STARTS = [7 - rw // 2 - 1 for rw in ROW_WIDTHS]
COL_ENDS = [7 + rw // 2 - 1 for rw in ROW_WIDTHS] # inclusive

class Triangle:
    
    # "col" in this class refers to column relative to the leftmost triangles in the puzzle,
    # so may not be 0 even if the triangle is leftmost in its row.
    def __init__(self, row, col, up):
        self.row = row
        self.col = col
        self.up = up
        self.tile_id = None
        self.color = None
    
    def set_tile_id(self, tile_id):
        try:
            self.tile_id = int(tile_id)
        except:
            self.tile_id = ord('a') - ord(tile_id) + 10
        self.color = COLOR_DICT[TILE_COLORS[self.tile_id]]
        
    def get_coords(self):
        left_x = self.col
        left_y = 16 - 2*self.row
        if self.up:
            left_y -= 2
            return [[left_x, left_y], [left_x + 2, left_y], [left_x + 1, left_y + 2]]
        return [[left_x, left_y], [left_x + 2, left_y], [left_x + 1, left_y - 2]]
    
    def __repr__(self):
        return str(self.tile_id)

class Board:
    
    def __init__(self):
        self.ax = self.blank_board()
        self.triangles = []
        
        row = 0
        for row in range(len(ROW_WIDTHS)):
            row_triangles = [None]*COL_STARTS[row]
            start_col = COL_STARTS[row]
            for col in range(start_col, start_col + ROW_WIDTHS[row]):
                row_triangles.append(Triangle(row, col, (row + col) % 2 != 0))
            row += 1
            self.triangles.append(row_triangles)
    
    # "col" here refers to column relative to leftmost triangle in row.
    # Actually fuck this, i'm over it. columns are just distance from y axis
    # No i will keep this public function that is like that, which is just a shell around
    # the private function that does it in the distance-from-y way.
    def add_triangle(self, row, col, tile_id):
        self._add_triangle(row, col + COL_STARTS[row], tile_id)
    
    # So this is the private function and col is just distance from y axis.
    def _add_triangle(self, row, col, tile_id):
        
        # Get corner points of the triangle
        t = self.triangles[row][col]
        t.set_tile_id(tile_id)
        pts = t.get_coords()
        self.ax.add_patch(Polygon(pts, closed=True, color=t.color))

        # Draw edges if triangle borders on existing triangles that don't belong to same piece.
        # To avoid drawing edges twice, only draw left and top edges.
        if col > COL_STARTS[row]:
            left_neighbor = self.triangles[row][col - 1]
            if left_neighbor.tile_id != None and left_neighbor.tile_id != t.tile_id:
                x_pts = [pts[0][0], pts[2][0]]
                y_pts = [pts[0][1], pts[2][1]]
                self.ax.plot(x_pts, y_pts, 'k-', lw=2, zorder=2)
                
        if row != 0 and not t.up:
            vertical_neighbor = self.triangles[row - 1][col]
            if vertical_neighbor.tile_id != t.tile_id:
                x_pts = [pts[0][0], pts[1][0]]
                y_pts = [pts[0][1], pts[1][1]]
                self.ax.plot(x_pts, y_pts, 'k-', lw=2, zorder=2)
    
    def draw_board(self, solution):
        for row in range(8):
            for col in range(ROW_WIDTHS[row]):
                self.add_triangle(row, col, solution[0])
                solution = solution[1:]
    
    def blank_board(self):
        '''
        this comment is outdated but retained in fond memory of ian hunt-isaak
        
        makes a super dank blank board and returns an axes object
        wanna add tile or something? pass the sweet object returned from this function to addTile along with coords!
        fuckin matplotlib objects mate. yeah!!!
        '''
        plt.figure(figsize=(10,10))

        pts = [[0,4], [2,0], [-1,-1]]
        bl = Polygon(pts, closed=True,color='white')

        pts = [[12,0], [16,-1], [14,4]]
        br = Polygon(pts,closed=True,color='white')

        pts = [[-1,17], [6,16], [0,4]]
        tl = Polygon(pts,closed=True,color='white')

        pts = [[15,17], [8,16], [14,4]]
        tr = Polygon(pts,closed=True,color='white')


        ax = plt.gca()
        ax.add_patch(tl)
        ax.add_patch(tr)
        ax.add_patch(bl)
        ax.add_patch(br)

        # This section draws lines to highlight the triangle grid
#        for i in range(9):
#            ax.plot([0,14],[2*i,2*i],'k-',lw=2,zorder=0)

#        for i in range(6):
#            ax.plot([2*i,8+i],[0,16-(2*i)],'k-',lw=2,zorder=0)
#            ax.plot([14-(2*i),6-i],[0,16-(2*i)],'k-',lw=2,zorder=0)

        # Draw borders of board
        ax.plot([6,8],[16,16],'k-',lw=2,zorder=2)
        ax.plot([2,12],[0,0],'k-',lw=2,zorder=2)
        
        ax.plot([2,0],[0,4],'k-',lw=2,zorder=2)
        ax.plot([0,6],[4,16],'k-',lw=2,zorder=2)

        ax.plot([12,14],[0,4],'k-',lw=2,zorder=2)
        ax.plot([14,8],[4,16],'k-',lw=2,zorder=2)

        ax.set_xlim([-1,15])
        ax.set_ylim([-1,17])
        ax.axis('off')
        return ax
