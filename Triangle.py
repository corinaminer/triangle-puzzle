class Triangle:
    
    # "col" in this class refers to column relative to the leftmost triangles in the puzzle,
    # so may not be 0 even if the triangle is leftmost in its row.
    def __init__(self, row, col, up, tileId=None):
        self.row = row
        self.col = col
        self.up = up
        if tileId == None:
            self.tileId = None
            self.color = None
            return
        try:
            self.tileId = int(tileId)
        except:
            self.tileId = ord('a') - ord(tileId) + 10
        self.color = colorDict[tileColors[self.tileId]]
        
    def getCoords(self):
        leftX = self.col
        leftY = 16 - 2*self.row
        if self.up:
            leftY -= 2
            return [[leftX, leftY], [leftX+2, leftY], [leftX+1, leftY+2]]
        return [[leftX, leftY], [leftX+2, leftY], [leftX+1, leftY-2]]
