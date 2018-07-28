import datetime

OK_CHARS = set('0123456789ab')
expectedChars = []
for i in range(12):
    for j in range(6):
        expectedChars.append(str(hex(i))[2])

class Verifier:
    
    def verifyParams(self, id, maxId, discoverer, existingDiscoverers, dateStr, hexStr):
        if id != None and (id < 1 or id > maxId):
            print("Invalid ID "+str(id)+": If an ID is given, it must be at least 1 and at most the highest existing ID ("+str(maxId)+").")
            return False
        if ',' in discoverer:
            print("Error: Commas are not allowed in discoverer name.")
            return False
        try:
            d = datetime.date(*[int(n) for n in dateStr.split("-")])
        except Exception as e:
            print("Invalid date '"+dateStr+"': "+str(e))
            return False
        if d.year < 2018 or d > datetime.date.today():
            print("Error: You cannot have produced this solution on the specified date "+str(d)+".")
            return False
        if len(hexStr)!= 72:
            print("Error: Your solution does not have exactly 72 non-whitespace characters.")
            return False
        for c in set(''.join(hexStr.split())):
            if c not in OK_CHARS:
                print("Error: Your solution contains invalid character '"+c+"'.")
                return False
        if discoverer in existingDiscoverers:
            print("Warning: Discoverer '"+discoverer+"' already has solutions on record. If those are not your solutions, please cancel your submission and choose a different name.")
        return True


    def basicCheck(self, hexStr):
        return sorted(hexStr.lower()) == expectedChars
