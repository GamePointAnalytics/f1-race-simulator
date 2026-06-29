"""Inject track length in meters into circuits.js"""

LENGTHS = {
    "oz": 5278,
    "china": 5451,
    "suzuka": 5807,
    "bahrain": 5412,
    "jeddah": 6174,
    "imola": 4909,
    "monaco": 3337,
    "barcelona": 4657,
    "canada": 4361,
    "austria": 4318,
    "silverstone": 5891,
    "spa": 7004,
    "hungary": 4381,
    "zandvoort": 4259,
    "monza": 5793,
    "baku": 6003,
    "singapore": 4940,
    "austin": 5513,
    "mexico": 4304,
    "interlagos": 4309,
    "vegas": 6201,
    "abudhabi": 5281,
    "testing": 4657,
}

with open('src/data/circuits.js', 'r') as f:
    txt = f.read()

for track_id, length in LENGTHS.items():
    id_str = f'id: "{track_id}"'
    idx = txt.find(id_str)
    if idx == -1:
        print(f"[{track_id}] NOT FOUND")
        continue
    
    # insert after laps: <num>,
    laps_idx = txt.find('laps:', idx)
    if laps_idx == -1:
        continue
    
    line_end = txt.find('\n', laps_idx)
    indent = '        '
    
    # check if already has length
    block_end = txt.find('},', idx)
    if 'length:' in txt[idx:block_end]:
        print(f"[{track_id}] already has length")
        continue
        
    txt = txt[:line_end+1] + f'{indent}length: {length},\n' + txt[line_end+1:]
    print(f"[{track_id}] added length {length}")

with open('src/data/circuits.js', 'w') as f:
    f.write(txt)

print("Done")
