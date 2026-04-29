import React, { useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { DeckGL } from '@deck.gl/react';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapLayout = ({ 
  viewState, 
  layers, 
  currentStyle, 
  isXrayEnabled, 
  onMapLoad, 
  onWebGLInitialized,
  onViewStateChange,
  onBuildingClick,
  selectedBuildingIds = [],
  gridData = null,
  onGridClick = null,
  selectedGridCellId = null,
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
          'buildings': { type: 'geojson', data: '/data/bengaluru_buildings.json', generateId: true },
          'infrastructure': { type: 'geojson', data: '/data/bengaluru_infrastructure.json' },
          'utilities': { type: 'geojson', data: '/data/bengaluru_utilities.json' },
          'grid-source': { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'id' }
        },
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0a0b10' } },
          { id: 'hybrid-tiles', type: 'raster', source: 'google-hybrid', layout: { visibility: 'visible' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          
          // MINECRAFT GRID — rendered on the ground (first in stack)
          {
            id: 'minecraft-grid',
            type: 'fill',
            source: 'grid-source',
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                'rgba(37, 99, 235, 0.4)',
                'rgba(0, 0, 0, 0)'
              ],
              'fill-outline-color': 'rgba(255, 255, 255, 0.2)'
            }
          },
          
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
          },
          // 3D BUILDINGS — rendered natively inside MapLibre so they NEVER drift
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                '#2563eb',  // Selected = blue highlight
                ['boolean', ['feature-state', 'hover'], false],
                '#60a5fa',  // Hover = lighter blue
                [
                  'interpolate', ['linear'], ['get', 'height'],
                  0, '#e8e4de',
                  5, '#d8d2ca',
                  10, '#c8c0b6',
                  20, '#b8aea2',
                  40, '#a89e90'
                ]
              ],
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 6],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.88
            }
          }
        ]
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing || 0,
      antialias: true
    });

    let hoveredId = null;

    map.current.on('load', () => {
      // Grid selection
      map.current.on('click', 'minecraft-grid', (e) => {
        if (e.features.length > 0 && onGridClick) {
          onGridClick(e.features[0].properties.id);
        }
      });

      // Hover effect on buildings
      map.current.on('mousemove', '3d-buildings', (e) => {
        if (e.features.length > 0) {
          if (hoveredId !== null) {
            try { map.current.setFeatureState({ source: 'buildings', id: hoveredId }, { hover: false }); } catch(err){}
          }
          hoveredId = e.features[0].id;
          try { map.current.setFeatureState({ source: 'buildings', id: hoveredId }, { hover: true }); } catch(err){}
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', '3d-buildings', () => {
        if (hoveredId !== null) {
          try { map.current.setFeatureState({ source: 'buildings', id: hoveredId }, { hover: false }); } catch(err){}
        }
        hoveredId = null;
        map.current.getCanvas().style.cursor = '';
      });

      // Click on buildings — fire callback to parent
      map.current.on('click', '3d-buildings', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          if (onBuildingClick) {
            onBuildingClick({
              id: feature.id,
              name: feature.properties.name || 'Unnamed Structure',
              height: feature.properties.height || 6,
              type: feature.properties.type || 'building',
              osm_id: feature.properties.id,
              lngLat: e.lngLat,
              geometry: feature.geometry,
              isShiftPressed: e.originalEvent.shiftKey
            });
          }
        }
      });

      onMapLoad(map.current);
    });
  }, []);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !gridData) return;
    const source = map.current.getSource('grid-source');
    if (source) source.setData(gridData);
  }, [gridData]);

  // Handle selected grid cell highlight
  const prevGridSelectedRef = useRef(null);
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    if (prevGridSelectedRef.current !== null) {
      try { map.current.setFeatureState({ source: 'grid-source', id: prevGridSelectedRef.current }, { selected: false }); } catch(err){}
    }
    if (selectedGridCellId !== null) {
      // Feature states in MapLibre for GeoJSON require the feature to have a numeric ID or we use promoteId
      // In gridData, I'll make sure each feature has an id property
      try { map.current.setFeatureState({ source: 'grid-source', id: selectedGridCellId }, { selected: true }); } catch(err){}
    }
    prevGridSelectedRef.current = selectedGridCellId;
  }, [selectedGridCellId, gridData]);

  // Handle selected building highlight
  const prevSelectedRef = useRef([]);
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    // Clear previous selections that are no longer selected
    prevSelectedRef.current.forEach(id => {
      if (!selectedBuildingIds.includes(id)) {
        try {
          map.current.setFeatureState({ source: 'buildings', id: id }, { selected: false });
        } catch (e) { /* ignore */ }
      }
    });
    
    // Set new selections
    selectedBuildingIds.forEach(id => {
      if (!prevSelectedRef.current.includes(id)) {
        try {
          map.current.setFeatureState({ source: 'buildings', id: id }, { selected: true });
        } catch (e) { /* ignore */ }
      }
    });
    
    prevSelectedRef.current = [...selectedBuildingIds];
  }, [selectedBuildingIds]);

  // Style switching
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const isSat = currentStyle === 'satellite';
    const isHybrid = currentStyle === 'hybrid';
    const isStreets = currentStyle === 'streets';

    if (map.current.getLayer('satellite-tiles')) map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    if (map.current.getLayer('hybrid-tiles')) map.current.setLayoutProperty('hybrid-tiles', 'visibility', isHybrid ? 'visible' : 'none');
    if (map.current.getLayer('street-tiles')) map.current.setLayoutProperty('street-tiles', 'visibility', isStreets ? 'visible' : 'none');
    
    const targetLayer = isSat ? 'satellite-tiles' : (isHybrid ? 'hybrid-tiles' : 'street-tiles');
    if (map.current.getLayer(targetLayer)) map.current.setPaintProperty(targetLayer, 'raster-opacity', isXrayEnabled ? 0.15 : 1);
    if (map.current.getLayer('utility-pipes')) map.current.setPaintProperty('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    
    // In X-ray mode, make buildings semi-transparent so utilities show through
    if (map.current.getLayer('3d-buildings')) {
      map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', isXrayEnabled ? 0.15 : 0.88);
    }
  }, [currentStyle, isXrayEnabled]);

  // Sync MapLibre camera with Deck.gl viewState
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
          layers={layers} 
        />
      </div>
    </>
  );
};

export default MapLayout;
