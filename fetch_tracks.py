import json
import urllib.request
import re
import math

TRACK_MAP = {
    "oz": "melbourne-2",
    "china": "shanghai-1",
    "suzuka": "suzuka-2",
    "bahrain": "bahrain-1",
    "jeddah": "jeddah-1",
    "miami": "miami-1",
    "imola": "imola-3",
    "monaco": "monaco-6",
    "barcelona": "catalunya-6",
    "canada": "montreal-5",
    "austria": "spielberg-1",     
    "silverstone": "silverstone-6",
    "spa": "spa-francorchamps-6",
    "hungary": "hungaroring-3",
    "zandvoort": "zandvoort-2",
    "monza": "monza-9",
    "baku": "baku-1",
    "singapore": "marina-bay-4",
    "austin": "austin-1",
    "mexico": "mexico-city-3",
    "interlagos": "interlagos-2",
    "vegas": "las-vegas-1",
    "qatar": "lusail-1",
    "abudhabi": "yas-marina-2",
    "testing": "catalunya-6"
}

BASE_URL = "https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/black/"

def fetch_svg(layout_id):
    url = f"{BASE_URL}{layout_id}.svg"
    try:
        req = urllib.request.urlopen(url)
        return req.read().decode('utf-8')
    except Exception as e:
        print(f"Failed to fetch {layout_id}: {e}")
        return None

def normalize_path(path_str, target_size=800, padding=100):
    # This is a complex parser for SVG paths to normalize them to (padding, padding) -> (target_size+padding, target_size+padding)
    # We'll use a simplified regex token approach, but since SVG can have curves, we scale all numeric coordinates.
    # To do this robustly, we first find the bounding box of all numbers.
    tokens = re.split(r'([A-Za-z])', path_str)
    
    nums = []
    # SVG paths have commands then numbers. We just collect all numbers.
    # Actually, coordinates are pairs (x, y) generally, but H and V are single.
    # Wait, simple extraction of all floats to find bounding box works mostly if we don't have relative commands,
    # but the julesr0y dataset uses absolute commands (M, C, L, Z).
    # Let's verify by just picking all numbers.
    all_floats = [float(x) for x in re.findall(r'-?\d+\.?\d*', path_str)]
    if not all_floats: return path_str
    
    # x are even indices (roughly), y are odd. 
    # This is an approximation since C has X,Y pairs and M, L have X,Y.
    # For A, it's 7 params, but mostly circuits use M, L, C, Z.
    # Let's just find min/max of all numbers.
    xs = []
    ys = []
    
    # A safer approach for these specific SVGs: They are simple polygons or bezier curves.
    current_cmd = ''
    i = 0
    all_tokens = re.findall(r'[A-Za-z]|-?\d+\.?\d*', path_str)
    pts = []
    for t in all_tokens:
        if t.isalpha():
            current_cmd = t.upper()
        else:
            pts.append(float(t))
    
    # The actual julesr0y paths are mostly 'M x y', 'C x1 y1 x2 y2 x y', 'L x y', 'Z'.
    # All arguments are pairs except Z.
    xs = pts[0::2]
    ys = pts[1::2]
    
    if not xs or not ys: return path_str
    
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    w = max_x - min_x
    h = max_y - min_y
    if w == 0 or h == 0: return path_str
    
    scale = target_size / max(w, h)
    
    # offset
    cx = min_x + w/2
    cy = min_y + h/2
    
    target_cx = padding + target_size/2
    target_cy = padding + target_size/2
    
    # Now reconstruct the path
    res = []
    x_turn = True
    for t in all_tokens:
        if t.isalpha():
            res.append(t)
            # if command is V or H, we would need special care. 
            # julesr0y SVGs generally don't use V/H.
            x_turn = True 
        else:
            val = float(t)
            if x_turn:
                # it's X
                new_val = (val - cx) * scale + target_cx
            else:
                # it's Y
                new_val = (val - cy) * scale + target_cy
            res.append(f"{new_val:.2f}")
            x_turn = not x_turn
            
    return " ".join(res)

output = {}

# Load circuits to find the latest layout for each track
try:
    with open('f1_circuits.json', 'r', encoding='utf-8') as f:
        all_circuits = json.load(f)
except:
    all_circuits = []

def get_latest_layout(circuit_id):
    for c in all_circuits:
        if c['id'] == circuit_id:
            if c.get('layouts'):
                return c['layouts'][-1]['layoutId']
    return None

# Map short IDs to standard IDs
STANDARD_IDS = {
    "oz": "melbourne", "china": "shanghai", "suzuka": "suzuka",
    "bahrain": "bahrain", "jeddah": "jeddah", "miami": "miami",
    "imola": "imola", "monaco": "monaco", "barcelona": "catalunya",
    "canada": "montreal", "austria": "spielberg", "silverstone": "silverstone",
    "spa": "spa-francorchamps", "hungary": "hungaroring", "zandvoort": "zandvoort",
    "monza": "monza", "baku": "baku", "singapore": "marina-bay",
    "austin": "austin", "mexico": "mexico-city", "interlagos": "interlagos",
    "vegas": "las-vegas", "qatar": "lusail", "abudhabi": "yas-marina",
    "testing": "catalunya"
}

for track_id, std_id in STANDARD_IDS.items():
    layout_id = get_latest_layout(std_id)
    if not layout_id:
        # fallback
        layout_id = f"{std_id}-1"
        
    svg = fetch_svg(layout_id)
    if not svg:
        print(f"[{track_id}] Failed for {layout_id}")
        continue
    
    m = re.search(r'<path[^>]*d="([^"]+)"', svg)
    if m:
        path = m.group(1)
        normalized = normalize_path(path)
        output[track_id] = normalized
        print(f"[{track_id}] Success: {layout_id} -> Path length {len(normalized)}")

with open('new_paths.json', 'w') as f:
    json.dump(output, f, indent=2)

print("Fetched and normalized paths successfully.")

