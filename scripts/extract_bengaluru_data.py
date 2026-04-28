import requests
import json
import os
import time

def extract_bengaluru_data():
    # Use the primary mirror with a User-Agent
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"
    HEADERS = {
        "User-Agent": "CityCloneDigitalTwin/1.0 (https://github.com/bharathkumar000/smart-city-clone)"
    }
    
    # Smaller Bbox for Central Bengaluru (Vidhana Soudha / Cubbon Park area)
    bbox = "12.97, 77.58, 12.98, 77.60" # Even smaller to be safe
    
    def run_query(query):
        for i in range(3):
            try:
                response = requests.post(OVERPASS_URL, data={'data': query}, headers=HEADERS, timeout=60)
                if response.status_code == 200:
                    return response.json()
                print(f"Query failed with status {response.status_code}, retrying...")
                time.sleep(5)
            except Exception as e:
                print(f"Request error: {e}, retrying...")
                time.sleep(5)
        return None

    print(f"Fetching Bengaluru data for bbox: {bbox}...")
    
    # 1. BUILDINGS
    print("Fetching Buildings...")
    building_query = f"""
    [out:json][timeout:180];
    (
      way["building"]({bbox});
      relation["building"]({bbox});
    );
    out body;
    >;
    out skel qt;
    """
    
    data = run_query(building_query)
    if not data:
        print("Failed to fetch buildings")
        return
    
    # Map nodes for coordinate lookup
    nodes = {n['id']: [n['lon'], n['lat']] for n in data['elements'] if n['type'] == 'node'}
    
    building_features = []
    for el in data['elements']:
        if el['type'] == 'way' and 'nodes' in el:
            coords = [nodes[node_id] for node_id in el['nodes'] if node_id in nodes]
            if len(coords) < 3: continue
            if coords[0] != coords[-1]: coords.append(coords[0])
            
            tags = el.get('tags', {})
            height = float(tags.get("height", 3)) if "height" in tags else 3
            if "building:levels" in tags:
                try:
                    levels = [float(l.strip()) for l in tags.get("building:levels").replace(",", " ").replace(";", " ").split() if l.strip().isdigit()]
                    if levels: height = max(levels) * 3.5
                except: pass
                
            building_features.append({
                "type": "Feature",
                "geometry": {"type": "Polygon", "coordinates": [coords]},
                "properties": {
                    "id": el['id'],
                    "name": tags.get("name", "Structure"),
                    "height": height,
                    "type": tags.get("building", "yes")
                }
            })

    # 2. INFRASTRUCTURE
    print("Fetching Infrastructure...")
    infra_query = f"""
    [out:json][timeout:180];
    (
      way["highway"]({bbox});
      way["railway"]({bbox});
      way["bridge"="yes"]({bbox});
    );
    out body;
    >;
    out skel qt;
    """
    
    infra_data = run_query(infra_query)
    if not infra_data:
        print("Failed to fetch infrastructure")
        return
        
    infra_nodes = {n['id']: [n['lon'], n['lat']] for n in infra_data['elements'] if n['type'] == 'node'}
    infra_features = []
    utility_features = []
    
    for el in infra_data['elements']:
        if el['type'] == 'way' and 'nodes' in el:
            coords = [infra_nodes[node_id] for node_id in el['nodes'] if node_id in infra_nodes]
            if len(coords) < 2: continue
            
            tags = el.get('tags', {})
            infra_type = "road"
            if "railway" in tags:
                infra_type = "railway"
                if tags.get("railway") == "subway": infra_type = "metro"
            elif "bridge" in tags:
                infra_type = "flyover"
                
            infra_features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": coords},
                "properties": {
                    "id": el['id'],
                    "name": tags.get("name", "Unnamed"),
                    "type": infra_type,
                    "class": tags.get("highway", tags.get("railway", "unknown"))
                }
            })
            
            # Synthetic Utilities
            if "highway" in tags:
                highway = tags.get("highway")
                if highway in ["primary", "secondary"]:
                    utility_features.append({
                        "type": "Feature",
                        "geometry": {"type": "LineString", "coordinates": [[c[0]+0.00005, c[1]+0.00003] for c in coords]},
                        "properties": {"type": "WaterPipe", "name": f"Water - {tags.get('name', '')}"}
                    })
                utility_features.append({
                    "type": "Feature",
                    "geometry": {"type": "LineString", "coordinates": [[c[0]-0.00005, c[1]-0.00003] for c in coords]},
                    "properties": {"type": "ElectricityLine", "name": f"Power - {tags.get('name', '')}"}
                })

    # Save
    os.makedirs("../data", exist_ok=True)
    os.makedirs("../client/public/data", exist_ok=True)
    
    data_files = {
        "bengaluru_buildings.json": {"type": "FeatureCollection", "features": building_features},
        "bengaluru_infrastructure.json": {"type": "FeatureCollection", "features": infra_features},
        "bengaluru_utilities.json": {"type": "FeatureCollection", "features": utility_features}
    }
    
    for filename, content in data_files.items():
        for base_path in ["../data", "../client/public/data"]:
            path = os.path.join(base_path, filename)
            with open(path, "w") as f:
                json.dump(content, f)
            
    print(f"Bengaluru data saved: {len(building_features)} buildings, {len(infra_features)} infra, {len(utility_features)} utilities.")

if __name__ == "__main__":
    extract_bengaluru_data()
