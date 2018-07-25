from Solution import Solution
from datetime import date

# Throws error if date isn't in YYYY-MM-DD format
def parseDate(dateStr):
    dateParts = [int(n) for n in dateStr.split('-')]
    return date(*dateParts)

class Filewriter:
    
    def __init__(self):
        self.solDict = {}
        self.subIdMaxes = []
        try:
            with open("solutions.csv", "r") as f:
                for line in f:
                    # skip header row
                    if line[:2] == "ID":
                        continue
                    try:
                        solution = self.parseLine(line.strip())
                        self.addToSolutionDict(solution)
                        self.recordIdAndSubId(solution)
                    except Exception as e:
                        print("Unable to interpret line:\n\t" + line)
                        print(e)
        except IOError:
            # File doesn't exist
            with open("solutions.csv", "w"):
                print("Created new file solutions.csv")
    
    def recordIdAndSubId(self, solution):
        while len(self.subIdMaxes) < solution.id:
            self.subIdMaxes.append(0)
        if solution.subId > self.subIdMaxes[solution.id - 1]:
            self.subIdMaxes[solution.id - 1] = solution.subId
        
    # Throws error if line is badly formatted.
    # ID and subID should be ints, date should be YYYY-MM-DD, solutionString should be exactly
    # 72 characters consisting of 0-9, a, and b.
    def parseLine(self, line):
        # Line format in csv file:
        # ID,subID,discoverer,date,solutionString
        parts = line.split(",")
        assert(len(parts) == 5)
        id = int(parts[0])
        subId = int(parts[1])
        discoverer = parts[2]
        solution = [int(c, 12) for c in parts[4]]
        if parts[3] == "":
            return Solution(solution, id, subId, discoverer)
        else:
            return Solution(solution, id, subId, discoverer, parseDate(parts[3]))
        
    def addNewSolution(self, hexStr, discoverer, date=None, id=None):
        if hexStr in self.solDict:
            self.notifyFoundDup(hexStr)
            return
        try:
            if date != None:
                date = parseDate(date)
            if (id == None):
                id = len(self.subIdMaxes) + 1
                subId = 1
            elif id <= len(self.subIdMaxes):
                subId = self.subIdMaxes[id - 1] + 1
            else:
                subId = 1
            solution = Solution(hexStr, id, subId, discoverer, date)
        except Exception as e:
            print("Unable to parse solution. Please try again.")
            print(e)
            return
        
        print("Congratulations, you've produced a new solution:")
        print(solution)
        self.addToSolutionDict(solution)
        self.recordIdAndSubId(solution)
        with open("solutions.csv", "a") as f:
            f.write('\n' + solution.lineForFile())

    def addToSolutionDict(self, solution):
        hexStr = solution.getHexStr()
        self.solDict[hexStr] = solution
        self.solDict[solution.getReflectionStr()] = hexStr
    
    def notifyFoundDup(self, hexStr):
        val = self.solDict[hexStr]
        if type(val) == str:
            print("This solution is a reflection of an existing solution:")
            print(self.solDict[val])
        else:
            print("This solution has already been recorded:")
            print(val)
