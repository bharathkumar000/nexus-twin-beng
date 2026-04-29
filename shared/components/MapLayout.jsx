import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapLayout = ({ 
  viewState, 
  layers, 
  currentStyle, 
  isXrayEnabled, 
  onMapLoad, 
  onWebGLInitialized,
  onViewStateChange,
  children 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'google-satellite': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'], tileSize: 256 },
          'google-roads': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'], tileSize: 256 },
          'google-hybrid': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'], tileSize: 256 },
          'infrastructure': { type: 'geojson', data: '/data/bengaluru_infrastructure.json' },
          'utilities': { type: 'geojson', data: '/data/bengaluru_utilities.json' }
        },
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0a0b10' } },
          { id: 'hybrid-tiles', type: 'raster', source: 'google-hybrid', layout: { visibility: 'visible' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          {
            id: 'utility-pipes',
            type: 'line',
            source: 'utilities',
            paint: {
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 18, 8],
              'line-color': ['match', ['get', 'type'], 
                'WaterPipe', '#2563eb', 
                'SewagePipe', '#facc15', 
                'GasLine', '#f97316', 
                'ElectricityLine', '#ffffff',
                '#ffffff'],
              'line-opacity': 0,
              'line-dasharray': [2, 1]
            }
          }
        ]
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      antialias: true
    });

    map.current.on('load', () => onMapLoad(map.current));
  }, []);

  const buildingLayer = new GeoJsonLayer({
    id: 'building-mesh-layer',
    data: '/data/bengaluru_buildings.json',
    extruded: true,
    wireframe: true,
    filled: true,
    getElevation: d => d.properties.height || 15,
    getFillColor: [255, 255, 255, 255],
    getLineColor: [200, 210, 220, 150],
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: true,
    highlightColor: [37, 99, 235, 200],
    opacity: 1,
    material: {
      ambient: 1.0,
      diffuse: 0.0,
      shininess: 0,
      specularColor: [255, 255, 255]
    }
  });

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const updateStyle = () => {
      const isSat = currentStyle === 'satellite';
      const isHybrid = currentStyle === 'hybrid';
      const isStreets = currentStyle === 'streets';

      if (map.current.getLayer('satellite-tiles')) map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
      if (map.current.getLayer('hybrid-tiles')) map.current.setLayoutProperty('hybrid-tiles', 'visibility', isHybrid ? 'visible' : 'none');
      if (map.current.getLayer('street-tiles')) map.current.setLayoutProperty('street-tiles', 'visibility', isStreets ? 'visible' : 'none');
      
      const targetLayer = isSat ? 'satellite-tiles' : (isHybrid ? 'hybrid-tiles' : 'street-tiles');
      if (map.current.getLayer(targetLayer)) map.current.setPaintProperty(targetLayer, 'raster-opacity', isXrayEnabled ? 0.15 : 1);
      if (map.current.getLayer('utility-pipes')) map.current.setPaintProperty('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    };

    updateStyle();
  }, [currentStyle, isXrayEnabled]);

  useEffect(() => {
    if (map.current) {
      map.current.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing
      });
    }
  }, [viewState]);

  return (
    <>
      <div ref={mapContainer} className="map-viewport">
        {children}
      </div>
      <div className="deck-overlay">
        <DeckGL 
          viewState={viewState} 
          onViewStateChange={onViewStateChange}
          controller={true}
          onWebGLInitialized={onWebGLInitialized}
          layers={[buildingLayer, ...layers]} 
        />
      </div>
    </>
  );
};

export default MapLayout;
