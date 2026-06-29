"""
F1 Track SVG Fetcher v2 - Proper SVG Path Parser
Handles relative (lowercase) and absolute (uppercase) commands correctly.
Converts all paths to absolute coordinates, then normalizes to 0-1000 space.
"""
import json
import urllib.request
import re
import math

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

BASE_URL = "https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/black/"

# Load circuits.json for layout ID lookup
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

def fetch_svg(layout_id):
    url = f"{BASE_URL}{layout_id}.svg"
    try:
        req = urllib.request.urlopen(url)
        return req.read().decode('utf-8')
    except Exception as e:
        print(f"  FAIL fetch {layout_id}: {e}")
        return None

def tokenize_path(d):
    """Split SVG path d attribute into command tokens."""
    # Match: a letter OR a number (possibly negative, possibly decimal)
    return re.findall(r'[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?', d)

def parse_path_to_absolute_points(d):
    """
    Parse an SVG path string, convert all commands to absolute coordinates,
    and return a list of all (x, y) points that the path visits.
    Also returns the reconstructed absolute path string.
    """
    tokens = tokenize_path(d)
    
    points = []  # All (x,y) coordinates visited
    segments = []  # (command, [numbers...]) for reconstruction
    
    i = 0
    cx, cy = 0, 0  # current position
    sx, sy = 0, 0  # start of current subpath (for Z)
    
    last_cmd = 'M'
    while i < len(tokens):
        cmd = tokens[i]
        if not cmd.isalpha():
            # Implicit repeat of last command
            # Don't consume this token as a command letter
            cmd = last_cmd
        else:
            i += 1
        
        is_relative = cmd.islower()
        CMD = cmd.upper()
        
        if CMD == 'M':
            x = float(tokens[i]); y = float(tokens[i+1]); i += 2
            if is_relative:
                x += cx; y += cy
            cx, cy = x, y
            sx, sy = x, y
            points.append((x, y))
            segments.append(('M', [x, y]))
            last_cmd = 'm' if is_relative else 'M'  # implicit L/l after M/m
            # After M, implicit command is L (or l if m)
            last_cmd = 'l' if is_relative else 'L'
            
        elif CMD == 'L':
            x = float(tokens[i]); y = float(tokens[i+1]); i += 2
            if is_relative:
                x += cx; y += cy
            cx, cy = x, y
            points.append((x, y))
            segments.append(('L', [x, y]))
            last_cmd = cmd
            
        elif CMD == 'H':
            x = float(tokens[i]); i += 1
            if is_relative:
                x += cx
            cx = x
            points.append((cx, cy))
            segments.append(('L', [cx, cy]))
            last_cmd = cmd
            
        elif CMD == 'V':
            y = float(tokens[i]); i += 1
            if is_relative:
                y += cy
            cy = y
            points.append((cx, cy))
            segments.append(('L', [cx, cy]))
            last_cmd = cmd
            
        elif CMD == 'C':
            # Cubic bezier: x1 y1 x2 y2 x y
            nums = [float(tokens[i+j]) for j in range(6)]; i += 6
            if is_relative:
                for k in range(3):
                    nums[k*2] += cx
                    nums[k*2+1] += cy
            # All control points and endpoint count for bounding box
            for k in range(3):
                points.append((nums[k*2], nums[k*2+1]))
            cx, cy = nums[4], nums[5]
            segments.append(('C', nums))
            last_cmd = cmd
            
        elif CMD == 'S':
            # Smooth cubic: x2 y2 x y
            nums = [float(tokens[i+j]) for j in range(4)]; i += 4
            if is_relative:
                for k in range(2):
                    nums[k*2] += cx
                    nums[k*2+1] += cy
            points.append((nums[0], nums[1]))
            points.append((nums[2], nums[3]))
            cx, cy = nums[2], nums[3]
            segments.append(('S', nums))
            last_cmd = cmd
            
        elif CMD == 'Q':
            # Quadratic bezier: x1 y1 x y
            nums = [float(tokens[i+j]) for j in range(4)]; i += 4
            if is_relative:
                for k in range(2):
                    nums[k*2] += cx
                    nums[k*2+1] += cy
            points.append((nums[0], nums[1]))
            points.append((nums[2], nums[3]))
            cx, cy = nums[2], nums[3]
            segments.append(('Q', nums))
            last_cmd = cmd
            
        elif CMD == 'T':
            nums = [float(tokens[i+j]) for j in range(2)]; i += 2
            if is_relative:
                nums[0] += cx; nums[1] += cy
            points.append((nums[0], nums[1]))
            cx, cy = nums[0], nums[1]
            segments.append(('T', nums))
            last_cmd = cmd
            
        elif CMD == 'A':
            # Arc: rx ry x-rotation large-arc-flag sweep-flag x y
            nums = [float(tokens[i+j]) for j in range(7)]; i += 7
            if is_relative:
                nums[5] += cx
                nums[6] += cy
            points.append((nums[5], nums[6]))
            cx, cy = nums[5], nums[6]
            segments.append(('A', nums))
            last_cmd = cmd
            
        elif CMD == 'Z':
            cx, cy = sx, sy
            segments.append(('Z', []))
            # Z takes no args; next implicit cmd after Z is M
            last_cmd = 'M'
            
        else:
            # Unknown command, skip
            i += 1
            last_cmd = cmd
    
    return points, segments

