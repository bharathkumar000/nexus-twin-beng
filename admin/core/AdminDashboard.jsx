'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ScatterplotLayer, ColumnLayer, LineLayer } from '@deck.gl/layers';
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
  const [policyForm, setPolicyForm] = useState({ title: '', location: '', budget: '', duration: '', impactUnderground: '', impactTraffic: '', outcome: '' });
  const [aiPolicyScore, setAiPolicyScore] = useState(null);
  const [isAnalyzingPolicy, setIsAnalyzingPolicy] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
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

  const [viewState, setViewState] = useState({
    longitude: 77.5912, latitude: 12.9797, zoom: 14, pitch: 55, bearing: 0
  });

  useEffect(() => {
    if (activeCategory) setIsSidebarCollapsed(false);
  }, [activeCategory]);

  const onWebGLInitialized = (gl) => { setGlContext(gl); setGraphicsReady(true); };

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => updateAgents(prev, { isRainy, placedAssets }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [isRainy, placedAssets]);

  const generateGrid = () => {
    const lines = [];
    const step = 0.0005;
    const range = 0.02; // Show grid around center
    const centerLng = Math.round(viewState.longitude / step) * step;
    const centerLat = Math.round(viewState.latitude / step) * step;

    for (let i = -20; i <= 20; i++) {
      lines.push({
        start: [centerLng - range, centerLat + i * step],
        end: [centerLng + range, centerLat + i * step]
      });
      lines.push({
        start: [centerLng + i * step, centerLat - range],
        end: [centerLng + i * step, centerLat + range]
      });
    }
    return lines;
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
    activeCategory === 'builder' ? new LineLayer({
      id: 'grid-layer',
      data: generateGrid(),
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor: [255, 255, 255, 80], // White grid for Minecraft builder vibe
      getWidth: 1.5
    }) : null,
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

  const handleAnalyzePolicy = () => {
    setIsAnalyzingPolicy(true);
    setAiPolicyScore(null);
    // Simulating Ollama Gemma 4 policy audit based on input completeness
    setTimeout(() => {
      const isComplete = policyForm.title && policyForm.budget && policyForm.impactTraffic;
      const score = isComplete ? Math.floor(Math.random() * 15) + 80 : Math.floor(Math.random() * 20) + 50;
      setAiPolicyScore(score);
      setIsAnalyzingPolicy(false);
    }, 2500);
  };

  const handleBroadcastPolicy = () => {
    setIsBroadcasting(true);
    setTimeout(() => { 
      setIsBroadcasting(false); 
      setActiveNotification({
        id: Date.now(),
        type: 'GLOBAL_DIRECTIVE',
        title: policyForm.title || 'URBAN POLICY DEPLOYMENT',
        data: policyForm,
        score: aiPolicyScore,
        timestamp: new Date().toLocaleTimeString()
      });
      setPolicyForm({ title: '', location: '', budget: '', duration: '', impactUnderground: '', impactTraffic: '', outcome: '' });
      setAiPolicyScore(null);
    }, 1500);
  };

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
      />

      <AdminDock 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        isXrayEnabled={isXrayEnabled}
        setIsXrayEnabled={setIsXrayEnabled}
        currentStyle={currentStyle}
        setCurrentStyle={setCurrentStyle}
        handleLogout={handleLogout}
        isSplitScreen={isSplitScreen}
        setIsSplitScreen={setIsSplitScreen}
        activeSmartZones={activeSmartZones}
        setActiveSmartZones={setActiveSmartZones}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

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
