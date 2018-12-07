from datetime import date
from handler import Solution
from verifier import Verifier

v = Verifier()

# Throws error if date isn't in YYYY-MM-DD format
def parse_date(date_str):
    try:
        date_parts = [int(n) for n in date_str.split('-')]
        return date(*date_parts)
    except Exception as e:
        raise Exception("Cannot parse date column: " + str(e))

# Tests:
# - Line has five columns
# - ID and sub_id columns can be converted to ints
# - Date column is empty or can be converted to a date
# - Solution string passes verifier's basic check (i.e. exactly 6 triangles of every piece)
def parse_line(line):
    # Line format in csv file:
    # ID,sub_id,discoverer,date,solution_str
    parts = line.split(",")
    if len(parts) != 5:
        raise Exception("Wrong number of columns")
    id = int(parts[0])
    sub_id = int(parts[1])
    discoverer = parts[2]
    date_str = parts[3]
    solution_str = parts[4]
    if not v.basic_check(solution_str):
        raise Exception("Solution is invalid (fails basic check)")
    if parts[3] == "":
        return Solution(solution_str, id, sub_id, discoverer)
    else:
        return Solution(solution_str, id, sub_id, discoverer, parse_date(date_str))

# Returns True if:
# - Solution's ID is equal to prev_id and its sub_id is the prev_sub_id + 1; or
# - Solution's ID is equal to prev_id + 1 and its sub_id is 1
def ids_in_order(prev_id, prev_sub_id, solution):
    id = solution.id
    sub_id = solution.sub_id
    return (id == prev_id and sub_id == prev_sub_id + 1) or (id == prev_id + 1 and sub_id == 1)

# Returns True if this solution nor its reflection already appeared in another line
def add_new_solution(solution, solution_strs):
    initial_num_solutions = len(solution_strs)
    solution_strs.add(solution.get_hex_str())
    solution_strs.add(solution.get_reflection_str())
    return len(solution_strs) == initial_num_solutions + 2

def failure(line_num, msg):
    print("[line " + str(line_num) + "] " + msg)
    return 1

def test():
    try:
        with open("solutions.csv", "r") as f:
            line_num = 0
            solution_strs = set()
            prev_id = 0
            prev_sub_id = 0
            skipping_first_line = True
            for line in f:
                line_num += 1
                # skip header row
                if skipping_first_line:
                    skipping_first_line = False
                    continue
                # This still allows for one blank line at the end
                if line.strip() == '':
                    return failure(line_num, "Unexpected blank line")
                try:
                    solution = parse_line(line.strip())
                except Exception as e:
                    return failure(line_num, "Unable to interpret line:\n\t" + line + "\n" + str(e))
                if not ids_in_order(prev_id, prev_sub_id, solution):
                    return failure(line_num, "Solutions out of order: " + str(prev_id) + "."+ str(prev_sub_id)
                          + ", " + str(solution.id) + "." + str(solution.sub_id))
                if not add_new_solution(solution, solution_strs):
                    return failure(line_num, "Duplicate solution: " + solution.get_hex_str())
                prev_id = solution.id
                prev_sub_id = solution.sub_id
    except IOError:
        # File doesn't exist
        print("Could not find solutions.csv")
        return 1
    return 0

assert test() == 0