def normalize_and_rebuild(segments, points, target_size=800, padding=100):
    """
    Given absolute segments and points, compute bounding box, 
    scale+translate all coordinates into [padding, padding+target_size] range.
    Rebuild the path string.
    """
    if not points:
        return ""
    
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    w = max_x - min_x
    h = max_y - min_y
    if w == 0 and h == 0:
        return ""
    
    scale = target_size / max(w, h) if max(w, h) > 0 else 1
    
    # Center in the target space
    scaled_w = w * scale
    scaled_h = h * scale
    off_x = padding + (target_size - scaled_w) / 2 - min_x * scale
    off_y = padding + (target_size - scaled_h) / 2 - min_y * scale
    
    def tx(x):
        return round(x * scale + off_x, 2)
    def ty(y):
        return round(y * scale + off_y, 2)
    
    parts = []
    for cmd, nums in segments:
        if cmd == 'M':
            parts.append(f"M {tx(nums[0])} {ty(nums[1])}")
        elif cmd == 'L':
            parts.append(f"L {tx(nums[0])} {ty(nums[1])}")
        elif cmd == 'C':
            parts.append(f"C {tx(nums[0])} {ty(nums[1])} {tx(nums[2])} {ty(nums[3])} {tx(nums[4])} {ty(nums[5])}")
        elif cmd == 'S':
            parts.append(f"S {tx(nums[0])} {ty(nums[1])} {tx(nums[2])} {ty(nums[3])}")
        elif cmd == 'Q':
            parts.append(f"Q {tx(nums[0])} {ty(nums[1])} {tx(nums[2])} {ty(nums[3])}")
        elif cmd == 'T':
            parts.append(f"T {tx(nums[0])} {ty(nums[1])}")
        elif cmd == 'A':
            # rx, ry scale too; flags stay; endpoint transforms
            parts.append(f"A {round(nums[0]*scale,2)} {round(nums[1]*scale,2)} {nums[2]} {int(nums[3])} {int(nums[4])} {tx(nums[5])} {ty(nums[6])}")
        elif cmd == 'Z':
            parts.append("Z")
    
    return " ".join(parts)


# ---- MAIN ----
output = {}

for track_id, std_id in STANDARD_IDS.items():
    layout_id = get_latest_layout(std_id)
    if not layout_id:
        layout_id = f"{std_id}-1"
    
    print(f"[{track_id}] Fetching {layout_id}...")
    svg = fetch_svg(layout_id)
    if not svg:
        continue
    
    # Extract path d attribute
    m = re.search(r'<path[^>]*\bd="([^"]+)"', svg)
    if not m:
        print(f"  No path found in SVG for {layout_id}")
        continue
    
    raw_path = m.group(1)
    
    try:
        points, segments = parse_path_to_absolute_points(raw_path)
        normalized = normalize_and_rebuild(segments, points)
        output[track_id] = normalized
        print(f"  OK: {len(points)} points, path length {len(normalized)} chars")
    except Exception as e:
        print(f"  ERROR parsing {layout_id}: {e}")

# Save
with open('new_paths.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\nDone! Processed {len(output)}/{len(STANDARD_IDS)} tracks.")
