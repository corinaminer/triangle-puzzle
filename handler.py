from datetime import date

SOLUTION_FILENAME = "solutions.csv"
ROW_WIDTHS = [3, 5, 7, 9, 11, 13, 13, 11]

# Throws error if date isn't in YYYY-MM-DD format
def parse_date(date_str):
    date_parts = [int(n) for n in date_str.split('-')]
    return date(*date_parts)

class Solution:
    
    def __init__(self, solution_str, id, sub_id, discoverer, date=None):
        if type(solution_str) != str:
            raise Exception("hey whats up")
        self.sol = [int(c, 12) for c in solution_str]
        self.id = id
        self.sub_id = sub_id
        self.discoverer = discoverer
        self.date = date
    
    def __repr__(self):
        ret = str(self.id) + '.' + str(self.sub_id) + '\nDiscoverer: ' + self.discoverer
        if self.date == None:
            return ret + "\nUnknown date"
        return ret + '\nDate: '+str(self.date)
    
    def line_for_file(self):
        ret = ','.join([str(self.id), str(self.sub_id), self.discoverer])
        if self.date == None:
            return ret + ',,' + self.get_hex_str()
        else:
            return ','.join([ret, str(self.date), self.get_hex_str()])
    
    def get_hex_str(self):
        return ''.join([str(hex(n))[2] for n in self.sol])
    
    def get_reflection_str(self):
        base_str = self.get_hex_str()
        s = ""
        for row_width in ROW_WIDTHS:
            s += base_str[0:row_width][::-1]
            base_str = base_str[row_width:]
        return s
    
    def difference(self, other_hex_str):
        hex_str = self.get_hex_str()
        matches = 0
        for i in range(len(hex_str)):
            if hex_str[i] == other_hex_str[i]:
                matches += 1
        return matches


class Filewriter:
    
    def __init__(self):
        self.sol_dict = {}
        self.id_dict = {}
        self.sub_id_maxes = []
        self.discoverers = []
        try:
            with open(SOLUTION_FILENAME, "r") as f:
                for line in f:
                    # skip header row
                    if line[:2] == "ID":
                        continue
                    try:
                        solution = self.parse_line(line.strip())
                        self.add_to_dicts(solution)
                        self.record_id_and_sub_id(solution)
                        self.discoverers.append(solution.discoverer)
                    except Exception as e:
                        print("Unable to interpret line:\n\t" + line)
                        print(e)
        except IOError:
            # File doesn't exist
            with open(SOLUTION_FILENAME, "w"):
                print("Created new file " + SOLUTION_FILENAME)
    
    def record_id_and_sub_id(self, solution):
        while len(self.sub_id_maxes) < solution.id:
            self.sub_id_maxes.append(0)
        if solution.sub_id > self.sub_id_maxes[solution.id - 1]:
            self.sub_id_maxes[solution.id - 1] = solution.sub_id
        
    # Throws error if line is badly formatted.
    # ID and sub_id should be ints, date should be YYYY-MM-DD, solution string should be exactly
    # 72 characters consisting of 0-9, a, and b.
    def parse_line(self, line):
        # Line format in csv file:
        # ID,sub_id,discoverer,date,solution_str
        parts = line.split(",")
        assert(len(parts) == 5)
        id = int(parts[0])
        sub_id = int(parts[1])
        discoverer = parts[2]
        date_str = parts[3]
        solution_str = parts[4]
        if parts[3] == "":
            return Solution(solution_str, id, sub_id, discoverer)
        else:
            return Solution(solution_str, id, sub_id, discoverer, parse_date(date_str))
        
    def add_new_solution(self, hex_str, discoverer, date=None, id=None):
        if hex_str in self.sol_dict:
            self.notify_found_dup(hex_str)
            return
        try:
            if date != None:
                date = parse_date(date)
            if (id == None):
                id = len(self.sub_id_maxes) + 1
                sub_id = 1
            elif id <= len(self.sub_id_maxes):
                sub_id = self.sub_id_maxes[id - 1] + 1
            else:
                sub_id = 1
            solution = Solution(hex_str, id, sub_id, discoverer, date)
        except Exception as e:
            print("Unable to parse solution. Please try again.")
            print(e)
            return
        
        print("Congratulations, you've produced a new solution:")
        print(solution)
        self.add_to_dicts(solution)
        self.record_id_and_sub_id(solution)
        with open(SOLUTION_FILENAME, "r") as f:
            solns = f.read().strip()
        with open(SOLUTION_FILENAME, "w") as f:
            f.write(solns + '\n' + solution.line_for_file())

    def add_to_dicts(self, solution):
        hex_str = solution.get_hex_str()
        self.sol_dict[hex_str] = solution
        self.sol_dict[solution.get_reflection_str()] = hex_str
        if solution.id not in self.id_dict:
            self.id_dict[solution.id] = []
        id_list = self.id_dict[solution.id]
        while len(id_list) < solution.sub_id:
            id_list.append(None)
        id_list[solution.sub_id - 1] = solution
   
    def notify_found_dup(self, hex_str):
        val = self.sol_dict[hex_str]
        if type(val) == str:
            print("This solution is a reflection of an existing solution:")
            print(self.sol_dict[val])
        else:
            print("This solution has already been recorded:")
            print(val)
