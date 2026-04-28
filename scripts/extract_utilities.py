import overpy
import json

def extract_pipelines(city_name, bbox):
    api = overpy.Overpass()
    
    print(f"Extracting {city_name} pipeline data from OSM...")
    query = f"""
    [out:json][timeout:180];
    (
      way["man_made"="pipeline"]({bbox});
      way["waterway"]({bbox});
    );
    out body;
    >;
    out skel qt;
    """
    
    features = []
    
    try:
        result = api.query(query)
        for way in result.ways:
            coords = [[float(n.lon), float(n.lat)] for n in way.nodes]
            if len(coords) < 2: continue
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": coords},
                "properties": {
                    "type": "WaterPipe",
                    "name": way.tags.get("name", "Water Line"),
                    "source": "osm"
                }
            })
    except Exception as e:
        print(f"OSM query error: {e}")
    
    # Roads for synthetic utilities
    road_query = f"""
    [out:json][timeout:180];
    (
      way["highway"~"primary|secondary|tertiary"]({bbox});
    );
    out body;
    >;
    out skel qt;
    """
    
    try:
        road_result = api.query(road_query)
        for way in road_result.ways:
            coords = [[float(n.lon), float(n.lat)] for n in way.nodes]
            if len(coords) < 2: continue
            
            road_name = way.tags.get("name", "Unnamed Road")
            
            # Synthetic Water
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[c[0] + 0.00008, c[1] + 0.00005] for c in coords]},
                "properties": {"type": "WaterPipe", "name": f"Water Main - {road_name}", "source": "synthetic"}
            })
            
            # Synthetic Gas
            features.append({
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[c[0] - 0.00008, c[1] - 0.00005] for c in coords]},
                "properties": {"type": "GasLine", "name": f"Gas Pipeline - {road_name}", "source": "synthetic"}
            })
    except Exception as e:
        print(f"Road extraction error: {e}")
    
    collection = {"type": "FeatureCollection", "features": features}
    output_path = f"../data/{city_name.lower()}_utilities.json"
    with open(output_path, "w") as f:
        json.dump(collection, f)
    
    # Also copy to client public
    client_path = f"../client/public/data/{city_name.lower()}_utilities.json"
    os.makedirs(os.path.dirname(client_path), exist_ok=True)
    with open(client_path, "w") as f:
        json.dump(collection, f)

    print(f"Total {city_name} utility features: {len(features)}")

if __name__ == "__main__":
    import os
    bengaluru_bbox = "12.92, 77.53, 13.02, 77.65"
    extract_pipelines("Bengaluru", bengaluru_bbox)
