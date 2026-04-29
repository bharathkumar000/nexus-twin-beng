'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ScatterplotLayer, ColumnLayer, LineLayer, PolygonLayer, TextLayer, IconLayer, PathLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';

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
  const [globalConfidence, setGlobalConfidence] = useState(82);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [advisorLog, setAdvisorLog] = useState([{ role: 'ai', content: 'NEXUS_AI_STANDBY. Awaiting project-specific strategic directives. (Authorized for Urban Planning & Infrastructure Counsel only.)' }]);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [policyForm, setPolicyForm] = useState({ title: '', location: '', budget: '', budgetUnit: 'Cr', duration: '', durationUnit: 'Months', impactUnderground: '', impactTraffic: '', outcome: '', lngLat: null });
  const [aiPolicyScore, setAiPolicyScore] = useState(null);
  const [aiPolicyReport, setAiPolicyReport] = useState(null);
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
  const [demolishedBuildingIds, setDemolishedBuildingIds] = useState([]);
  const [transportStep, setTransportStep] = useState(0); // 0: idle, 1: start selected
  const [placementStart, setPlacementStart] = useState(null);
  const [customHeight, setCustomHeight] = useState(10);
  const [utilitiesData, setUtilitiesData] = useState(null);
  const [citizenComplaints, setCitizenComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/complaints');
        setCitizenComplaints(res.data);
      } catch (err) { console.error("Complaint fetch failed", err); }
    };
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveComplaint = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/complaints/${id}/resolve`);
      if (res.data.success) {
        setCitizenComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
      }
    } catch (err) { console.error("Resolve failed", err); }
  };

  useEffect(() => {
    axios.get('/data/bengaluru_utilities.json').then(res => setUtilitiesData(res.data));
  }, []);

  const [viewState, setViewState] = useState({
    longitude: 77.5912, latitude: 12.9797, zoom: 14, pitch: 55, bearing: 0
  });

  // GAME ENGINE STATE
  const [cityStats, setCityStats] = useState({ prosperity: 1250, happiness: 72, population: 45000 });
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
      
      // Add to demolished list to hide from map
      setDemolishedBuildingIds(prev => [...prev, building.id]);
      // Remove from selected list
      setSelectedBuildings(prev => prev.filter(b => b.id !== building.id));
    } else {
      // Action Type is likely an asset name like 'education-campus'
      const template = ASSET_TEMPLATES[actionType];
      const assetLabel = actionType.replace(/-/g, ' ').toUpperCase();
      
      if (template) {
        prosperityChange = template.impacts.economic * 5;
        happinessChange = template.impacts.social / 2;
        impactText = `Repurposed ${building.name} into ${assetLabel}. ${template.impacts.economic > 0 ? 'Economic' : 'Social'} index adjusted.`;
        scoreBonus = template.cost * 10;

        // Place the 3D asset at building's location
        setPlacedAssets(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          type: actionType, 
          lngLat: building.lngLat, 
          ...template 
        }]);

        // Hide the original building
        setDemolishedBuildingIds(prev => [...prev, building.id]);
      } else {
        prosperityChange = 40;
        happinessChange = 2;
        impactText = `Infrastructure updated at ${building.name}. Standard urban growth metrics maintained.`;
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

  const handleDemolishSelected = () => {
    if (selectedBuildings.length === 0) return;
    
    selectedBuildings.forEach(building => {
      handleBuildingGameAction(building, 'DEMOLISH');
    });
    
    setSelectedBuildings([]);
  };

  const handleApplyAssetToSelected = (assetName) => {
    if (selectedBuildings.length === 0) return;
    
    selectedBuildings.forEach(building => {
      handleBuildingGameAction(building, assetName);
    });
    
    setSelectedBuildings([]);
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

  const gridData = React.useMemo(() => {
    const features = [];
    const step = 0.0005; // ~50m cells
    const range = 100; // Large coverage for Bangalore
    
    // Fixed origin anchoring to Vidhana Soudha (77.5912, 12.9797)
    // This ensures the grid is globally stable and doesn't shift when the map moves
    const fixedAnchorLng = 77.5912;
    const fixedAnchorLat = 12.9797;

    let idCounter = 1;
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        const lng = fixedAnchorLng + x * step;
        const lat = fixedAnchorLat + y * step;
        
        features.push({
          type: 'Feature',
          id: idCounter++, 
          properties: { id: idCounter - 1, lng, lat, major: (x % 5 === 0 && y % 5 === 0) },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng, lat],
              [lng + step, lat],
              [lng + step, lat + step],
              [lng, lat + step],
              [lng, lat]
            ]]
          }
        });
      }
    }
    return { type: 'FeatureCollection', features };
  }, []); // Remove dependencies to keep it perfectly fixed across the land

  const utilityLayers = React.useMemo(() => {
    if (!utilitiesData || !isXrayEnabled) return [];

    const typeConfig = {
      'WaterPipe': { color: [37, 99, 235], depth: -6, offset: -0.00003 },
      'GasLine': { color: [249, 115, 22], depth: -8, offset: 0 },
      'SewagePipe': { color: [250, 204, 21], depth: -12, offset: 0.00003 },
      'ElectricityLine': { color: [255, 255, 255], depth: -4, offset: 0.00006 }
    };

    return [
      // Glow Layer (Base)
      new PathLayer({
        id: 'utility-pipes-glow',
        data: utilitiesData.features,
        getPath: d => d.geometry.coordinates.map(p => {
          const cfg = typeConfig[d.properties.type] || { depth: -5, offset: 0 };
          return [p[0] + cfg.offset, p[1] + cfg.offset, cfg.depth];
        }),
        getColor: d => {
          const c = (typeConfig[d.properties.type] || { color: [255, 255, 255] }).color;
          return [...c, 80];
        },
        getWidth: 15,
        widthMinPixels: 4,
        blur: 1,
        pickable: false
      }),
      // Core Pipe Layer (Solid)
      new PathLayer({
        id: 'utility-pipes-core',
        data: utilitiesData.features,
        getPath: d => d.geometry.coordinates.map(p => {
          const cfg = typeConfig[d.properties.type] || { depth: -5, offset: 0 };
          return [p[0] + cfg.offset, p[1] + cfg.offset, cfg.depth];
        }),
        getColor: d => (typeConfig[d.properties.type] || { color: [255, 255, 255] }).color,
        getWidth: 4,
        widthMinPixels: 1.5,
        pickable: true,
        onHover: ({ object }) => {
          if (object) {
            // Optional: Show utility health/pressure
          }
        }
      })
    ];
  }, [utilitiesData, isXrayEnabled]);

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
    sentimentEnabled && sentimentData ? new HeatmapLayer({
      id: 'sentiment-heatmap', 
      data: sentimentData.points, 
      getPosition: d => d.coordinates, 
      getWeight: d => d.sentiment + 1,
      radiusPixels: 70, 
      opacity: 0.6
    }) : null,

    ...utilityLayers,

    new ColumnLayer({
      id: 'placed-assets-layer',
      data: placedAssets.filter(d => d.lngLat),
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
    new LineLayer({
      id: 'transport-lines-layer',
      data: placedAssets.filter(d => d.startLngLat && d.endLngLat),
      getSourcePosition: d => [d.startLngLat.lng, d.startLngLat.lat, d.height],
      getTargetPosition: d => [d.endLngLat.lng, d.endLngLat.lat, d.height],
      getColor: d => d.color || [37, 99, 235],
      getWidth: 8,
      pickable: true
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

  const handleAskAdvisor = async () => {
    if (!advisorQuery.trim()) return;
    const q = advisorQuery; 
    setAdvisorQuery('');
    setAdvisorLog(p => [...p, { role: 'user', content: q }]);
    
    try {
      const res = await axios.post('http://localhost:3001/api/policy-advisor', { query: q });
      setAdvisorLog(p => [...p, { role: 'ai', content: res.data.report }]);
    } catch (err) {
      console.error("Advisor Error:", err);
      setAdvisorLog(p => [...p, { role: 'ai', content: "SYSTEM_ERROR: Command Core link unstable. Please retry." }]);
    }
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
    
    // Generate Detailed Report
    setAiPolicyReport({
      score,
      status: score >= 75 ? 'OPTIMAL' : (score >= 50 ? 'MID' : 'CRITICAL'),
      breakdown: [
        { label: 'Documentation Depth', value: policyPdfFile ? '+15%' : '0%', status: policyPdfFile ? 'pass' : 'fail' },
        { label: 'Fiscal Transparency', value: policyForm.budget ? '+20%' : '0%', status: policyForm.budget ? 'pass' : 'fail' },
        { label: 'Timeline Realism', value: policyForm.duration ? '+15%' : '0%', status: policyForm.duration ? 'pass' : 'fail' },
        { label: 'Geospatial Precision', value: policyForm.lngLat ? '+25%' : '0%', status: policyForm.lngLat ? 'pass' : 'fail' }
      ],
      reasons: [
        !policyForm.lngLat && "Missing coordinate anchoring reduces infrastructure accuracy.",
        !policyForm.budget && "Lack of budget transparency increases implementation risk.",
        score < 75 && "Impact on local traffic exceeds standard safety thresholds (estimated 32% increase)."
      ].filter(Boolean),
      suggestions: [
        "Shift construction to night shifts (11 PM - 5 AM) to reduce daytime traffic impact by 40%.",
        "Allocate 5% of budget to 'Citizen Compensation Fund' for local business disruption.",
        "Add secondary utility inspection to prevent water main accidents in the target zone."
      ]
    });
    
    setIsAnalyzingPolicy(false);
  };
  
  const handleDownloadReport = () => {
    if (!aiPolicyReport) return;
    const reportText = `
