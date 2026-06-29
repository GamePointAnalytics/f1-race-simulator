import json
import re

with open('new_paths.json', 'r') as f:
    paths = json.load(f)

with open('src/data/circuits.js', 'r') as f:
    txt = f.read()

# We need to find the specific block for each ID and replace the path
# A safer way without regex catastrophic backtracking:
for t_id, p in paths.items():
    # 1. find index of 'id: "' + t_id + '"'
    id_str = f'id: "{t_id}"'
    idx = txt.find(id_str)
    if idx == -1: continue
    
    # 2. starting from idx, find 'path: "'
    path_start_str = 'path: "'
    p_start = txt.find(path_start_str, idx)
    if p_start == -1: continue
    
    # 3. p_start + len yields the actual path start 
    val_start = p_start + len(path_start_str)
    
    # 4. find the closing quote
    val_end = txt.find('"', val_start)
    if val_end == -1: continue
    
    # replace string slice
    txt = txt[:val_start] + p + txt[val_end:]

with open('src/data/circuits.js', 'w') as f:
    f.write(txt)

print("Patch complete.")
