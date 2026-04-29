const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = 'client/public/data/bengaluru_utilities.json';

// Bengaluru Bounding Box (Approx city wide)
const minLat = 12.85;
const maxLat = 13.10;
const minLng = 77.45;
const maxLng = 77.75;

const step = 0.005; // Density of the grid

const features = [];

const types = [
  { type: 'ElectricityLine', color: '#ffffff' },
  { type: 'WaterPipe', color: '#2563eb' },
  { type: 'SewagePipe', color: '#facc15' },
  { type: 'GasLine', color: '#f97316' }
];

// Generate a grid-like utility network across the entire city
for (let lat = minLat; lat <= maxLat; lat += step) {
  for (let lng = minLng; lng <= maxLng; lng += step) {
    // Random jitter to make it look less like a perfect grid and more like city roads
    const jitterLat = (Math.random() - 0.5) * 0.002;
    const jitterLng = (Math.random() - 0.5) * 0.002;
    
    const start = [lng + jitterLng, lat + jitterLat];
    
    // Horizontal line
    if (lng + step <= maxLng) {
      const endH = [lng + step + (Math.random() - 0.5) * 0.002, lat + (Math.random() - 0.5) * 0.002];
      const typeH = types[Math.floor(Math.random() * types.length)];
      features.push({
        type: 'Feature',
        properties: { type: typeH.type, name: typeH.type.replace(/([A-Z])/g, ' $1').trim() },
        geometry: { type: 'LineString', coordinates: [start, endH] }
      });
    }
    
    // Vertical line
    if (lat + step <= maxLat) {
      const endV = [lng + (Math.random() - 0.5) * 0.002, lat + step + (Math.random() - 0.5) * 0.002];
      const typeV = types[Math.floor(Math.random() * types.length)];
      features.push({
        type: 'Feature',
        properties: { type: typeV.type, name: typeV.type.replace(/([A-Z])/g, ' $1').trim() },
        geometry: { type: 'LineString', coordinates: [start, endV] }
      });
    }
  }
}

const geojson = {
  type: 'FeatureCollection',
  features: features
};

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(geojson));
console.log(`Generated ${features.length} utility features for entire Bengaluru map.`);
