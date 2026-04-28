'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Search, Loader2, Building2, Trash2, AlertTriangle, X, MapPin, 
  Layers, Navigation, Wind, Leaf, History, Eye, Map as MapIcon, 
  MessageSquare, Camera, Droplets, Zap, Flame, Terminal, ShieldAlert,
  BarChart3, Globe, Activity, Bot, Send, LogOut, CloudRain, Sun, 
  Settings2, Download, Database
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { useRouter } from 'next/navigation';

// API endpoints will be proxied via next.config.mjs or served relatively in production

// --- ANIMATION VARIANTS ---
const panelVariants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// --- STATIC DATA ---
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

// --- ABM CONFIG ---
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
  
  // --- STATE ---
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

  useEffect(() => {
    setIsCollapsed(window.innerWidth < 768);
  }, []);
  
  // Vision Features State
  const [floodLevel, setFloodLevel] = useState(0);
  const [timelineYear, setTimelineYear] = useState(2024);
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showHydrants, setShowHydrants] = useState(false);
  
  // Simulation State
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [reports, setReports] = useState([]);
  const [showReportingHint, setShowReportingHint] = useState(false);

  // Sims Mode State
  const [placedAssets, setPlacedAssets] = useState([]);
  const [scorecard, setScorecard] = useState({ economic: 65, social: 70, environmental: 55 });

  const ASSET_TEMPLATES = {
    'Skyscraper': { height: 60, color: '#3c4043', impacts: { economic: 15, social: 5, environmental: -10 }, icon: <Building2 size={24}/> },
    'Urban Park': { height: 2, color: '#00ff9d', impacts: { economic: -5, social: 15, environmental: 25 }, icon: <Leaf size={24}/> },
    'Medical Center': { height: 25, color: '#00f2ff', impacts: { economic: 10, social: 25, environmental: -2 }, icon: <Activity size={24}/> },
    'Solar Plant': { height: 5, color: '#ffcc00', impacts: { economic: 12, social: 2, environmental: 35 }, icon: <Zap size={24}/> }
  };

  // Advanced Analytics State
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [stormIntensity, setStormIntensity] = useState(5);
  const [predictiveData, setPredictiveData] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Atmospheric & God Mode State
  const [isRainy, setIsRainy] = useState(false);
  const [smogLevel, setSmogLevel] = useState(0.1);
  const [isGridLocked, setIsGridLocked] = useState(false);
  const [showGodMode, setShowGodMode] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGraphicsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716,
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
          { id: 'background', type: 'background', paint: { 'background-color': '#0f172a' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite' },
          {
            id: 'infra-layer',
            type: 'line',
            source: 'infrastructure',
            paint: {
              'line-width': ['match', ['get', 'type'], 'flyover', 5, 'metro', 4, 2],
              'line-color': ['match', ['get', 'type'], 'flyover', '#ffb100', 'metro', '#00ff9d', '#607d8b'],
              'line-opacity': 0.8
            }
          },
          {
            id: 'utility-pipes',
            type: 'line',
            source: 'utilities',
            paint: {
              'line-width': 4,
              'line-color': ['match', ['get', 'type'], 'WaterPipe', '#00bcd4', 'ElectricityLine', '#ffeb3b', 'GasLine', '#ff5722', '#ffffff'],
              'line-opacity': 0 
            }
          },
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': ['case', ['has', 'height'], '#2a2d35', '#1a1d25'],
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 10],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.8
            }
          },
          {
            id: 'aqi-heat',
            type: 'heatmap',
            source: 'aqi-source',
            layout: { 'visibility': 'none' },
            paint: {
              'heatmap-weight': ['get', 'aqi'],
              'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,255,157,0)', 0.5, 'yellow', 1, 'red']
            }
          },
          {
            id: 'hydrant-layer',
            type: 'circle',
            source: 'hydrants',
            layout: { 'visibility': 'none' },
            paint: { 'circle-radius': 8, 'circle-color': '#ff9800', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
          },
          {
            id: 'emergency-route',
            type: 'line',
            source: 'emergency-path',
            layout: { 'visibility': 'none' },
            paint: { 'line-color': '#00ff9d', 'line-width': 6, 'line-dasharray': [2, 1] }
          },
          {
            id: 'blast-radius',
            type: 'circle',
            source: 'blast-circle',
            paint: { 'circle-radius': 100, 'circle-color': '#ff3b3b', 'circle-opacity': 0.2, 'circle-stroke-width': 2, 'circle-stroke-color': '#ff3b3b' }
          },
          {
            id: 'sims-buildings',
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
      center: [77.5946, 12.9716],
      zoom: 15,
      pitch: 55,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
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
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['3d-buildings'] });
        if (features.length === 0 && !showReportingHint) {
          setSelectedBuilding(null);
          setImpactData(null);
        }
        if (showReportingHint) {
          const newReport = { id: Date.now(), lngLat: e.lngLat, type: 'issue' };
          setReports(prev => [...prev, newReport]);
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

    const failSafe = setTimeout(() => {
      setMapLoaded(true);
    }, 5000);

    map.current.on('error', () => setMapLoaded(true));

    return () => {
      clearTimeout(failSafe);
      map.current?.remove();
    };
  }, []);

  // Simulation Engine
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
        
        // Maintain a short history for trails (max 25 points)
        const newPath = [...path, { pos, time: Date.now() / 1000 }].slice(-25);

        return { ...a, pos, progress, state, path: newPath };
      }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [demolishedId, selectedBuilding]);

  const agentLayer = new ScatterplotLayer({
    id: 'agent-layer',
    data: agents,
    getPosition: d => d.pos,
    getFillColor: d => [255, 204, 0],
    getRadius: 10,
    opacity: 1,
    updateTriggers: { getPosition: [time] }
  });

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [255, 204, 0],
    opacity: 0.8,
    widthMinPixels: 3,
    rounded: true,
    trailLength: 15,
    currentTime: Date.now() / 1000,
    fadeTrail: true
  });

  const failureLayer = predictiveData ? new ScatterplotLayer({
    id: 'failure-layer',
    data: predictiveData.points,
    getPosition: d => d.coordinates,
    getFillColor: [255, 61, 113, 200],
    getRadius: d => 40 + d.riskLevel * 60,
    stroked: true,
    lineWidthMinPixels: 2,
    getLineColor: [255, 255, 255]
  }) : null;

  const sentimentLayer = sentimentEnabled && sentimentData ? new HeatmapLayer({
    id: 'sentiment-heatmap',
    data: sentimentData.points,
    getPosition: d => d.coordinates,
    getWeight: d => Math.abs(d.sentiment) * d.intensity,
    colorRange: [[255, 61, 113], [255, 204, 0], [0, 255, 157]],
    threshold: 0.05,
    radiusPixels: 70,
    opacity: 0.6
  }) : null;

  // Sync Map Features
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const isSat = currentStyle === 'satellite';
    map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('street-tiles', 'visibility', !isSat ? 'visible' : 'none');
    map.current.setPaintProperty(isSat ? 'satellite-tiles' : 'street-tiles', 'raster-opacity', isXrayEnabled ? 0.2 : 1);
    map.current.setPaintProperty('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    map.current.setLayoutProperty('aqi-heat', 'visibility', aqiEnabled ? 'visible' : 'none');
    map.current.setLayoutProperty('hydrant-layer', 'visibility', showHydrants ? 'visible' : 'none');
    map.current.setLayoutProperty('emergency-route', 'visibility', isEmergencyActive ? 'visible' : 'none');
    
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['==', ['get', 'id'], selectedBuilding?.id], '#00f2ff',
      ['<', ['%', ['get', 'id'], 15], Number(floodLevel)], '#0061ff',
      isGridLocked ? '#050608' : (currentStyle === 'satellite' ? '#2a2d35' : '#e0e0e0')
    ]);
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', [
      'case',
      ['==', ['get', 'id'], demolishedId], 0,
      isGridLocked ? 0.9 : (greenEnabled ? 0.3 : 0.8)
    ]);
  }, [isXrayEnabled, currentStyle, mapLoaded, aqiEnabled, selectedBuilding, demolishedId, greenEnabled, floodLevel, showHydrants, isEmergencyActive, isGridLocked]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('placed-assets');
    if (source) source.setData({ type: 'FeatureCollection', features: placedAssets.map(a => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [a.lngLat.lng, a.lngLat.lat] }, properties: { ...a } })) });
    
    const newScore = placedAssets.reduce((acc, a) => ({ economic: acc.economic + a.impacts.economic, social: acc.social + a.impacts.social, environmental: acc.environmental + a.impacts.environmental }), { economic: 65, social: 70, environmental: 55 });
    
    if (demolishedId) {
      newScore.economic -= 5;
      newScore.social -= 10;
      newScore.environmental -= 2;
    }

    setScorecard({ economic: Math.min(100, Math.max(0, newScore.economic)), social: Math.min(100, Math.max(0, newScore.social)), environmental: Math.min(100, Math.max(0, newScore.environmental)) });
  }, [placedAssets, demolishedId]);

  // Handlers
  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [res.data[0].lon, res.data[0].lat], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
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

  const handleAskAdvisor = async () => {
    if (!chatQuery.trim() || isChatLoading) return;
    const q = chatQuery; setChatQuery(''); setChatHistory(p => [...p, { role: 'user', content: q }]);
    setIsChatLoading(true);
    try {
      const res = await axios.post(`/api/policy-advisor`, { query: q });
      setChatHistory(p => [...p, { role: 'assistant', content: res.data.report }]);
    } catch { setChatHistory(p => [...p, { role: 'assistant', content: "⚠️ System Offline: Cognitive Hub connection failure." }]); }
    setIsChatLoading(false);
  };

  const handlePredictFailures = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.post(`/api/predict-failures`, { stormIntensity });
      setPredictiveData(res.data);
      if (res.data.points.length) map.current.flyTo({ center: res.data.points[0].coordinates, zoom: 15, pitch: 60 });
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

  const handleLogout = () => { 
    localStorage.clear(); 
    setReports(prev => [...prev, { id: Date.now(), type: 'system', content: 'SESSION_TERMINATED: Returning to Hub' }]);
    setTimeout(() => router.push('/portal'), 500);
  };

  const handleExportStrategy = () => {
    setReports(prev => [...prev, { id: Date.now(), type: 'directive', content: 'URBAN STRATEGY DIRECTIVE EXPORTED' }]);
    alert("Urban Strategy Directive v4.0 generated. Syncing with Municipal Data Hub...");
  };

  return (
    <div className="app-root" onDrop={onDrop} onDragOver={(e) => e.preventDefault()} style={{ '--smog-opacity': smogLevel }}>
      {/* ATMOSPHERIC ENGINE */}
      <div className={`atm-overlay atm-smog`} />
      <div className={`atm-overlay atm-rain`} style={{ display: isRainy ? 'block' : 'none' }} />
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="preloader">
            <div className="preloader-content">
              <div className="loader-ring" />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700, color: 'var(--accent)' }}>ADMIN COMMAND CORE</h3>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>BENGALURU NEXUS v4.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mapContainer} className="map-viewport" />
      {graphicsReady && (
        <div className="deck-overlay">
          <DeckGL viewState={viewState} layers={[agentLayer, tripsLayer, failureLayer, sentimentLayer].filter(Boolean)} />
        </div>
      )}

      {/* ADMIN STATUS TICKER */}
      <div className="status-ticker glass-panel" style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '30px', background: 'rgba(0,0,0,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', padding: '0 2rem', overflow: 'hidden' }}>
        <div className="ticker-content" style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap', animation: 'ticker 30s linear infinite', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '2px' }}>
          <span>SYSTEM ONLINE: BENGALURU NEXUS CORE v4.0.2</span>
          <span>ACTIVE AGENTS: {agents.length}</span>
          <span>GRID LOAD: {isGridLocked ? '100.0% [LOCKED]' : '74.2%'}</span>
          <span>SATELLITE SYNC: ACTIVE (ST-7)</span>
          <span>SIMULATION DELTA: +0.002ms</span>
          <span>NEXUS ADVISOR: STANDBY</span>
          <span>EMERGENCY CHANNELS: CLEAR</span>
        </div>
      </div>

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="search-container">
        <div className="search-box glass-panel">
          <Search size={22} color="var(--accent)" />
          <input className="search-field" placeholder="Search Bengaluru Nexus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {isSearching && <Loader2 className="spin" size={20} color="var(--accent)" />}
        </div>
      </motion.div>

      <motion.div 
        variants={panelVariants} 
        initial="hidden" 
        animate={mapLoaded ? "visible" : "hidden"} 
        className={`side-panel glass-panel ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="mobile-toggle" onClick={() => setIsCollapsed(!isCollapsed)} />
        <div className="panel-header" onClick={() => { setSelectedBuilding(null); if(window.innerWidth < 768) setIsCollapsed(true); }}>
          <div className="header-icon-wrap">
            <ShieldAlert size={42} className="icon-main" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="header-text">
            <h2 style={{ fontSize: '1.4rem', letterSpacing: '2px' }}>ADMIN NEXUS</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="status-dot online" />
              <span style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 900 }}>CMD_ROOT_ACCESS</span>
            </div>
          </div>
        </div>

        {/* TRIPLE WIN OMNI-HUD */}
        <div className="scorecard glass-panel" style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)' }}>
          <span className="section-label" style={{ fontSize: '0.65rem' }}>CITY PERFORMANCE INDEX</span>
          {Object.entries(scorecard).map(([k, v]) => (
            <div key={k} className="score-item" style={{ marginBottom: '1rem' }}>
              <div className="score-label" style={{ fontSize: '0.7rem' }}>
                <span>{k.toUpperCase()}</span>
                <span style={{ color: v > 70 ? 'var(--success)' : v > 40 ? 'var(--warning)' : 'var(--danger)' }}>{v}%</span>
              </div>
              <div className="score-bar" style={{ height: '6px' }}>
                <div className={`fill ${k === 'environmental' ? 'green' : k === 'social' ? 'blue' : 'yellow'}`} style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel-tabs">
          {[
            { id: 'missions', icon: Zap, label: 'Impact' },
            { id: 'energy', icon: Activity, label: 'Predict' },
            { id: 'advisor', icon: Bot, label: 'Advisor' },
            { id: 'sims', icon: Navigation, label: 'Sims' },
            { id: 'crisis', icon: ShieldAlert, label: 'Crisis' },
            { id: 'social', icon: Globe, label: 'Social' }
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={22} /><span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="scroll-area">
          <AnimatePresence mode="wait">
            <div className="panel-section">
              {activeTab === 'missions' && (
                <>
                  <button className={`neo-btn ${isDemolishMode ? 'active' : ''}`} onClick={() => { setIsDemolishMode(!isDemolishMode); if (isDemolishMode) { setDemolishedId(null); setSelectedBuilding(null); setImpactData(null); } }} style={{ width: '100%', height: '60px', borderRadius: '20px', color: isDemolishMode ? '#fff' : 'var(--danger)', background: isDemolishMode ? 'var(--danger)' : 'rgba(255,61,113,0.1)' }}>
                    <Activity size={24} /><span>{isDemolishMode ? 'RESET SIMULATION' : 'SIMULATE IMPACT'}</span>
                  </button>
                  {selectedBuilding && (
                    <div className="building-detail glass-panel">
                      <div className="detail-row"><MapPin size={24} color="var(--danger)" /><strong>{selectedBuilding.name}</strong></div>
                      <div className="stat-item"><small>ELEVATION</small><span>{selectedBuilding.height}M</span></div>
                      
                      {/* MINI DATA VIZ */}
                      <div className="mini-chart">
                        {[40, 70, 45, 90, 65, 85].map((h, i) => (
                          <div key={i} className={`chart-bar ${h > 70 ? 'active' : ''}`} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>INFRASTRUCTURE STRESS VECTORS</p>

                      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="stat-item"><small>SOLAR POTENTIAL</small><span style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>{(selectedBuilding.height * 4.8).toFixed(1)} kWh/d</span></div>
                        <div className="stat-item"><small>CARBON INTENSITY</small><span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{(selectedBuilding.height * 0.12).toFixed(2)} t/mo</span></div>
                      </div>
                      <div className="action-grid" style={{ marginTop: '1.5rem' }}>
                        <button className="neo-btn" onClick={openStreetView} style={{ background: 'rgba(255,255,255,0.05)' }}><Camera size={16}/> VIEW</button>
                        {isDemolishMode && <button className="neo-btn" onClick={handleDemolish} style={{ background: 'var(--danger)', color: '#fff' }}>AUDIT</button>}
                      </div>
                    </div>
                  )}
                  {impactData && (
                    <div className="impact-report">
                      <span className="section-label">AUDIT RESULTS</span>
                      <div className="report-item">Affected Nodes: <strong>{impactData.commuteAgents}</strong></div>
                      <div className="report-item yellow" style={{ marginTop: '0.5rem' }}>Traffic Delay: <strong>{impactData.traffic}</strong></div>
                      
                      <div className="penalty-box" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,61,113,0.1)', borderRadius: '12px', border: '1px solid rgba(255,61,113,0.2)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 800, letterSpacing: '1px' }}>GLOBAL INDEX IMPACT</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem' }}>Economic</span>
                          <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{impactData.scorePenalty.economic}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem' }}>Social</span>
                          <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{impactData.scorePenalty.social}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'energy' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <label className="section-label">STORM INTENSITY: {stormIntensity}</label>
                  <input type="range" min="1" max="10" value={stormIntensity} onChange={e => setStormIntensity(Number(e.target.value))} className="flood-slider" />
                  <button className="neo-btn" onClick={handlePredictFailures} disabled={isPredicting} style={{ width: '100%', height: '55px', background: 'var(--accent)', color: 'var(--bg-deep)', marginTop: '1.5rem', borderRadius: '15px' }}>
                    {isPredicting ? <Loader2 className="spin" size={24} /> : <BarChart3 size={24} />}<span>RUN PROJECTION</span>
                  </button>
                </div>
              )}

              {activeTab === 'advisor' && (
                <div className="chat-container">
                  <div className="chat-history scroll-area">
                    {chatHistory.map((m, i) => <div key={i} className={`chat-bubble ${m.role}`}>{m.content}</div>)}
                    {isChatLoading && <div className="chat-bubble assistant">... processing policy vectors ...</div>}
                  </div>
                  <div className="chat-input-wrap">
                    <input className="chat-field" placeholder="Ask Nexus Advisor..." value={chatQuery} onChange={e => setChatQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()} />
                    <button className="send-btn neo-btn" onClick={handleAskAdvisor} style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}><Send size={20} /></button>
                  </div>
                </div>
              )}

              {activeTab === 'sims' && (
                <div className="sims-panel">
                  <div className="scorecard glass-panel">
                    <span className="section-label">ASSET DEPLOYMENT UNIT</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Drag and drop infrastructure assets onto the map to rebalance city metrics in real-time.</p>
                  </div>
                  <div className="asset-grid">
                    {Object.entries(ASSET_TEMPLATES).map(([n, t]) => (
                      <div key={n} className="asset-card neo-btn" draggable onDragStart={e => onDragStart(e, n)}>
                        <div className="icon-main">{t.icon}</div>
                        <span className="asset-name">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'crisis' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <label className="section-label">FLOOD MODEL: {floodLevel}M</label>
                  <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" />
                  <div className="action-grid" style={{ marginTop: '1.5rem' }}>
                    <button className={`neo-btn ${showHydrants ? 'active' : ''}`} onClick={() => setShowHydrants(!showHydrants)}>HYDRANTS</button>
                    <button className={`neo-btn ${isEmergencyActive ? 'active' : ''}`} onClick={() => setIsEmergencyActive(!isEmergencyActive)}>EMS HUB</button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="social-panel">
                  <button className="neo-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading} style={{ width: '100%', height: '55px', marginBottom: '1.5rem' }}>
                    {isSentimentLoading ? <Loader2 className="spin" size={24} /> : <Globe size={24} />}<span>FETCH SENTIMENT</span>
                  </button>
                  <button className="neo-btn" onClick={() => setShowReportingHint(true)} style={{ width: '100%', height: '55px' }}>
                    <MessageSquare size={24} /><span>LOG REPORT</span>
                  </button>
                  {showReportingHint && <div className="pulse-text" style={{ marginTop: '1rem' }}>MAP TARGETING ACTIVE</div>}
                </div>
              )}
            </div>
        </div>

        <div className="activity-log glass-panel" style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(0,0,0,0.4)', borderRadius: '15px' }}>
          <span className="section-label" style={{ fontSize: '0.6rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={14} /> NEXUS ACTIVITY LOG
          </span>
          <div className="log-entries" style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(0,242,255,0.7)' }}>
            <div className="log-entry">[{new Date().toLocaleTimeString()}] Authenticated as Master Admin</div>
            <div className="log-entry">[{new Date().toLocaleTimeString()}] Fetching Bengaluru Building Mesh...</div>
            <div className="log-entry">[{new Date().toLocaleTimeString()}] ABM Simulation Engine Initialized</div>
            {isRainy && <div className="log-entry" style={{ color: 'var(--accent)' }}>[{new Date().toLocaleTimeString()}] ATMOS: PRECIPITATION DETECTED - TRAFFIC FLOW -40%</div>}
            {isGridLocked && <div className="log-entry" style={{ color: 'var(--danger)' }}>[{new Date().toLocaleTimeString()}] CRITICAL: GLOBAL GRID LOCKOUT ACTIVATED</div>}
            {demolishedId && <div className="log-entry" style={{ color: 'var(--danger)' }}>[{new Date().toLocaleTimeString()}] CRITICAL: NODE_{demolishedId} DISCONNECTED</div>}
            {isEmergencyActive && <div className="log-entry" style={{ color: 'var(--warning)' }}>[{new Date().toLocaleTimeString()}] ALERT: EMERGENCY HUB ACTIVE</div>}
          </div>
        </div>

        <div className="panel-footer" style={{ marginTop: 'auto', paddingTop: '2rem' }}>ADMIN BENGALURU NEXUS | v4.0.2</div>
      </div>

      <div className="view-actions">
        <button className={`view-btn neo-btn ${showGodMode ? 'active' : ''}`} onClick={() => setShowGodMode(!showGodMode)}>
          <Settings2 size={24} /><span>GOD MODE</span>
        </button>
        <button className={`view-btn neo-btn ${isXrayEnabled ? 'active' : ''}`} onClick={() => setIsXrayEnabled(!isXrayEnabled)}>
          <Eye size={24} /><span>X-RAY</span>
        </button>
        <button className={`view-btn neo-btn ${currentStyle === 'satellite' ? 'active' : ''}`} onClick={() => setCurrentStyle(currentStyle === 'satellite' ? 'streets' : 'satellite')}>
          <Layers size={24} /><span>STYLE</span>
        </button>
        <button className="view-btn neo-btn" onClick={handleExportStrategy} style={{ color: 'var(--success)' }}>
          <Download size={24} /><span>EXPORT</span>
        </button>
        <button className="view-btn neo-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={24} /><span>EXIT</span>
        </button>
      </div>

        {showGodMode && (
          <div className="side-panel glass-panel secondary" style={{ right: '1rem', left: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', letterSpacing: '2px' }}>COMMAND OVERRIDE</h3>
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
            <button className="action-btn" onClick={() => setShowGodMode(false)} style={{ width: '100%', marginTop: '2rem' }}>CLOSE INTERFACE</button>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;
