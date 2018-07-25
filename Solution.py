ROW_WIDTHS = [3, 5, 7, 9, 11, 13, 13, 11]

class Solution:
    
    def __init__(self, solution, id, subId, discoverer, date=None):
        if type(solution) == str:
            self.sol = [int(c, 12) for c in solution]
        else:
            self.sol = solution
        self.id = id
        self.subId = subId
        self.discoverer = discoverer
        self.date = date
    
    def __repr__(self):
        ret = str(self.id)+'.'+str(self.subId)+'\nDiscoverer: '+self.discoverer
        if self.date == None:
            return ret + "\nUnknown date"
        return ret +'\nDate: '+str(self.date)
    
    def lineForFile(self):
        ret = ','.join([str(self.id), str(self.subId), self.discoverer])
        if self.date == None:
            return ret + ',,' + self.getHexStr()
        else:
            return ','.join([ret, str(self.date), self.getHexStr()])
    
    def getHexStr(self):
        return ''.join([str(hex(n))[2] for n in self.sol])
    
    def getReflectionStr(self):
        baseStr = self.getHexStr()
        s = ""
        for rowWidth in ROW_WIDTHS:
            s += baseStr[0:rowWidth][::-1]
            baseStr = baseStr[rowWidth:]
        return s
