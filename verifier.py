import datetime

OK_CHARS = set('0123456789ab')
EXPECTED_CHARS = []
for i in range(12):
    for j in range(6):
        EXPECTED_CHARS.append(str(hex(i))[2])

class Verifier:
    
    def verify_params(self, id, max_id, discoverer, existing_discoverers, date_str, hex_str):
        if id != None and (id < 1 or id > max_id):
            print("Invalid ID "+str(id)+": If an ID is given, it must be at least 1 and at most the highest existing ID ("+str(max_id)+").")
            return False
        if ',' in discoverer:
            print("Error: Commas are not allowed in discoverer name.")
            return False
        try:
            d = datetime.date(*[int(n) for n in date_str.split("-")])
        except Exception as e:
            print("Invalid date '" + date_str + "': " + str(e))
            return False
        if d.year < 2018 or d > datetime.date.today():
            print("Error: You cannot have produced this solution on the specified date " + str(d) + ".")
            return False
        if len(hex_str)!= 72:
            print("Error: Your solution does not have exactly 72 non-whitespace characters.")
            return False
        for c in set(''.join(hex_str.split())):
            if c not in OK_CHARS:
                print("Error: Your solution contains invalid character '" + c + "'.")
                return False
        if discoverer in existing_discoverers:
            print("Warning: Discoverer '" + discoverer + "' already has solutions on record. If those are not your solutions, please cancel your submission and choose a different name.")
        return True


    def basic_check(self, hex_str):
        return sorted(hex_str.lower()) == EXPECTED_CHARS
