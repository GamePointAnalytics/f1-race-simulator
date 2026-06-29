"""Fix Bahrain: fetch bahrain-1 (standard GP layout) instead of bahrain-3 (Sakhir)"""
import json
import urllib.request
import re

# Reuse the parser from fetch_tracks_v2
exec(open('fetch_tracks_v2.py').read().split('# ---- MAIN ----')[0])

# Fetch bahrain-1 specifically
layout_id = "bahrain-1"
print(f"Fetching {layout_id}...")
svg = fetch_svg(layout_id)
if not svg:
    print("Failed to fetch! Trying bahrain-2...")
    svg = fetch_svg("bahrain-2")

if svg:
    m = re.search(r'<path[^>]*\bd="([^"]+)"', svg)
    if m:
        raw_path = m.group(1)
        points, segments = parse_path_to_absolute_points(raw_path)
        normalized = normalize_and_rebuild(segments, points)
        
        # Patch into circuits.js
        with open('src/data/circuits.js', 'r') as f:
            txt = f.read()
        
        id_str = 'id: "bahrain"'
        idx = txt.find(id_str)
        if idx != -1:
            path_start_str = 'path: "'
            p_start = txt.find(path_start_str, idx)
            if p_start != -1:
                val_start = p_start + len(path_start_str)
                val_end = txt.find('"', val_start)
                txt = txt[:val_start] + normalized + txt[val_end:]
                
                with open('src/data/circuits.js', 'w') as f:
                    f.write(txt)
                print(f"Patched Bahrain with {layout_id}! Path length: {len(normalized)}")
            else:
                print("Could not find path field for bahrain")
        else:
            print("Could not find bahrain id in circuits.js")
    else:
        print("No path found in SVG")
else:
    print("Could not fetch any Bahrain layout")
