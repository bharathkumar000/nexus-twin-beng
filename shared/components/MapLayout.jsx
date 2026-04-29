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
  demolishedBuildingIds = [],
  gridData = null,
  onGridClick = null,
  selectedGridCellId = null,
  children 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const hoveredIdRef = useRef(null);

  const [mapLoaded, setMapLoaded] = React.useState(false);

  // 1. REACTIVE X-RAY TOGGLE
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const xrayLayers = ['3d-buildings', 'road-label', 'settlement-label', 'poi-label', 'water-name', 'natural-label'];
    xrayLayers.forEach(layer => {
      if (map.current.getLayer(layer)) {
        map.current.setLayoutProperty(layer, 'visibility', isXrayEnabled ? 'none' : 'visible');
      }
    });

    // Darken the background for X-Ray
    if (map.current.getLayer('water')) {
      map.current.setPaintProperty('water', 'fill-color', isXrayEnabled ? '#050505' : '#d2e4f0');
    }
    if (map.current.getLayer('background')) {
      map.current.setPaintProperty('background', 'background-color', isXrayEnabled ? '#000000' : '#f8f4f0');
    }

    // Toggle X-Ray specific layers
    ['building-footprints', 'utility-pipes', 'utility-pipes-glow', 'minecraft-grid'].forEach(l => {
      if (map.current.getLayer(l)) {
        map.current.setLayoutProperty(l, 'visibility', isXrayEnabled ? 'visible' : 'none');
      }
    });

    if (map.current.getLayer('xray-dark-tiles')) {
      map.current.setLayoutProperty('xray-dark-tiles', 'visibility', isXrayEnabled ? 'visible' : 'none');
    }

  }, [isXrayEnabled, mapLoaded]);

  // 2. INITIALIZATION
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
          'dark-blueprint': { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 },
          'buildings': { type: 'geojson', data: '/data/bengaluru_buildings.json', generateId: true },
          'infrastructure': { type: 'geojson', data: '/data/bengaluru_infrastructure.json' },
          'utilities': { type: 'geojson', data: '/data/bengaluru_utilities.json' },
          'grid-source': { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'id' }
        },
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#000000' } },
          { id: 'hybrid-tiles', type: 'raster', source: 'google-hybrid', layout: { visibility: 'visible' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          { id: 'xray-dark-tiles', type: 'raster', source: 'dark-blueprint', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.1 } },
          
          // X-RAY BUILDING FOOTPRINTS (CIRCUIT LOOK)
          {
            id: 'building-footprints',
            type: 'line',
            source: 'buildings',
            layout: { visibility: 'none' },
            paint: {
              'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 16, 1.5, 18, 2.5],
              'line-color': '#facc15',
              'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.2, 16, 0.8]
            }
          },

          // MINECRAFT GRID
          {
            id: 'minecraft-grid',
            type: 'fill',
            source: 'grid-source',
            layout: { visibility: 'none' },
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 'rgba(37, 99, 235, 0.4)',
                ['boolean', ['get', 'major'], false], 'rgba(255, 255, 255, 0.05)',
                'rgba(255, 255, 255, 0.02)'
              ],
              'fill-outline-color': 'rgba(255, 255, 255, 0.1)'
            }
          },
          
          {
            id: 'utility-pipes-glow',
            type: 'line',
            source: 'utilities',
            layout: { visibility: 'none' },
            paint: {
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 15, 8, 18, 30],
              'line-color': ['match', ['get', 'type'], 
                'WaterPipe', '#2563eb', 
                'SewagePipe', '#facc15', 
                'GasLine', '#f97316', 
                'ElectricityLine', '#ffffff', 
                '#ffffff'
              ],
              'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0, 14, 0.4],
              'line-blur': 12
            }
          },

          {
            id: 'utility-pipes',
            type: 'line',
            source: 'utilities',
            layout: { visibility: 'none' },
            paint: {
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 15, 2, 18, 6],
              'line-color': ['match', ['get', 'type'], 
                'WaterPipe', '#60a5fa', 
                'SewagePipe', '#fde047', 
                'GasLine', '#fb923c', 
                'ElectricityLine', '#ffffff', 
                '#ffffff'
              ],
              'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.2, 14, 1]
            }
          },
          
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], '#2563eb',
                ['boolean', ['feature-state', 'hover'], false], '#60a5fa',
                ['interpolate', ['linear'], ['get', 'height'], 0, '#e8e4de', 5, '#d8d2ca', 10, '#c8c0b6', 20, '#b8aea2', 40, '#a89e90']
              ],
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 6],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.88
            },
            filter: ['!', ['in', ['id'], ['literal', demolishedBuildingIds]]]
          }
        ]
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing || 0,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      if (onMapLoad) onMapLoad(map.current);
      
      // Grid selection
      map.current.on('click', 'minecraft-grid', (e) => {
        if (e.originalEvent._buildingClicked) return;
        e.originalEvent._gridClicked = true;
        if (e.features.length > 0 && onGridClick) {
          const props = e.features[0].properties;
          onGridClick({ id: props.id, lngLat: { lng: props.lng, lat: props.lat } });
        }
      });

      map.current.on('click', (e) => {
        if (e.originalEvent._buildingClicked || e.originalEvent._gridClicked) return;
        if (onGridClick) {
          const step = 0.0005;
          const snappedLng = Math.round(e.lngLat.lng / step) * step;
          const snappedLat = Math.round(e.lngLat.lat / step) * step;
          onGridClick({ id: `v-${Date.now()}`, lngLat: { lng: snappedLng, lat: snappedLat } });
        }
      });

      // Hover effect on buildings
      map.current.on('mousemove', '3d-buildings', (e) => {
        if (e.features.length > 0) {
          if (hoveredIdRef.current !== null) {
            try { map.current.setFeatureState({ source: 'buildings', id: hoveredIdRef.current }, { hover: false }); } catch(err){}
          }
          hoveredIdRef.current = e.features[0].id;
          try { map.current.setFeatureState({ source: 'buildings', id: hoveredIdRef.current }, { hover: true }); } catch(err){}
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', '3d-buildings', () => {
        if (hoveredIdRef.current !== null) {
          try { map.current.setFeatureState({ source: 'buildings', id: hoveredIdRef.current }, { hover: false }); } catch(err){}
        }
        hoveredIdRef.current = null;
        map.current.getCanvas().style.cursor = '';
      });

      // Click on buildings — fire callback to parent
      map.current.on('click', '3d-buildings', (e) => {
        e.originalEvent._buildingClicked = true; // Mark as building click
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

    });
  }, [onMapLoad]);

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
      try { map.current.setFeatureState({ source: 'grid-source', id: selectedGridCellId }, { selected: true }); } catch(err){}
    }
    prevGridSelectedRef.current = selectedGridCellId;
  }, [selectedGridCellId, gridData]);

  // Handle selected building highlight
  const prevSelectedRef = useRef([]);
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    prevSelectedRef.current.forEach(id => {
      if (!selectedBuildingIds.includes(id)) {
        try { map.current.setFeatureState({ source: 'buildings', id: id }, { selected: false }); } catch (e) {}
      }
    });
    
    selectedBuildingIds.forEach(id => {
      if (!prevSelectedRef.current.includes(id)) {
        try { map.current.setFeatureState({ source: 'buildings', id: id }, { selected: true }); } catch (e) {}
      }
    });
    
    prevSelectedRef.current = [...selectedBuildingIds];
  }, [selectedBuildingIds]);

  // Handle demolished buildings filter update
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    if (map.current.getLayer('3d-buildings')) {
      map.current.setFilter('3d-buildings', ['!', ['in', ['id'], ['literal', demolishedBuildingIds]]]);
    }
  }, [demolishedBuildingIds]);

  // Style switching
  useEffect(() => {
    if (!map.current) return;
    
    const updateVisibility = () => {
      const isSat = currentStyle === 'satellite';
      const isHybrid = currentStyle === 'hybrid';
      const isStreets = currentStyle === 'streets';
      
      // GROUND LAYER OPACITY: Surface becomes 10% opaque (ghostly) in X-Ray mode
      const opacity = isXrayEnabled ? 0.1 : 1;
      
      if (map.current.getLayer('satellite-tiles')) {
        map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
        map.current.setPaintProperty('satellite-tiles', 'raster-opacity', isSat ? opacity : 0);
      }
      if (map.current.getLayer('hybrid-tiles')) {
        map.current.setLayoutProperty('hybrid-tiles', 'visibility', isHybrid ? 'visible' : 'none');
        map.current.setPaintProperty('hybrid-tiles', 'raster-opacity', isHybrid ? opacity : 0);
      }
      if (map.current.getLayer('street-tiles')) {
        map.current.setLayoutProperty('street-tiles', 'visibility', isStreets ? 'visible' : 'none');
        map.current.setPaintProperty('street-tiles', 'raster-opacity', isStreets ? opacity : 0);
      }

      if (map.current.getLayer('3d-buildings')) {
        map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', isXrayEnabled ? 0.05 : 0.88);
      }
    };

    if (map.current.isStyleLoaded()) {
      updateVisibility();
    } else {
      map.current.once('styledata', updateVisibility);
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
