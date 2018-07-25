from Triangle import Triangle
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon

COLOR_DICT = {'r':(1,0,0), 'g':(0,1,0), 'b':(0,0,1), 'w':(1,1,1), 'o':(1,0.5,0), 'y':(1,1,0),'tie':(160./255,32./255,40./255)}
COLOR_DICT['r2']= (1,.2,.2)
COLOR_DICT['g2']= (.2,.9,.2)
COLOR_DICT['b2']= (.2,.2,1)
COLOR_DICT['w2']= (.9,.9,.9)
COLOR_DICT['o2']= (1,.6,.2)
COLOR_DICT['y2']= (.9,1,.3)
TILE_COLORS = ['r', 'g', 'b', 'w', 'o', 'y', 'r2', 'g2', 'b2', 'w2', 'o2', 'y2']

class Board:
    
    ROW_WIDTHS = [3, 5, 7, 9, 11, 13, 13, 11]
    COL_STARTS = [7 - rw//2 - 1 for rw in ROW_WIDTHS]
    COL_ENDS = [7 + rw//2 - 1 for rw in ROW_WIDTHS] # inclusive
    
    def __init__(self):
        self.ax = self.blank_board()
        self.triangles = []
        
        row = 0
        for row in range(len(Board.ROW_WIDTHS)):
            rowTriangles = [None]*Board.COL_STARTS[row]
            startCol = Board.COL_STARTS[row]
            for col in range(startCol, startCol+Board.ROW_WIDTHS[row]):
                rowTriangles.append(Triangle(row, col, (row+col)%2!=0))
            row += 1
            self.triangles.append(rowTriangles)
    
    # "col" here refers to column relative to leftmost triangle in row.
    # Actually fuck this, i'm over it. columns are just distance from y axis
    # No i will keep this public function that is like that, which is just a shell around
    # the private function that does it in the distance-from-y way.
    def addTriangle(self, row, col, color=(222./255,184./255,135./255)):
        self._addTriangle(row, col + Board.COL_STARTS[row], color)
    
    # So this is the private function and col is just distance from y axis.
    def _addTriangle(self, row, col, color):
        
        # Get corner points of the triangle
        t = self.triangles[row][col]
        pts = t.getCoords()
        self.ax.add_patch(Polygon(pts,closed=True,color=color))

        # Draw edges if triangle borders on existing triangles that don't belong to same piece
        if col > Board.COL_STARTS[row]:
            leftNeighbor = self.triangles[row][col-1]
            if leftNeighbor.tileId != None and leftNeighbor.tileId != t.tileId:
                self.ax.plot(pts[0], pts[2], 'k-', lw=2)
        if col < Board.COL_ENDS[row]:
            rightNeighbor = self.triangles[row][col+1]
            if rightNeighbor.tileId != None and rightNeighbor.tileId != t.tileId:
                self.ax.plot(pts[1], pts[2], 'k-', lw=2)
                
        verticalNeighbor = self.getVerticalNeighbor(t, row, col)
        if (verticalNeighbor != None and 
            verticalNeighbor.tileId != None and 
            verticalNeighbor.tileId != t.tileId):
            self.ax.plot(pts[0], pts[1], 'k-', lw=2)
    
    def getVerticalNeighbor(self, t, row, col):
        if (t.up and row == 7) or ((not t.up) and row == 0):
            return None;
        if t.up:
            return self.triangles[row+1][col]
        return self.triangles[row-1][col]
    
    def drawBoard(self, solution):
        for row in range(8):
            for col in range(Board.ROW_WIDTHS[row]):
                self.addTriangle(row, col, COLOR_DICT[TILE_COLORS[solution[0]]])
                solution = solution[1:]
    
    def blank_board(self):
        '''
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

        for i in range(9):
            ax.plot([0,14],[2*i,2*i],'k-',lw=2,zorder=0)

        for i in range(6):
            ax.plot([2*i,8+i],[0,16-(2*i)],'k-',lw=2,zorder=0)
            ax.plot([14-(2*i),6-i],[0,16-(2*i)],'k-',lw=2,zorder=0)

        ax.plot([2,0],[0,4],'k-',lw=2)
        ax.plot([0,6],[4,16],'k-',lw=2)

        ax.plot([12,14],[0,4],'k-',lw=2)
        ax.plot([14,8],[4,16],'k-',lw=2)

        ax.set_xlim([-1,15])
        ax.set_ylim([-1,17])
        ax.axis('off')
        return ax
