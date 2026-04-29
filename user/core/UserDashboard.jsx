'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';

// SHARED
import MapLayout from '../../shared/components/MapLayout';
import { updateAgents } from '../../shared/utils/simulation';
import { generateAgents } from '../../shared/utils/agentGenerator';

// USER SPECIFIC
import UserSidebar from '../components/UserSidebar';
import UserDock from '../components/UserDock';
import NotificationBar from '../components/NotificationBar';

const UserDashboard = () => {
  const router = useRouter();
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);

  const [activeTab, setActiveTab] = useState('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);

  const [floodLevel, setFloodLevel] = useState(0);
  const [timelineYear, setTimelineYear] = useState(2024);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [isRainy, setIsRainy] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [latestNotif, setLatestNotif] = useState(null);
  const [publicRequests, setPublicRequests] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [allNotifications, setAllNotifications] = useState([]);

  const [viewState, setViewState] = useState({
    longitude: 77.5912, latitude: 12.9797, zoom: 14, pitch: 55, bearing: 0
  });

  const onWebGLInitialized = (gl) => { setGlContext(gl); setGraphicsReady(true); };

  const fetchRequests = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/complaints');
        setPublicRequests(res.data);
      } catch (err) { 
        console.warn("Nexus Command Core offline. Using local simulation for complaints.");
        setPublicRequests([
          { id: 'm1', demand: 'Pothole Alert', status: 'pending', location: 'Silk Board', upvotes: 45, timestamp: new Date().toISOString() },
          { id: 'm2', demand: 'Water Main Burst', status: 'pending', location: 'Whitefield', upvotes: 22, timestamp: new Date().toISOString() }
        ]);
      }
    };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/notifications');
        setAllNotifications(res.data);
        if (res.data.length > 0) {
          const newest = res.data[0];
          if (!latestNotif || newest.id !== latestNotif.id) {
            setLatestNotif(newest);
            setShowNotifBar(true);
          }
        }
      } catch (err) { 
        console.warn("Nexus Command Core offline. Using local simulation for notifications.");
        const mockNotif = {
          id: 'n1',
          policy: 'METRO_PHASE_4_APPROVED',
          purpose: 'New metro connectivity approved for Outer Ring Road zones.',
          prediction: 'AI_SAFE',
          duration: '5 YEARS',
          timestamp: new Date().toLocaleTimeString()
        };
        setAllNotifications([mockNotif]);
        if (!latestNotif) {
          setLatestNotif(mockNotif);
          setShowNotifBar(true);
        }
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [latestNotif]);

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => updateAgents(prev, { isRainy }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [isRainy]);

  const layers = [
    sentimentEnabled && sentimentData ? new HeatmapLayer({
      id: 'sentiment-heatmap', data: sentimentData.points, getPosition: d => d.coordinates, radiusPixels: 70, opacity: 0.6
    }) : null,
    new ScatterplotLayer({
      id: 'public-requests-layer',
      data: publicRequests,
      getPosition: d => [d.lngLat.lng, d.lngLat.lat],
      getFillColor: [239, 68, 68],
      getRadius: 15,
      pickable: true
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

  const handleFileComplaint = async (form) => {
    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('description', form.description);
    if (form.photo) formData.append('photo', form.photo);
    
    try {
      const res = await axios.post('http://localhost:3001/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("COMPLAINT_FILED: Nexus Twin Command notified.");
        fetchRequests(); // Refresh the list immediately
        return true;
      }
    } catch (err) {
      console.error(err);
      alert("ERROR: Could not establish link to Command Core.");
    }
    return false;
  };

  const handleUpvote = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/complaints/${id}/upvote`);
      if (res.data.success) {
        fetchRequests(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
      alert("ERROR: Upvote failed.");
    }
  };

  const handleLogout = () => { localStorage.removeItem('auth_token'); router.push('/'); };

  return (
    <div className="app-root">
      <NotificationBar showNotifBar={showNotifBar} latestNotif={latestNotif} setShowNotifBar={setShowNotifBar} />
      
      <MapLayout 
        viewState={viewState} 
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        layers={layers} 
        currentStyle={currentStyle} 
        isXrayEnabled={isXrayEnabled}
        onMapLoad={(m) => { mapRef.current = m; setMapLoaded(true); }}
        onWebGLInitialized={onWebGLInitialized}
        onBuildingClick={(building) => {
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
      />

      <div className="search-container">
        <div className="search-box">
          <input className="search-field" placeholder="Search Bengaluru Hub..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <UserSidebar 
        handleFetchSentiment={() => { setIsSentimentLoading(true); setTimeout(() => { setSentimentEnabled(true); setIsSentimentLoading(false); }, 1000); }} 
        isSentimentLoading={isSentimentLoading}
        aqiEnabled={aqiEnabled} setAqiEnabled={setAqiEnabled}
        greenEnabled={greenEnabled} setGreenEnabled={setGreenEnabled}
        floodLevel={floodLevel} setFloodLevel={setFloodLevel}
        isRainy={isRainy} setIsRainy={setIsRainy}
        timelineYear={timelineYear} setTimelineYear={setTimelineYear}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        handleFileComplaint={handleFileComplaint}
        notifications={allNotifications}
        myReports={publicRequests}
        handleUpvote={handleUpvote}
      />

      <UserDock 
        activeTab={activeTab} setActiveTab={setActiveTab}
        currentStyle={currentStyle} setCurrentStyle={setCurrentStyle}
        handleLogout={handleLogout}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
    </div>
  );
};

export default UserDashboard;
