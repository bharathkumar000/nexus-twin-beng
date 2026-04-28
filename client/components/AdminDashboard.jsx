'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Search, Loader2, Building2, Trash2, AlertTriangle, X, MapPin, 
  Layers, Navigation, Wind, Leaf, History, Eye, Map as MapIcon, 
  MessageSquare, Camera, Droplets, Zap, Flame, Terminal, ShieldAlert,
  BarChart3, Globe, Activity, Bot, Send, LogOut, CloudRain, Sun, 
  Settings2, Download, Database, Train
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { useRouter } from 'next/navigation';

// --- ANIMATION VARIANTS ---
const panelVariants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};
const HYDRANTS = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5946, 12.9716] }, properties: { name: 'Cubbon Park Hydrant' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5960, 12.9730] }, properties: { name: 'Vidhana Soudha Hydrant' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5920, 12.9700] }, properties: { name: 'MG Road Hydrant' } }
  ]
};

const MOCK_AQI = {
  type: 'FeatureCollection',
  features: Array.from({ length: 30 }, () => ({
    type: 'Feature',
    properties: { aqi: Math.random() * 200 },
    geometry: { type: 'Point', coordinates: [77.57 + Math.random() * 0.05, 12.95 + Math.random() * 0.05] }
  }))
};

const AGENT_COUNT = 400;
const BENGALURU_BOUNDS = { minLng: 77.57, maxLng: 77.62, minLat: 12.95, maxLat: 13.00 };

const generateAgents = () => {
  return Array.from({ length: AGENT_COUNT }, (_, i) => ({
    id: i,
    home: [
      BENGALURU_BOUNDS.minLng + Math.random() * (BENGALURU_BOUNDS.maxLng - BENGALURU_BOUNDS.minLng),
      BENGALURU_BOUNDS.minLat + Math.random() * (BENGALURU_BOUNDS.maxLat - BENGALURU_BOUNDS.minLat)
    ],
    work: [
      BENGALURU_BOUNDS.minLng + Math.random() * (BENGALURU_BOUNDS.maxLng - BENGALURU_BOUNDS.minLng),
      BENGALURU_BOUNDS.minLat + Math.random() * (BENGALURU_BOUNDS.maxLat - BENGALURU_BOUNDS.minLat)
    ],
    pos: [0, 0],
    path: [],
    speed: 0.0008 + Math.random() * 0.0015,
    state: Math.random() > 0.5 ? 'commuting' : 'working',
    progress: Math.random(),
    color: [0, 242, 255, 200]
  }));
};

