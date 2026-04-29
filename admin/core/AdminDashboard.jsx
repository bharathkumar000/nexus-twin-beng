'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ScatterplotLayer, ColumnLayer, LineLayer, PolygonLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';

// SHARED
import MapLayout from '../../shared/components/MapLayout';
import { updateAgents } from '../../shared/utils/simulation';
import { generateAgents } from '../../shared/utils/agentGenerator';

// ADMIN SPECIFIC
import AdminSidebar from '../components/AdminSidebar';
import AdminDock from '../components/AdminDock';
import PublicRequestDossier from '../components/PublicRequestDossier';
import ScenarioBattle from '../components/ScenarioBattle';
import UrbanHUD from '../components/UrbanHUD';
import { ASSET_TEMPLATES } from '../utils/constants';

const AdminDashboard = () => {
  const router = useRouter();
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);

  // States
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [activeSmartZones, setActiveSmartZones] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [isRainy, setIsRainy] = useState(false);
  const [floodLevel, setFloodLevel] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState('present');
  const [activePriority, setActivePriority] = useState('balanced');
  const [globalConfidence, setGlobalConfidence] = useState(82);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [advisorLog, setAdvisorLog] = useState([{ role: 'ai', content: 'SYSTEM_READY. Awaiting directives.' }]);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [policyForm, setPolicyForm] = useState({ title: '', location: '', budget: '', duration: '', impactUnderground: '', impactTraffic: '', outcome: '', lngLat: null });
  const [aiPolicyScore, setAiPolicyScore] = useState(null);
  const [isAnalyzingPolicy, setIsAnalyzingPolicy] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [policyLocationPicking, setPolicyLocationPicking] = useState(false);
  const [policyPdfFile, setPolicyPdfFile] = useState(null);
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const locationSearchTimeout = useRef(null);
  const [assetToPlace, setAssetToPlace] = useState(null);
  const [placedAssets, setPlacedAssets] = useState([]);
  const [publicRequests, setPublicRequests] = useState([
    { id: 1, type: 'Pothole', location: 'MG Road', severity: 'High', status: 'Pending', lngLat: { lng: 77.60, lat: 12.97 }, description: 'Large crater near the metro pillar causing severe traffic slowdowns and hazard for two-wheelers.', reporter: '@akash_blr', timestamp: '10 mins ago' },
    { id: 2, type: 'Traffic Light Failure', location: 'Indiranagar', severity: 'Medium', status: 'Pending', lngLat: { lng: 77.64, lat: 12.98 }, description: 'All signals flashing yellow at the 100ft road junction. Major gridlock forming.', reporter: '@traffic_watcher', timestamp: '22 mins ago' }
  ]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [isDemolishMode, setIsDemolishMode] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [selectedGridCell, setSelectedGridCell] = useState(null);

  const [viewState, setViewState] = useState({
    longitude: 77.5912, latitude: 12.9797, zoom: 14, pitch: 55, bearing: 0
  });

  // GAME ENGINE STATE
  const [cityStats, setCityStats] = useState({ prosperity: 1250, happiness: 72, population: 45000, level: 12 });
  const [lastActionImpact, setLastActionImpact] = useState(null);
  const impactTimeout = useRef(null);

  const triggerImpactReport = (actionData) => {
    if (impactTimeout.current) clearTimeout(impactTimeout.current);
    setLastActionImpact(actionData);
    impactTimeout.current = setTimeout(() => setLastActionImpact(null), 5000);
  };

  const handleBuildingGameAction = (building, actionType) => {
    let prosperityChange = 0;
    let happinessChange = 0;
    let impactText = "";
    let scoreBonus = 0;

    if (actionType === 'DEMOLISH') {
      prosperityChange = -50;
      happinessChange = -10;
      impactText = `Demolished ${building.name}. Citizen displacement detected. Utility grid temporarily unstable.`;
      scoreBonus = -100;
    } else {
      // Action Type is likely an asset name like 'education'
      const assetName = actionType.toUpperCase();
      if (assetName.includes('EDUCATION')) {
        prosperityChange = 120;
        happinessChange = 15;
        impactText = `New Education Hub established at ${building.name}. Literacy projections +4.2%. Future ROI surge detected.`;
        scoreBonus = 500;
      } else if (assetName.includes('MEDICAL')) {
        prosperityChange = 80;
        happinessChange = 25;
        impactText = `Medical Facility integrated. Emergency response time reduced in this sector.`;
        scoreBonus = 400;
      } else if (assetName.includes('SMART')) {
        prosperityChange = 200;
        happinessChange = 5;
        impactText = `Node upgraded to SMART_BUILDING. Energy efficiency +30%.`;
        scoreBonus = 600;
      } else {
        prosperityChange = 40;
        happinessChange = 2;
        impactText = `Infrastructure updated: ${assetName}. Standard urban growth metrics maintained.`;
        scoreBonus = 150;
      }
    }

    setCityStats(prev => ({
      ...prev,
      prosperity: prev.prosperity + prosperityChange,
      happiness: Math.min(100, Math.max(0, prev.happiness + happinessChange)),
      population: prev.population + (prosperityChange > 0 ? 120 : -50)
    }));

    triggerImpactReport({
      type: actionType,
      building: building.name,
      score: scoreBonus,
      prosperity: prosperityChange,
      happiness: happinessChange,
      text: impactText,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    if (activeCategory) setIsSidebarCollapsed(false);
  }, [activeCategory]);

  const onWebGLInitialized = (gl) => { setGlContext(gl); setGraphicsReady(true); };

  useEffect(() => {
    // Throttle agent logic to 10 FPS to prevent crushing React's render loop
    const timerId = setInterval(() => {
      setAgents(prev => updateAgents(prev, { isRainy, placedAssets }));
      setTime(t => t + 1);
    }, 100);
    return () => clearInterval(timerId);
  }, [isRainy, placedAssets]);

  const generateGrid = () => {
    const cells = [];
    const step = 0.0005; // ~50m cells
    const range = 30; // Increased range for better coverage
    
    // Static anchoring: Round to the nearest 0.01 to create a "stable" local origin
    // This prevents the grid from "following" the camera center every frame
    const anchorLng = Math.floor(viewState.longitude / 0.01) * 0.01;
    const anchorLat = Math.floor(viewState.latitude / 0.01) * 0.01;

    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        const lng = anchorLng + x * step;
        const lat = anchorLat + y * step;
        cells.push({
          id: `${lng.toFixed(5)},${lat.toFixed(5)}`,
          lngLat: { lng, lat },
          polygon: [
            [lng, lat],
            [lng + step, lat],
            [lng + step, lat + step],
            [lng, lat + step],
            [lng, lat]
          ]
        });
      }
    }
    return cells;
  };

  const flyTo = (lngLat) => {
    setViewState(prev => ({
      ...prev,
      longitude: lngLat.lng,
      latitude: lngLat.lat,
      zoom: 17,
      pitch: 60,
      transitionDuration: 2000
    }));
  };

  const layers = [
    new PolygonLayer({
      id: 'minecraft-grid-layer',
      data: generateGrid(),
      getPolygon: d => d.polygon,
      stroked: true,
      filled: true,
      getLineColor: [255, 255, 255, 50],
      getFillColor: d => selectedGridCell === d.id ? [37, 99, 235, 100] : [0, 0, 0, 0],
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: ({ object }) => {
        if (object) setSelectedGridCell(object.id);
      }
    }),
    sentimentEnabled && sentimentData ? new HeatmapLayer({
      id: 'sentiment-heatmap', 
      data: sentimentData.points, 
      getPosition: d => d.coordinates, 
      getWeight: d => d.sentiment + 1,
      radiusPixels: 70, 
      opacity: 0.6
    }) : null,
    new ColumnLayer({
      id: 'placed-assets-layer',
      data: placedAssets,
      getPosition: d => [d.lngLat.lng, d.lngLat.lat],
      getFillColor: d => d.color || [255, 255, 255],
      getElevation: d => d.height || 10,
      radius: d => d.radius || 20,
      extruded: true,
      pickable: isDemolishMode,
      elevationScale: 1,
      onClick: ({ object }) => {
        if (isDemolishMode && object) {
          setPlacedAssets(prev => prev.filter(p => p.id !== object.id));
        }
      }
    }),
    new ScatterplotLayer({
      id: 'street-light-glow',
      data: placedAssets.filter(d => d.type === 'street-light'),
      getPosition: d => [d.lngLat.lng, d.lngLat.lat],
      getFillColor: [255, 244, 0, 150],
      getRadius: 15,
      opacity: 0.8,
      pickable: false
    }),
    new ScatterplotLayer({
      id: 'public-requests-layer',
      data: publicRequests,
      getPosition: d => [d.lngLat.lng, d.lngLat.lat],
      getFillColor: d => selectedRequest && selectedRequest.id === d.id ? [59, 130, 246] : [239, 68, 68],
      getRadius: d => selectedRequest && selectedRequest.id === d.id ? 30 : 15,
      pickable: true,
      onClick: ({ object }) => {
        if (object) {
          flyTo(object.lngLat);
          setSelectedRequest(object);
        }
      }
    })
  ].filter(Boolean);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) mapRef.current.flyTo({ center: [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  const handleAiSuggest = () => {
    setAiSuggestion({ text: "CONSULTING NEXUS_OS...", action: "ANALYZING" });
    setTimeout(() => setAiSuggestion({ text: "Bypass mode active. Shift infrastructure East.", action: "RE-ROUTE" }), 1500);
  };

  const handleAskAdvisor = () => {
    if (!advisorQuery.trim()) return;
    const q = advisorQuery; setAdvisorQuery('');
    setAdvisorLog(p => [...p, { role: 'user', content: q }]);
    setTimeout(() => setAdvisorLog(p => [...p, { role: 'ai', content: "Strategic assessment complete. Location: "+policyForm.location+". Recommendation: Deploy transit hub." }]), 1000);
  };

  const handleAnalyzePolicy = async () => {
    setIsAnalyzingPolicy(true);
    setAiPolicyScore(null);
    
    // 1. If a document is attached, fetch data from it first using Ollama document parser
    if (policyPdfFile) {
      try {
        const formData = new FormData();
        formData.append('file', policyPdfFile);
        const res = await axios.post('http://localhost:3001/api/parse-policy-document', formData);
        if (res.data) {
          setPolicyForm(prev => ({
            ...prev,
            title: res.data.title !== 'N/A' ? res.data.title : prev.title,
            budget: res.data.budget !== 'N/A' ? res.data.budget : prev.budget,
            duration: res.data.duration !== 'N/A' ? res.data.duration : prev.duration,
            outcome: res.data.outcome !== 'N/A' ? res.data.outcome : prev.outcome,
            location: res.data.location !== 'N/A' ? res.data.location : prev.location
          }));
        }
      } catch (err) {
        console.warn('Document parsing failed, falling back to manual scoring.', err.message);
      }
    }

    // 2. Artificial delay for simulation effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Score based on form completeness - more fields filled = higher score
    let filled = 0;
    if (policyForm.title) filled++;
    if (policyForm.location) filled++;
    if (policyForm.budget) filled++;
    if (policyForm.duration) filled++;
    if (policyForm.impactTraffic) filled++;
    if (policyForm.impactUnderground) filled++;
    if (policyForm.outcome) filled++;
    if (policyForm.lngLat) filled++;
    if (policyPdfFile) filled++;
    
    const completeness = filled / 9;
    const base = Math.floor(completeness * 50) + 40; // 40-90 base
    const variance = Math.floor(Math.random() * 10);
    const score = Math.min(99, base + variance);
    
    setAiPolicyScore(score);
    setIsAnalyzingPolicy(false);
  };

  const handleBroadcastPolicy = async () => {
    setIsBroadcasting(true);
    try {
      // POST notification to server so users can see it
      await axios.post('http://localhost:3001/api/notifications', {
        policy: policyForm.title || 'URBAN POLICY DEPLOYMENT',
        price: policyForm.budget || 'N/A',
        location: policyForm.location || 'Bengaluru Central',
        purpose: policyForm.outcome || 'Strategic urban development initiative.',
        prediction: `AI Viability Score: ${aiPolicyScore}% — SAFE`,
        duration: policyForm.duration || 'TBD'
      });
    } catch (err) {
      console.warn('Notification POST failed (server may be offline):', err.message);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsBroadcasting(false);
    setActiveNotification({
      id: Date.now(),
      type: 'GLOBAL_DIRECTIVE',
      title: policyForm.title || 'URBAN POLICY DEPLOYMENT',
      data: policyForm,
      score: aiPolicyScore,
      timestamp: new Date().toLocaleTimeString()
    });
    setPolicyForm({ title: '', location: '', budget: '', duration: '', impactUnderground: '', impactTraffic: '', outcome: '', lngLat: null });
    setAiPolicyScore(null);
    setPolicyPdfFile(null);
    setPolicyLocationPicking(false);
    setLocationSearchResults([]);
    alert('✅ POLICY DEPLOYED! Notification sent to all citizens.');
  };

  // Location helpers for Policy Hub
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPolicyForm(prev => ({ ...prev, lngLat: { lat: latitude, lng: longitude } }));
        // Reverse geocode to get a readable name
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (res.data?.display_name) {
            setPolicyForm(prev => ({ ...prev, location: res.data.display_name.split(',').slice(0,3).join(','), lngLat: { lat: latitude, lng: longitude } }));
          }
        } catch (e) {
          setPolicyForm(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        }
        // Fly map to the location
        if (mapRef.current) mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16, pitch: 55, duration: 2000 });
      },
      (err) => alert('Location access denied: ' + err.message),
      { enableHighAccuracy: true }
    );
  };

  const handleLocationSearch = (query) => {
    if (locationSearchTimeout.current) clearTimeout(locationSearchTimeout.current);
    locationSearchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},Bengaluru,India&format=json&limit=5`);
        setLocationSearchResults(res.data || []);
      } catch (err) {
        console.error('Location search failed:', err);
        setLocationSearchResults([]);
      }
    }, 400);
  };

  const handlePickLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPolicyForm(prev => ({ ...prev, location: result.display_name.split(',').slice(0,3).join(','), lngLat: { lat, lng } }));
    setLocationSearchResults([]);
    if (mapRef.current) mapRef.current.flyTo({ center: [lng, lat], zoom: 16, pitch: 55, duration: 2000 });
  };

  // Map click handler for policy location pinning
  useEffect(() => {
    if (!mapRef.current || !policyLocationPicking) return;
    const handleMapClick = async (e) => {
      const { lng, lat } = e.lngLat;
      setPolicyForm(prev => ({ ...prev, lngLat: { lat, lng } }));
      setPolicyLocationPicking(false);
      // Reverse geocode
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        if (res.data?.display_name) {
          setPolicyForm(prev => ({ ...prev, location: res.data.display_name.split(',').slice(0,3).join(','), lngLat: { lat, lng } }));
        }
      } catch (e) {
        setPolicyForm(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      }
    };
    mapRef.current.on('click', handleMapClick);
    mapRef.current.getCanvas().style.cursor = 'crosshair';
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.getCanvas().style.cursor = '';
      }
    };
  }, [policyLocationPicking]);

  const onDragStart = (e, type) => e.dataTransfer.setData('assetType', type);
  const onDrop = (e) => {
    const type = e.dataTransfer.getData('assetType');
    if (!ASSET_TEMPLATES[type]) return;
    const rect = mapRef.current.getContainer().getBoundingClientRect();
    const rawLngLat = mapRef.current.unproject([e.clientX - rect.left, e.clientY - rect.top]);
    
    // Minecraft-style Grid Snapping (0.0005 deg resolution ~ 50m)
    const gridSize = 0.0005;
    const lngLat = {
      lng: Math.round(rawLngLat.lng / gridSize) * gridSize,
      lat: Math.round(rawLngLat.lat / gridSize) * gridSize
    };

    setPlacedAssets(prev => [...prev, { id: Date.now(), type, lngLat, ...ASSET_TEMPLATES[type] }]);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };

  return (
    <div className="app-root" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <MapLayout 
        viewState={viewState} 
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        layers={layers} 
        currentStyle={currentStyle} 
        isXrayEnabled={isXrayEnabled}
        onMapLoad={(m) => { mapRef.current = m; setMapLoaded(true); }}
        onWebGLInitialized={onWebGLInitialized}
        onBuildingClick={(building) => {
          if (isDemolishMode) {
            handleBuildingGameAction(building, 'DEMOLISH');
            return;
          }
          if (assetToPlace) {
            handleBuildingGameAction(building, assetToPlace);
            return;
          }

          if (building.isShiftPressed) {
            setSelectedBuildings(prev => {
              if (prev.find(b => b.id === building.id)) return prev.filter(b => b.id !== building.id);
              return [...prev, building];
            });
          } else {
            setSelectedBuildings([building]);
          }
        }}
        selectedBuildingIds={selectedBuildings.map(b => b.id)}
      >
        {isSplitScreen && <div className="split-divider" />}
      </MapLayout>

      <div className="search-container">
        <div className="search-box">
          <input className="search-field" placeholder="Search Bengaluru Nexus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <AdminSidebar 
        activeCategory={activeCategory}
        globalConfidence={globalConfidence}
        handleAiSuggest={handleAiSuggest}
        aiSuggestion={aiSuggestion}
        timeHorizon={timeHorizon}
        setTimeHorizon={setTimeHorizon}
        activePriority={activePriority}
        setActivePriority={setActivePriority}
        advisorLog={advisorLog}
        advisorQuery={advisorQuery}
        setAdvisorQuery={setAdvisorQuery}
        handleAskAdvisor={handleAskAdvisor}
        policyForm={policyForm}
        setPolicyForm={setPolicyForm}
        handleBroadcastPolicy={handleBroadcastPolicy}
        isBroadcasting={isBroadcasting}
        assetToPlace={assetToPlace}
        setAssetToPlace={setAssetToPlace}
        onDragStart={onDragStart}
        floodLevel={floodLevel}
        setFloodLevel={setFloodLevel}
        handleFetchSentiment={async () => { 
          setIsSentimentLoading(true); 
          try {
            const res = await axios.post('http://localhost:3001/api/sentiment');
            setSentimentData(res.data);
            setSentimentEnabled(true);
          } catch (err) { console.error(err); }
          setIsSentimentLoading(false); 
        }}
        isSentimentLoading={isSentimentLoading}
        publicRequests={publicRequests}
        setSelectedRequest={setSelectedRequest}
        flyTo={flyTo}
        aiPolicyScore={aiPolicyScore}
        isAnalyzingPolicy={isAnalyzingPolicy}
        handleAnalyzePolicy={handleAnalyzePolicy}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isDemolishMode={isDemolishMode}
        setIsDemolishMode={setIsDemolishMode}
        sentimentData={sentimentData}
        policyLocationPicking={policyLocationPicking}
        setPolicyLocationPicking={setPolicyLocationPicking}
        policyPdfFile={policyPdfFile}
        setPolicyPdfFile={setPolicyPdfFile}
        handleGetLiveLocation={handleGetLiveLocation}
        locationSearchResults={locationSearchResults}
        handleLocationSearch={handleLocationSearch}
        handlePickLocation={handlePickLocation}
        mapRef={mapRef}
      />

      <AdminDock 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
        currentStyle={currentStyle}
        setCurrentStyle={setCurrentStyle}
        isXrayEnabled={isXrayEnabled}
        setIsXrayEnabled={setIsXrayEnabled}
        isSplitScreen={isSplitScreen}
        setIsSplitScreen={setIsSplitScreen}
        activeSmartZones={activeSmartZones}
        setActiveSmartZones={setActiveSmartZones}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <UrbanHUD cityStats={cityStats} lastActionImpact={lastActionImpact} />

      <PublicRequestDossier 
        selectedRequest={selectedRequest} 
        setSelectedRequest={setSelectedRequest} 
        setPublicRequests={setPublicRequests} 
      />

      {battleMode && <ScenarioBattle setBattleMode={setBattleMode} />}

      {activeNotification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'rgba(10,11,16,0.95)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '1.5rem', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '1px' }}>GLOBAL_DIRECTIVE_DEPLOYED</span>
            <button onClick={() => setActiveNotification(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>X</button>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>{activeNotification.title}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
              <span style={{ display: 'block', fontSize: '0.5rem', color: 'var(--text-secondary)' }}>BUDGET ALLOCATION</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 800 }}>{activeNotification.data.budget || 'N/A'}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
              <span style={{ display: 'block', fontSize: '0.5rem', color: 'var(--text-secondary)' }}>ESTIMATED TIMELINE</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>{activeNotification.data.duration || 'N/A'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--accent)', marginBottom: '0.25rem' }}>IMPACT ANALYSIS</span>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              <strong>Underground:</strong> {activeNotification.data.impactUnderground || 'No data'}<br/>
              <strong>Traffic:</strong> {activeNotification.data.impactTraffic || 'No data'}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(37,99,235,0.1)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
            <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--accent)', marginBottom: '0.25rem' }}>EXPECTED OUTCOME</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-primary)' }}>{activeNotification.data.outcome || 'N/A'}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>AI_VIABILITY_SCORE:</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: activeNotification.score >= 75 ? 'var(--success)' : 'var(--danger)' }}>{activeNotification.score}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
