import overpy
import json
import os

def get_city_data(city_name, bbox):
    api = overpy.Overpass()
    # Query for buildings in the city bounding box
    query = f"""
    [out:json][timeout:300];
    (
      way["building"]({bbox});
      relation["building"]({bbox});
    );
    out body;
    >;
    out skel qt;
    """
    
    print(f"Fetching {city_name} building data from Overpass API...")
    result = api.query(query)
    
    features = []
    
    for way in result.ways:
        coords = [[float(node.lon), float(node.lat)] for node in way.nodes]
        if len(coords) < 3:
            continue
            
        if coords[0] != coords[-1]:
            coords.append(coords[0])
            
        height = float(way.tags.get("height", 3)) if "height" in way.tags else 3
        if "building:levels" in way.tags:
            try:
                levels_str = way.tags.get("building:levels")
                levels = [float(l.strip()) for l in levels_str.replace(",", " ").replace(";", " ").split() if l.strip().replace('.','',1).isdigit()]
                if levels:
                    height = max(levels) * 3
            except:
                pass
            
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            },
            "properties": {
                "id": way.id,
                "name": way.tags.get("name", "Unnamed Building"),
                "height": height,
                "type": way.tags.get("building", "yes")
            }
        }
        features.append(feature)
        
    output_path = f"../data/{city_name.lower()}_buildings.json"
    with open(output_path, "w") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f)
        
    print(f"Successfully extracted {len(features)} buildings to {output_path}")

if __name__ == "__main__":
    # Bengaluru bounding box (roughly center city)
    # 12.92, 77.53 to 13.02, 77.65
    bengaluru_bbox = "12.92, 77.53, 13.02, 77.65"
    get_city_data("Bengaluru", bengaluru_bbox)