BENGALURU NEXUS - POLICY VIABILITY REPORT
------------------------------------------
TITLE: ${policyForm.title || 'Untitled Policy'}
SCORE: ${aiPolicyReport.score}% (${aiPolicyReport.status})

BREAKDOWN:
${aiPolicyReport.breakdown.map(b => `- ${b.label}: ${b.value}`).join('\n')}

REASONS FOR RATING:
${aiPolicyReport.reasons.map(r => `- ${r}`).join('\n')}

AI SUGGESTIONS FOR IMPROVEMENT:
${aiPolicyReport.suggestions.map(s => `- ${s}`).join('\n')}
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Policy_Report_${Date.now()}.txt`;
    a.click();
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

          if (assetToPlace && ASSET_TEMPLATES[assetToPlace]?.group === 'Transport') {
            const lngLat = building.lngLat;
            if (transportStep === 0) {
              setPlacementStart(lngLat);
              setTransportStep(1);
            } else {
              const newAsset = { 
                id: Date.now(), 
                type: assetToPlace, 
                startLngLat: placementStart, 
                endLngLat: lngLat, 
                height: Math.max(customHeight, 5),
                color: ASSET_TEMPLATES[assetToPlace].color,
                group: 'Transport' 
              };
              setPlacedAssets(prev => [...prev, newAsset]);
              setTransportStep(0);
              setPlacementStart(null);
              setAssetToPlace(null);
            }
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
        demolishedBuildingIds={demolishedBuildingIds}
        gridData={gridData}
        onGridClick={(cell) => {
          const cellId = typeof cell === 'object' ? cell.id : cell;
          setSelectedGridCell(cellId);
          
          if (assetToPlace && ASSET_TEMPLATES[assetToPlace]?.group === 'Transport') {
            const lngLat = cell.lngLat;
            if (!lngLat) return;
            
            if (transportStep === 0) {
              setPlacementStart(lngLat);
              setTransportStep(1);
            } else {
              const newAsset = { 
                id: Date.now(), 
                type: assetToPlace, 
                startLngLat: placementStart, 
                endLngLat: lngLat, 
                height: Math.max(customHeight, 5),
                color: ASSET_TEMPLATES[assetToPlace].color,
                group: 'Transport' 
              };
              setPlacedAssets(prev => [...prev, newAsset]);
              setTransportStep(0);
              setPlacementStart(null);
              setAssetToPlace(null);
            }
          }
        }}
        selectedGridCellId={selectedGridCell}
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
        aiPolicyReport={aiPolicyReport}
        handleDownloadReport={handleDownloadReport}
        isAnalyzingPolicy={isAnalyzingPolicy}
        handleAnalyzePolicy={handleAnalyzePolicy}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isDemolishMode={isDemolishMode}
        setIsDemolishMode={setIsDemolishMode}
        selectedBuildings={selectedBuildings}
        handleDemolishSelected={handleDemolishSelected}
        handleApplyAssetToSelected={handleApplyAssetToSelected}
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
        customHeight={customHeight}
        setCustomHeight={setCustomHeight}
        transportStep={transportStep}
        citizenComplaints={citizenComplaints}
        handleResolveComplaint={handleResolveComplaint}
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