const AdminDashboard = () => {
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const assetToPlaceRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('missions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDemolishMode, setIsDemolishMode] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [demolishedId, setDemolishedId] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);
  const [isStyleReady, setIsStyleReady] = useState(false);

  const onWebGLInitialized = (gl) => {
    setGlContext(gl);
    setGraphicsReady(true);
  };

  useEffect(() => {
    setIsCollapsed(window.innerWidth < 768);
    const timer = setTimeout(() => setGraphicsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const [floodLevel, setFloodLevel] = useState(0);
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showHydrants, setShowHydrants] = useState(false);
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [placedAssets, setPlacedAssets] = useState([]);
  const [assetToPlace, setAssetToPlace] = useState(null);
  useEffect(() => { assetToPlaceRef.current = assetToPlace; }, [assetToPlace]);
  const [scorecard, setScorecard] = useState({ economic: 65, social: 70, environmental: 55 });
  const [isRainy, setIsRainy] = useState(false);
  const [smogLevel, setSmogLevel] = useState(0.1);
  const [isGridLocked, setIsGridLocked] = useState(false);
  const [showGodMode, setShowGodMode] = useState(false);
  const [isGodModeCollapsed, setIsGodModeCollapsed] = useState(false);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorLog, setAdvisorLog] = useState([]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [stormIntensity, setStormIntensity] = useState(5);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictiveData, setPredictiveData] = useState(null);
  const [showReportingHint, setShowReportingHint] = useState(false);

  const ASSET_TEMPLATES = {
    'Skyscraper': { height: 60, color: '#3c4043', impacts: { economic: 15, social: 5, environmental: -10 }, icon: <Building2 size={24}/> },
    'Urban Park': { height: 2, color: '#00ff9d', impacts: { economic: -5, social: 15, environmental: 25 }, icon: <Leaf size={24}/> },
    'Flyover': { height: 12, color: '#ffa600', impacts: { economic: 20, social: 10, environmental: -8 }, icon: <Navigation size={24}/> },
    'Road Exp.': { height: 1, color: '#555', impacts: { economic: 12, social: 5, environmental: -12 }, icon: <Zap size={24}/> },
    'Metro Station': { height: 15, color: '#00ffcc', impacts: { economic: 25, social: 18, environmental: 5 }, icon: <Train size={24}/> },
    'Solar Hub': { height: 5, color: '#ffcc00', impacts: { economic: 12, social: 2, environmental: 35 }, icon: <Zap size={24}/> }
  };

  const [viewState, setViewState] = useState({
    longitude: 77.5873,
    latitude: 13.1287,
    zoom: 15,
    pitch: 55,
    bearing: 0
  });

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
          'buildings': { type: 'geojson', data: '/data/bengaluru_buildings.json' },
          'infrastructure': { type: 'geojson', data: '/data/bengaluru_infrastructure.json' },
          'utilities': { type: 'geojson', data: '/data/bengaluru_utilities.json' },
          'aqi-source': { type: 'geojson', data: MOCK_AQI },
          'hydrants': { type: 'geojson', data: HYDRANTS },
          'blast-circle': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          'emergency-path': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          'placed-assets': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0a0b10' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'visible' } },
          { id: 'hybrid-tiles', type: 'raster', source: 'google-hybrid', layout: { visibility: 'none' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          {
            id: 'infra-layer',
            type: 'line',
            source: 'infrastructure',
            paint: {
              'line-width': ['match', ['get', 'type'], 'flyover', 5, 'metro', 4, 2],
              'line-color': ['match', ['get', 'type'], 'flyover', '#ffa600', 'metro', '#00ffcc', '#607d8b'],
              'line-opacity': 0.8
            }
          },
          {
            id: 'utility-pipes',
            type: 'line',
            source: 'utilities',
            paint: {
              'line-width': 4,
              'line-color': ['match', ['get', 'type'], 
                'WaterPipe', '#00bcd4', 
                'ElectricityLine', '#ffeb3b', 
                'GasLine', '#ff9800', 
                'SewagePipe', '#8d6e63',
                '#ffffff'],
              'line-opacity': 0 
            }
          },
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': '#222',
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.8
            }
          },
          {
            id: 'placed-assets-layer',
            type: 'fill-extrusion',
            source: 'placed-assets',
            paint: {
              'fill-extrusion-color': ['get', 'color'],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.9
            }
          }
        ]
      },
      center: [77.5873, 13.1287],
      zoom: 15.5,
      pitch: 65, // Increased pitch for better 3D depth
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      setIsStyleReady(true);

      map.current.on('click', '3d-buildings', (e) => {
        const f = e.features[0];
        setSelectedBuilding({
          id: f.properties.id,
          name: f.properties.name || 'Structural Unit',
          height: f.properties.height || 15,
          lngLat: e.lngLat
        });
        setDemolishedId(null);
        const source = map.current.getSource('blast-circle');
        if (source) source.setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] } });
      });

      map.current.on('click', (e) => {
        // If an asset is selected in Builder mode, place it
        const currentAsset = assetToPlaceRef.current;
        if (currentAsset && ASSET_TEMPLATES[currentAsset]) {
          setPlacedAssets(prev => [...prev, { 
            id: Date.now(), 
            type: currentAsset, 
            lngLat: e.lngLat, 
            ...ASSET_TEMPLATES[currentAsset] 
          }]);
          setAssetToPlace(null); // Clear selection after placement
          return;
        }

        const features = map.current.queryRenderedFeatures(e.point, { layers: ['3d-buildings'] });
        if (features.length === 0 && !showReportingHint) {
          setSelectedBuilding(null);
          setImpactData(null);
        }
        if (showReportingHint) {
          const newReport = { id: Date.now(), lngLat: e.lngLat, type: 'issue' };
          setReports(prev => [...prev, { ...newReport }]);
          setShowReportingHint(false);
          new maplibregl.Marker({ color: '#ffcc00' }).setLngLat(e.lngLat).addTo(map.current);
        }
      });

      map.current.on('move', () => {
        const { lng, lat } = map.current.getCenter();
        setViewState({
          longitude: lng, latitude: lat,
          zoom: map.current.getZoom(),
          pitch: map.current.getPitch(),
          bearing: map.current.getBearing()
        });
      });
    });

    map.current.on('styledata', () => {
      setIsStyleReady(true);
    });

    const failSafe = setTimeout(() => {
      setMapLoaded(true);
    }, 5000);

    map.current.on('error', () => setMapLoaded(true));

    return () => {
      clearTimeout(failSafe);
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => prev.map(a => {
        let { home, work, progress, speed, state, path } = a;
        
        // Rerouting logic if near demolish site
        let effectiveSpeed = speed;
        if (demolishedId && selectedBuilding) {
          const dist = Math.sqrt(
            Math.pow(a.pos[0] - selectedBuilding.lngLat.lng, 2) + 
            Math.pow(a.pos[1] - selectedBuilding.lngLat.lat, 2)
          );
          if (dist < 0.002) effectiveSpeed *= 0.3; // Traffic jam effect
        }

        // Atmospheric impact on speed
        if (isRainy) effectiveSpeed *= 0.6;
        if (isGridLocked) effectiveSpeed = 0; // Total paralysis

        progress += effectiveSpeed;
        if (progress >= 1) { 
          progress = 0; 
          state = state === 'commuting' ? 'working' : 'commuting'; 
          path = []; // Reset path on cycle
        }
        
        const start = state === 'commuting' ? home : work;
        const end = state === 'commuting' ? work : home;
        const pos = [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
        
        const newPath = [...path, { pos, time: Date.now() / 1000 }].slice(-25);

        return { ...a, pos, progress, state, path: newPath };
      }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [demolishedId, selectedBuilding, isRainy, isGridLocked]);

  const agentLayer = new ScatterplotLayer({
    id: 'agent-layer',
    data: agents,
    getPosition: d => d.pos,
    getFillColor: [255, 204, 0],
    getRadius: 10,
    updateTriggers: { getPosition: [time] }
  });

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [255, 204, 0],
    trailLength: 15,
    currentTime: Date.now() / 1000
  });

  const failureLayer = predictiveData ? new ScatterplotLayer({
    id: 'failure-layer',
    data: predictiveData.points,
    getPosition: d => d.coordinates,
    getFillColor: [255, 61, 113, 200],
    getRadius: 100
  }) : null;

  const sentimentLayer = sentimentEnabled && sentimentData ? new HeatmapLayer({
    id: 'sentiment-heatmap',
    data: sentimentData.points,
    getPosition: d => d.coordinates,
    radiusPixels: 70,
    opacity: 0.6
  }) : null;

  useEffect(() => {
    if (!map.current || !mapLoaded || !isStyleReady) return;
    const isSat = currentStyle === 'satellite';
    const isHybrid = currentStyle === 'hybrid';
    const isStreets = currentStyle === 'streets';
    
    map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('hybrid-tiles', 'visibility', isHybrid ? 'visible' : 'none');
    map.current.setLayoutProperty('street-tiles', 'visibility', isStreets ? 'visible' : 'none');
    
    const targetLayer = isSat ? 'satellite-tiles' : (isHybrid ? 'hybrid-tiles' : 'street-tiles');
    map.current.setPaintProperty(targetLayer, 'raster-opacity', isXrayEnabled ? 0.15 : 1);
    map.current.setPaintProperty('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', isXrayEnabled ? 0.2 : 0.8);
    
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['==', ['get', 'id'], selectedBuilding?.id], '#00f2ff',
      ['<', ['%', ['get', 'id'], 15], Number(floodLevel)], '#0061ff',
      isXrayEnabled ? '#1a1c23' : (isGridLocked ? '#050608' : (isSat || isHybrid ? '#2a2d35' : '#e0e0e0'))
    ]);
  }, [isXrayEnabled, currentStyle, mapLoaded, isStyleReady, selectedBuilding, isGridLocked, floodLevel]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !isStyleReady) return;
    const source = map.current.getSource('placed-assets');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: placedAssets.map(a => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [a.lngLat.lng, a.lngLat.lat]
          },
          properties: { ...a }
        }))
      });
    }

    const newScore = placedAssets.reduce((acc, a) => ({
      economic: acc.economic + a.impacts.economic,
      social: acc.social + a.impacts.social,
      environmental: acc.environmental + a.impacts.environmental
    }), { economic: 65, social: 70, environmental: 55 });

    if (demolishedId) {
      newScore.economic -= 5;
      newScore.social -= 10;
      newScore.environmental -= 2;
    }

    setScorecard({
      economic: Math.min(100, Math.max(0, newScore.economic)),
      social: Math.min(100, Math.max(0, newScore.social)),
      environmental: Math.min(100, Math.max(0, newScore.environmental))
    });
  }, [placedAssets, demolishedId, mapLoaded]);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [res.data[0].lon, res.data[0].lat], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  const handlePredictFailures = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.post(`/api/predict-failures`, { stormIntensity });
      setPredictiveData(res.data);
    } catch (err) { console.error(err); }
    setIsPredicting(false);
  };

  const handleFetchSentiment = async () => {
    if (sentimentEnabled) return setSentimentEnabled(false);
    setIsSentimentLoading(true);
    try {
      const res = await axios.post(`/api/sentiment`);
      setSentimentData(res.data); setSentimentEnabled(true);
    } catch (err) { console.error(err); }
    setIsSentimentLoading(false);
  };

  const handleAskAdvisor = async () => {
    if (!advisorQuery.trim() || isAdvisorLoading) return;
    const q = advisorQuery; setAdvisorQuery(''); setAdvisorLog(p => [...p, { role: 'user', content: q }]);
    setIsAdvisorLoading(true);
    try {
      const res = await axios.post(`/api/policy-advisor`, { query: q });
      setAdvisorLog(p => [...p, { role: 'assistant', content: res.data.report }]);
    } catch { setAdvisorLog(p => [...p, { role: 'assistant', content: "⚠️ Policy server connection failure." }]); }
    setIsAdvisorLoading(false);
  };

  const handleDemolish = () => {
    if (!selectedBuilding) return;
    setDemolishedId(selectedBuilding.id);
    setImpactData({ 
      households: Math.floor(Math.random() * 150) + 20, 
      traffic: `+${Math.floor(Math.random() * 15) + 5} mins`, 
      utilitiesCut: ['Power Grid', 'Water Main'], 
      commuteAgents: Math.floor(Math.random() * 50),
      scorePenalty: { economic: -5, social: -10, environmental: -2 }
    });
  };

  const openStreetView = () => selectedBuilding && window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedBuilding.lngLat.lat},${selectedBuilding.lngLat.lng}`, '_blank');
  
  const onDragStart = (e, type) => e.dataTransfer.setData('assetType', type);
  const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('assetType');
    if (!ASSET_TEMPLATES[type]) return;
    const rect = mapContainer.current.getBoundingClientRect();
    const lngLat = map.current.unproject([e.clientX - rect.left, e.clientY - rect.top]);
    setPlacedAssets(prev => [...prev, { id: Date.now(), type, lngLat, ...ASSET_TEMPLATES[type] }]);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };



  return (
    <div className="app-root" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <div ref={mapContainer} className="map-viewport" />
      {graphicsReady && glContext && (
        <div className="deck-overlay">
          <DeckGL 
            viewState={viewState} 
            gl={glContext}
            onWebGLInitialized={onWebGLInitialized}
            layers={[agentLayer, tripsLayer, failureLayer, sentimentLayer].filter(Boolean)} 
          />
        </div>
      )}

      <div className="search-container">
        <div className="search-box">
          <Search size={18} color="var(--accent)" />
          <input className="search-field" placeholder="Search Bengaluru Nexus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {isSearching && <Loader2 className="spin" size={16} color="var(--accent)" />}
        </div>
      </div>

      {/* IDENTITY OVERLAY (Top Left) */}
      <div className="side-panel" style={{ bottom: 'auto', width: 'auto', top: '1.5rem', left: '1.5rem', zIndex: 200 }}>
        <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(15,23,42,0.9)' }}>
          <ShieldAlert size={24} color="var(--accent)" />
          <div className="header-text">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800 }}>ADMIN NEXUS</h2>
            <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>CMD_ROOT_ACCESS</span>
          </div>
        </div>
      </div>

      {/* MODULAR FEATURE OVERLAYS (Dedicated Scrollable Pages) */}
      {activeTab && (
        <div className="feature-overlay">
          <div className="overlay-widget">
            <div className="overlay-header">
              <h3 style={{ fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--accent)' }}>{activeTab.toUpperCase()} MODULE</h3>
              <button className="close-overlay" onClick={() => setActiveTab(null)}><X size={14} /></button>
            </div>

            <div className="scroll-area">
              {activeTab === 'impact' && (
                <div className="control-group">
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Simulate structural integrity failures and urban decay patterns across selected districts.
                  </p>
                  <button className={`action-btn ${isDemolishMode ? 'active' : ''}`} onClick={() => setIsDemolishMode(!isDemolishMode)}>
                    {isDemolishMode ? 'HALT SIMULATION' : 'INITIALIZE IMPACT'}
                  </button>
                  <div className="widget" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                    <span className="section-label">CITY SCORECARD</span>
                    {Object.entries(scorecard).map(([k, v]) => (
                      <div key={k} className="score-item" style={{ marginTop: '0.75rem' }}>
                        <div className="score-label" style={{ fontSize: '0.65rem' }}>
                          <span>{k.toUpperCase()}</span>
                          <span>{v}%</span>
                        </div>
                        <div className="score-bar" style={{ height: '4px' }}>
                          <div className={`fill ${k === 'environmental' ? 'green' : k === 'social' ? 'blue' : 'yellow'}`} style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'predict' && (
                <div className="control-group">
                  <label className="section-label">STORM INTENSITY: {stormIntensity}</label>
                  <input type="range" min="1" max="10" value={stormIntensity} onChange={e => setStormIntensity(Number(e.target.value))} className="flood-slider" />
                  <button className="action-btn" onClick={handlePredictFailures} style={{ marginTop: '1.5rem' }}>
                    {isPredicting ? <Loader2 className="spin" size={16} /> : 'RUN PROJECTION'}
                  </button>
                </div>
              )}

              {activeTab === 'advisor' && (
                <div className="advisor-panel">
                  <div className="advisor-chat" style={{ height: '300px', overflowY: 'auto', marginBottom: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                    {advisorLog.map((m, i) => (
                      <div key={i} style={{ marginBottom: '1rem', fontSize: '0.75rem', color: m.role === 'ai' ? 'var(--accent)' : '#fff' }}>
                        <strong>{m.role === 'ai' ? 'NEXUS' : 'ADMIN'}:</strong> {m.content}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="chat-field" value={advisorQuery} onChange={e => setAdvisorQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()} placeholder="Request directive..." style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff', fontSize: '0.75rem' }} />
                    <button className="action-btn" onClick={handleAskAdvisor} style={{ width: '40px', padding: 0 }}><Send size={14} /></button>
                  </div>
                </div>
              )}

              {activeTab === 'builder' && (
                <div className="builder-panel">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {Object.entries(ASSET_TEMPLATES).map(([name, asset]) => (
                      <div key={name} className={`asset-card widget ${assetToPlace === name ? 'active' : ''}`} onClick={() => setAssetToPlace(name)} style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', border: assetToPlace === name ? '1px solid var(--accent)' : '1px solid transparent' }}>
                        <div style={{ marginBottom: '0.5rem' }}>{asset.icon}</div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{name}</span>
                      </div>
                    ))}
                  </div>
                  {placedAssets.length > 0 && (
                    <div className="construction-log">
                      <span className="section-label">ACTIVE PROJECTS ({placedAssets.length})</span>
                      {placedAssets.map(asset => (
                        <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                          <span>{asset.type}</span>
                          <button onClick={() => setPlacedAssets(prev => prev.filter(a => a.id !== asset.id))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 800 }}>DEMOLISH</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'crisis' && (
                <div className="control-group">
                  <label className="section-label">FLOOD MODEL: {floodLevel}M</label>
                  <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" />
                  <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button className={`tab-btn ${showHydrants ? 'active' : ''}`} onClick={() => setShowHydrants(!showHydrants)}>HYDRANTS</button>
                    <button className={`tab-btn ${isEmergencyActive ? 'active' : ''}`} onClick={() => setIsEmergencyActive(!isEmergencyActive)}>EMS HUB</button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="social-panel">
                  <button className="action-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading} style={{ marginBottom: '1rem' }}>
                    {isSentimentLoading ? <Loader2 className="spin" size={16} /> : 'FETCH SENTIMENT'}
                  </button>
                  <button className="action-btn" onClick={() => setShowReportingHint(true)}>REPORT ISSUE</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCK (Matching Screenshot Design) */}
      <div className="bottom-dock">
        <div className="dock-section">
          {[
            { id: 'impact', icon: Zap, label: 'IMPACT' },
            { id: 'predict', icon: Activity, label: 'PREDICT' },
            { id: 'advisor', icon: Bot, label: 'ADVISOR' },
            { id: 'builder', icon: Navigation, label: 'BUILDER' },
            { id: 'crisis', icon: ShieldAlert, label: 'CRISIS' },
            { id: 'social', icon: Globe, label: 'SOCIAL' }
          ].map(t => (
            <button key={t.id} className={`dock-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(activeTab === t.id ? null : t.id)}>
              <t.icon size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="dock-section">
          <button className={`dock-btn ${showGodMode ? 'active' : ''}`} onClick={() => setShowGodMode(!showGodMode)}>
            <Settings2 size={18} /><span>GOD MODE</span>
          </button>
          <button className={`dock-btn ${isXrayEnabled ? 'active' : ''}`} onClick={() => setIsXrayEnabled(!isXrayEnabled)}>
            <Eye size={18} /><span>X-RAY</span>
          </button>
          <button className="dock-btn" onClick={() => {
              const styles = ['satellite', 'hybrid', 'streets'];
              const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
              setCurrentStyle(styles[nextIndex]);
            }}>
            <Layers size={18} /><span>{currentStyle.toUpperCase()}</span>
          </button>
          <button className="dock-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={18} /><span>EXIT</span>
          </button>
        </div>
      </div>

      {showGodMode && (
        <div className="feature-overlay secondary" style={{ left: 'auto', right: '1.5rem', top: '1.5rem', width: '300px' }}>
          <div className="overlay-widget">
            <h3 style={{ fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>COMMAND OVERRIDE</h3>
            <div className="toggle-row">
              <span>GLOBAL GRID LOCK</span>
              <button className={`toggle-sm ${isGridLocked ? 'on' : ''}`} onClick={() => setIsGridLocked(!isGridLocked)} />
            </div>
            <div className="toggle-row" style={{ marginTop: '1rem' }}>
              <span>ATMOSPHERIC RAIN</span>
              <button className={`toggle-sm ${isRainy ? 'on' : ''}`} onClick={() => setIsRainy(!isRainy)} />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label className="section-label">SMOG DENSITY</label>
              <input type="range" min="0" max="0.8" step="0.1" value={smogLevel} onChange={e => setSmogLevel(Number(e.target.value))} className="flood-slider" />
            </div>
            <button className="action-btn" onClick={() => setShowGodMode(false)} style={{ marginTop: '2rem' }}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
