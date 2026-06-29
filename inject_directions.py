"""Inject startOffset and reversed properties into circuits.js"""

PROPS = {
    "oz": {"startOffset": 0.05},
    "china": {"startOffset": 0.37, "reversed": True},
    "suzuka": {"startOffset": 0.60},
    "bahrain": {"startOffset": 0.91, "reversed": True},
    "jeddah": {"startOffset": 0.03},
    "imola": {"startOffset": 0.89},
    "monaco": {"startOffset": 0.25},
    "barcelona": {"startOffset": 0.04},
    "canada": {"startOffset": 0.43},
    "austria": {"startOffset": 0.15, "reversed": True},
    "silverstone": {"startOffset": 0.98},
    "spa": {"startOffset": 0.97},
    "hungary": {"startOffset": 0.91},
    "zandvoort": {"startOffset": 0.08},
    "monza": {"startOffset": 0.78},
    "baku": {"startOffset": 0.90},
    "singapore": {"startOffset": 0.08},
    "austin": {"startOffset": 0.58},
    "mexico": {"startOffset": 0.08},
    "interlagos": {"startOffset": 0.21},
    "vegas": {"startOffset": 0.49},
    "abudhabi": {"startOffset": 0.65, "reversed": True},
    "testing": {"startOffset": 0.09},
}

with open('src/data/circuits.js', 'r') as f:
    txt = f.read()

for track_id, props in PROPS.items():
    # Find the drsZones line for this track (it's always BEFORE the path)
    id_str = f'id: "{track_id}"'
    idx = txt.find(id_str)
    if idx == -1:
        print(f"[{track_id}] NOT FOUND")
        continue
    
    # Find the "path:" line after this id
    path_idx = txt.find('path:', idx)
    if path_idx == -1:
        print(f"[{track_id}] No path found")
        continue
    
    # Find the comment line before path (e.g. "// Albert Park: High Speed Lake")
    # We'll insert our properties right before the path line
    # Find the newline before "path:"
    line_start = txt.rfind('\n', 0, path_idx) + 1
    indent = '        '
    
    # Build the properties string
    prop_lines = ''
    if 'startOffset' in props:
        prop_lines += f'{indent}startOffset: {props["startOffset"]},\n'
    if props.get('reversed'):
        prop_lines += f'{indent}reversed: true,\n'
    
    # Check if already has startOffset (avoid duplicates)
    block_end = txt.find('},', idx)
    existing_block = txt[idx:block_end]
    if 'startOffset' in existing_block:
        print(f"[{track_id}] Already has startOffset, skipping")
        continue
    
    # Insert before the comment/path line
    txt = txt[:line_start] + prop_lines + txt[line_start:]
    print(f"[{track_id}] Injected: {props}")

with open('src/data/circuits.js', 'w') as f:
    f.write(txt)

print("\nDone! All properties injected.")
