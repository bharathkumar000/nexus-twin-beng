const fs = require('fs');
const path = require('path');

const BUILDINGS_PATH = 'client/public/data/bengaluru_buildings.json';
const OUTPUT_PATH = 'client/public/data/bengaluru_utilities.json';

const buildingsData = JSON.parse(fs.readFileSync(BUILDINGS_PATH, 'utf8'));
const features = [];

const types = [
  { type: 'ElectricityLine', color: '#ffffff' },
  { type: 'WaterPipe', color: '#2563eb' },
  { type: 'SewagePipe', color: '#facc15' },
  { type: 'GasLine', color: '#f97316' }
];

// 1. EXTRACT BUILDING BOUNDARIES TO CREATE "STREET" PIPELINES
// We'll take building polygons and generate lines that follow their bounding boxes or edges
buildingsData.features.forEach((building, idx) => {
  if (idx % 15 !== 0) return; // Sampling to keep performance high and network "justified"
  
  const coords = building.geometry.coordinates[0];
  if (!coords) return;

  // For each sampled building, we generate 1-2 utility lines that follow the block logic
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Calculate bounding box center and spread
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  coords.forEach(p => {
    if (p[0] < minLng) minLng = p[0];
    if (p[0] > maxLng) maxLng = p[0];
    if (p[1] < minLat) minLat = p[1];
    if (p[1] > maxLat) maxLat = p[1];
  });

  const offset = 0.0001; // Offset from building to look like street pipes

  // Generate Horizontal street pipe
  features.push({
    type: 'Feature',
    properties: { type: type.type },
    geometry: {
      type: 'LineString',
      coordinates: [
        [minLng - offset, minLat - offset],
        [maxLng + offset, minLat - offset]
      ]
    }
  });

  // Generate Vertical street pipe
  features.push({
    type: 'Feature',
    properties: { type: types[Math.floor(Math.random() * types.length)].type },
    geometry: {
      type: 'LineString',
      coordinates: [
        [minLng - offset, minLat - offset],
        [minLng - offset, maxLat + offset]
      ]
    }
  });
});

// 2. ADD MAIN ARTERIAL PIPELINES (THE LONG ONES IN REFERENCE IMAGES)
const arterialCount = 40;
for (let i = 0; i < arterialCount; i++) {
  const isLat = Math.random() > 0.5;
  const startLng = 77.45 + Math.random() * 0.3;
  const startLat = 12.85 + Math.random() * 0.25;
  const length = 0.05 + Math.random() * 0.1;
  const type = types[Math.floor(Math.random() * types.length)];

  features.push({
    type: 'Feature',
    properties: { type: type.type, main: true },
    geometry: {
      type: 'LineString',
      coordinates: isLat ? [[startLng, startLat], [startLng + length, startLat]] : [[startLng, startLat], [startLng, startLat + length]]
    }
  });
}

const geojson = {
  type: 'FeatureCollection',
  features: features
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(geojson));
console.log(`Generated ${features.length} justified, building-aligned utility features.`);
