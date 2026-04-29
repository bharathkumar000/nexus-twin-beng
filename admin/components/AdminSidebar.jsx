import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, Bot, Hammer, Globe, MessageSquare, 
  History, Target, Send, Megaphone, Loader2, Terminal, X, Heart, MapPin, Trash2, Maximize2, Minimize2, FileText, UploadCloud, Paperclip,
  Navigation, Search, Crosshair, CheckCircle2, AlertTriangle, XCircle
} from 'lucide-react';
import { ASSET_TEMPLATES } from '../utils/constants';

const AdminSidebar = ({ 
  activeCategory, 
  globalConfidence, 
  handleAiSuggest, 
  aiSuggestion, 
  timeHorizon, 
  setTimeHorizon, 
  advisorLog = [],
  advisorQuery,
  setAdvisorQuery,
  handleAskAdvisor,
  policyForm = {},
  setPolicyForm,
  handleBroadcastPolicy,
  isBroadcasting,
  assetToPlace,
  setAssetToPlace,
  onDragStart,
  floodLevel,
  setFloodLevel,
  showHydrants,
  setShowHydrants,
  isEmergencyActive,
  setIsEmergencyActive,
  publicRequests = [],
  setSelectedRequest,
  flyTo,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isDemolishMode,
  setIsDemolishMode,
  selectedBuildings = [],
  handleDemolishSelected,
  handleApplyAssetToSelected,
  aiPolicyScore,
  isAnalyzingPolicy,
  handleAnalyzePolicy,
  policyLocationPicking,
  setPolicyLocationPicking,
  policyPdfFile,
  setPolicyPdfFile,
  handleGetLiveLocation,
  locationSearchResults = [],
  handleLocationSearch,
  handlePickLocation,
  mapRef,
  customHeight,
  setCustomHeight,
  transportStep,
  aiPolicyReport,
  handleDownloadReport,
  citizenComplaints = [],
  handleResolveComplaint = () => {}
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  const handleAction = (callback) => {
    if (callback) callback();
  };

  return (
    <div 
      className={`side-panel ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}
      style={isMaximized ? { 
        width: '100vw', 
        height: '100vh', 
        maxWidth: '100vw', 
        top: 0, 
        left: 0, 
        zIndex: 9999, 
        borderRadius: 0 
      } : {}}
    >
      <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={24} color="var(--accent)" />
          <div className="header-text">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>ADMIN NEXUS</h2>
            <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>CMD_ROOT_ACCESS_v4.0</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore" : "Expand Entirely"}
            style={{ 
              background: 'rgba(0,0,0,0.05)', 
              border: 'none', 
              borderRadius: '50%', 
              width: '28px', 
              height: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          >
            {isMaximized ? <Minimize2 size={14} color="var(--text-secondary)" /> : <Maximize2 size={14} color="var(--text-secondary)" />}
          </button>
          <button 
            onClick={() => { setIsSidebarCollapsed(true); setIsMaximized(false); }}
            title="Close"
            style={{ 
              background: 'rgba(0,0,0,0.05)', 
              border: 'none', 
              borderRadius: '50%', 
              width: '28px', 
              height: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      <div className="widget content-widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', borderLeft: '1px solid var(--accent-glass)' }}>
        <div className="scroll-area" style={{ flex: 1, padding: '1rem' }}>
          
          {!activeCategory && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center' }}>
              <Terminal size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
              <span className="section-label">SYSTEM_READY</span>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>SELECT CATEGORY FROM COMMAND DOCK</p>
            </div>
          )}

          {activeCategory === 'strategy' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>



              {/* PRIORITY DEMANDS INTELLIGENCE TABLE */}
              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <Activity size={14} /> PRIORITY DEMANDS — INTELLIGENCE FEED
                </span>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Aggregated from <strong>{publicRequests?.length || 0} citizen reports</strong>, social sentiment, officer submissions & AI prediction models.
                </p>

                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--accent)', color: '#fff' }}>
                        <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', fontWeight: 800, letterSpacing: '0.5px' }}>#</th>
                        <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', fontWeight: 800, letterSpacing: '0.5px' }}>DEMAND</th>
                        <th style={{ padding: '0.5rem 0.6rem', textAlign: 'center', fontWeight: 800, letterSpacing: '0.5px' }}>URGENCY</th>
                        <th style={{ padding: '0.5rem 0.6rem', textAlign: 'center', fontWeight: 800, letterSpacing: '0.5px' }}>SOURCE</th>
                        <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 800, letterSpacing: '0.5px' }}>AFFECTED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rank: 1, demand: 'Road & Pothole Repair', urgency: 'CRITICAL', urgencyColor: '#ef4444', source: '📋 Reports + 📱 Social', affected: '~1.2L citizens', bg: 'rgba(239,68,68,0.04)' },
                        { rank: 2, demand: 'Affordable Housing', urgency: 'CRITICAL', urgencyColor: '#ef4444', source: '📱 Social + 👮 Officers', affected: '~90K families', bg: 'rgba(239,68,68,0.04)' },
                        { rank: 3, demand: 'Traffic Signal Modernization', urgency: 'HIGH', urgencyColor: '#f59e0b', source: '📋 Reports + 👮 Officers', affected: '~85K commuters', bg: 'rgba(245,158,11,0.04)' },
                        { rank: 4, demand: 'Stormwater Drain Expansion', urgency: 'HIGH', urgencyColor: '#f59e0b', source: '🤖 AI Predict + 👮 Officers', affected: '~2.1L residents', bg: 'rgba(245,158,11,0.04)' },
                        { rank: 5, demand: 'Public Healthcare Access', urgency: 'HIGH', urgencyColor: '#f59e0b', source: '👮 Officers + 🤖 AI', affected: '~4.2L citizens', bg: 'rgba(245,158,11,0.04)' },
                        { rank: 6, demand: 'Water Supply Reliability', urgency: 'HIGH', urgencyColor: '#f59e0b', source: '📋 Reports + 👮 Officers', affected: '~1.5L households', bg: 'rgba(245,158,11,0.04)' },
                        { rank: 7, demand: 'Public Transit Coverage', urgency: 'MEDIUM', urgencyColor: '#2563eb', source: '📱 Social + 📋 Reports', affected: '~3.5L daily', bg: 'rgba(37,99,235,0.03)' },
                        { rank: 8, demand: 'Streetlight Installation', urgency: 'MEDIUM', urgencyColor: '#2563eb', source: '📋 Reports + 👮 Officers', affected: '~60K residents', bg: 'rgba(37,99,235,0.03)' },
                        { rank: 9, demand: 'Garbage Collection Frequency', urgency: 'MEDIUM', urgencyColor: '#2563eb', source: '📱 Social + 📋 Reports', affected: '~1.8L households', bg: 'rgba(37,99,235,0.03)' },
                        { rank: 10, demand: 'Park & Green Space Development', urgency: 'LOW', urgencyColor: '#10b981', source: '📱 Social + 🤖 AI', affected: '~2.5L residents', bg: 'rgba(16,185,129,0.04)' },
                      ].map(row => (
                        <tr key={row.rank} style={{ background: row.bg, borderBottom: '1px solid var(--glass-border)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'} onMouseLeave={e => e.currentTarget.style.background = row.bg}>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 900, color: 'var(--accent)' }}>{row.rank}</td>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{row.demand}</td>
                          <td style={{ padding: '0.55rem 0.6rem', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.5rem', 
                              fontWeight: 900, 
                              color: '#fff', 
                              background: row.urgencyColor,
                              letterSpacing: '0.5px'
                            }}>{row.urgency}</span>
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', textAlign: 'center', fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{row.source}</td>
                          <td style={{ padding: '0.55rem 0.6rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.55rem' }}>{row.affected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 800 }}>📋 Citizen Reports</span>
                  <span style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontWeight: 800 }}>📱 Social Media</span>
                  <span style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 800 }}>👮 Officer Inputs</span>
                  <span style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 800 }}>🤖 AI Prediction</span>
                </div>
              </div>

              {/* 3. AI ADVISOR */}
              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <Bot size={14} /> NEXUS AI ADVISOR (GEMMA-4)
                </span>
                <div className="advisor-chat" style={{ height: '220px', overflowY: 'auto', marginBottom: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}>
                  {advisorLog.length === 0 && <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Standing by for strategic queries...</p>}
                  {advisorLog.map((m, i) => (
                    <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '10px', background: m.role === 'ai' || m.role === 'assistant' ? 'rgba(37,99,235,0.05)' : 'rgba(0,0,0,0.03)', border: m.role === 'ai' || m.role === 'assistant' ? '1px solid var(--accent-glass)' : '1px solid var(--glass-border)' }}>
                      <strong style={{ color: m.role === 'ai' || m.role === 'assistant' ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.6rem', display: 'block', marginBottom: '0.25rem' }}>{m.role === 'ai' || m.role === 'assistant' ? 'NEXUS_OS' : 'COMMANDER'}:</strong>
                      <p style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{m.content}</p>
                    </div>
                  ))}
                  {isBroadcasting && <div className="loading-indicator" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', color: 'var(--accent)' }}><Loader2 size={12} className="spin" /> ANALYZING GEOSPATIAL IMPACT...</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="chat-field" value={advisorQuery} onChange={e => setAdvisorQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()} placeholder="QUERY SYSTEM..." style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                  <button className="action-btn" onClick={() => handleAction(handleAskAdvisor)} style={{ width: '45px', padding: 0, height: '40px' }}><Send size={16} /></button>
                </div>
              </div>


            </motion.div>
          )}



          {activeCategory === 'builder' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '2rem',
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '0.85rem', 
                    fontWeight: 800, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    letterSpacing: '1px'
                  }}>
                    <Hammer size={16} color="var(--accent)" /> INVENTORY
                  </div>
                  <button 
                    onClick={() => {
                      if (selectedBuildings.length > 0) {
                        handleDemolishSelected();
                      } else {
                        setIsDemolishMode(!isDemolishMode);
                      }
                    }}
                    title={selectedBuildings.length > 0 ? `Demolish ${selectedBuildings.length} Selected` : (isDemolishMode ? 'Demolish Mode Active' : 'Toggle Demolish Mode')}
                    style={{
                      background: selectedBuildings.length > 0 ? 'rgba(239, 68, 68, 0.2)' : (isDemolishMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(0, 0, 0, 0.04)'),
                      border: (selectedBuildings.length > 0 || isDemolishMode) ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      if (!isDemolishMode && selectedBuildings.length === 0) e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isDemolishMode && selectedBuildings.length === 0) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    <Trash2 size={15} color={(selectedBuildings.length > 0 || isDemolishMode) ? 'var(--danger)' : 'var(--text-secondary)'} />
                  </button>
                </div>

                {assetToPlace && ASSET_TEMPLATES[assetToPlace]?.group === 'Transport' && (
                  <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid var(--accent-glass)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Navigation size={12} /> TRANSPORT_PLACEMENT_CONFIG
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>ELEVATION / HEIGHT (m)</label>
                      <input 
                        type="range" min="0" max="100" step="1" 
                        value={customHeight} 
                        onChange={(e) => setCustomHeight(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: 'var(--accent)' }} 
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>0m</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)' }}>{customHeight}m</span>
                        <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>100m</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTransportStep(0)}
                      style={{ 
                        width: '100%',
                        background: transportStep === 0 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        border: `1px solid ${transportStep === 0 ? 'var(--accent)' : '#10b981'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                       <p style={{ fontSize: '0.55rem', color: transportStep === 0 ? 'var(--accent)' : '#10b981', fontWeight: 900, textAlign: 'center', margin: 0, letterSpacing: '1px' }}>
                         {transportStep === 0 ? '👉 CLICK MAP TO SET START' : '🎯 CLICK MAP TO SET END'}
                       </p>
                    </button>
                  </div>
                )}
                
                {['Buildings', 'Transport', 'Energy'].map(groupName => {
                  const assets = Object.entries(ASSET_TEMPLATES).filter(([_, a]) => a.group === groupName);
                  if (assets.length === 0) return null;

                  return (
                    <div key={groupName} style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ 
                        fontSize: '0.65rem', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {groupName.toUpperCase()}
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '0.5rem'
                      }}>
                        {assets.map(([name, asset]) => {
                          const isActive = assetToPlace === name;
                          return (
                            <div 
                              key={name} 
                              draggable 
                              onDragStart={(e) => onDragStart(e, name)} 
                              onClick={() => {
                                if (selectedBuildings.length > 0) {
                                  handleApplyAssetToSelected(name);
                                } else {
                                  handleAction(() => setAssetToPlace(name));
                                }
                              }} 
                              title={selectedBuildings.length > 0 ? `Apply to ${selectedBuildings.length} Selected` : name.toUpperCase()}
                              style={{ 
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: selectedBuildings.length > 0 ? 'cell' : 'grab', 
                                background: isActive ? 'rgba(37, 99, 235, 0.1)' : '#ffffff',
                                border: isActive ? '1.5px solid var(--accent)' : '1px solid #e2e8f0',
                                borderRadius: '10px',
                                position: 'relative',
                                padding: '4px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                                transform: isActive ? 'translateY(-2px)' : 'none'
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                                  e.currentTarget.style.borderColor = 'var(--accent-glass)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.transform = 'none';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                }
                              }}
                            >
                              <div style={{ 
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)', 
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.2s ease',
                                marginBottom: '4px'
                              }}>
                                {asset.icon}
                              </div>
                              <span style={{ 
                                fontSize: '0.45rem', 
                                fontWeight: 800, 
                                color: isActive ? 'var(--accent)' : 'var(--text-primary)', 
                                textAlign: 'center',
                                lineClamp: 1,
                                overflow: 'hidden',
                                width: '100%',
                                pointerEvents: 'none',
                                letterSpacing: '0.5px'
                              }}>
                                {name.split('-')[0].toUpperCase()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeCategory === 'policy' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><FileText size={14} /> STRATEGIC_POLICY_HUB</span>
                
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                  {/* POLICY TITLE */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>POLICY_TITLE</label>
                    <input className="search-field" placeholder="e.g., Underground Metro Line Extension" value={policyForm.title} onChange={e => setPolicyForm({...policyForm, title: e.target.value})} style={{ width: '100%' }} />
                  </div>

                  {/* PDF UPLOAD */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>ATTACH_POLICY_DOCUMENT (PDF)</label>
                    <div 
                      style={{ 
                        border: '2px dashed var(--glass-border)', 
                        borderRadius: '10px', 
                        padding: '1rem', 
                        textAlign: 'center', 
                        background: policyPdfFile ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => document.getElementById('policy-pdf-upload').click()}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                      onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--glass-border)'; const file = e.dataTransfer.files[0]; if (file && file.type === 'application/pdf') setPolicyPdfFile(file); }}
                    >
                      <input type="file" id="policy-pdf-upload" accept=".pdf" hidden onChange={(e) => { if (e.target.files[0]) setPolicyPdfFile(e.target.files[0]); }} />
                      {policyPdfFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <Paperclip size={14} color="var(--success)" />
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)' }}>{policyPdfFile.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); setPolicyPdfFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={12} color="var(--danger)" /></button>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud size={24} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '0.25rem' }} />
                          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Drop PDF here or <span style={{ color: 'var(--accent)', fontWeight: 700 }}>browse</span></p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* LOCATION SECTION */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>TARGET_LOCATION</label>
                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <input className="search-field" placeholder="Search or enter location..." value={policyForm.location} onChange={e => { setPolicyForm({...policyForm, location: e.target.value}); if (e.target.value.length > 2) handleLocationSearch(e.target.value); }} style={{ flex: 1 }} />
                      <button 
                        title="Use Live GPS Location" 
                        onClick={() => handleAction(handleGetLiveLocation)}
                        style={{ width: '36px', height: '36px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <Navigation size={14} color="var(--accent)" />
                      </button>
                      <button 
                        title={policyLocationPicking ? 'Cancel Pin' : 'Pin on Map'}
                        onClick={() => setPolicyLocationPicking(!policyLocationPicking)}
                        style={{ 
                          width: '36px', height: '36px', 
                          border: policyLocationPicking ? '1.5px solid var(--accent)' : '1px solid var(--glass-border)', 
                          borderRadius: '8px', 
                          background: policyLocationPicking ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.8)', 
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}
                      >
                        <Crosshair size={14} color={policyLocationPicking ? 'var(--accent)' : 'var(--text-secondary)'} />
                      </button>
                    </div>
                    {policyLocationPicking && (
                      <div style={{ fontSize: '0.55rem', color: 'var(--accent)', background: 'rgba(37,99,235,0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <Crosshair size={10} /> Click anywhere on the map to pin location...
                      </div>
                    )}
                    {locationSearchResults && locationSearchResults.length > 0 && (
                      <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid var(--glass-border)', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto', marginBottom: '0.25rem' }}>
                        {locationSearchResults.map((r, i) => (
                          <div key={i} onClick={() => handlePickLocation(r)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.6rem', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37,99,235,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <MapPin size={10} color="var(--accent)" />
                            <span style={{ color: 'var(--text-primary)' }}>{r.display_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {policyForm.lngLat && (
                      <div style={{ fontSize: '0.55rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={10} /> {policyForm.lngLat.lat.toFixed(4)}, {policyForm.lngLat.lng.toFixed(4)}
                      </div>
                    )}
                  </div>

                  {/* BUDGET & TIMELINE */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>BUDGET (₹)</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input 
                          type="number"
                          className="search-field" 
                          placeholder="0.00" 
                          value={policyForm.budget} 
                          onChange={e => setPolicyForm({...policyForm, budget: e.target.value})} 
                          style={{ flex: 1, minWidth: 0 }} 
                        />
                        <select 
                          className="search-field"
                          value={policyForm.budgetUnit}
                          onChange={e => setPolicyForm({...policyForm, budgetUnit: e.target.value})}
                          style={{ width: '65px', padding: '0 4px', fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.8)' }}
                        >
                          <option value="Cr">CR</option>
                          <option value="Lakh">LAKH</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>TIMELINE</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input 
                          type="number"
                          className="search-field" 
                          placeholder="0" 
                          value={policyForm.duration} 
                          onChange={e => setPolicyForm({...policyForm, duration: e.target.value})} 
                          style={{ flex: 1, minWidth: 0 }} 
                        />
                        <select 
                          className="search-field"
                          value={policyForm.durationUnit || 'Months'}
                          onChange={e => setPolicyForm({...policyForm, durationUnit: e.target.value})}
                          style={{ width: '85px', padding: '0 4px', fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.8)' }}
                        >
                          <option value="Days">DAYS</option>
                          <option value="Months">MONTHS</option>
                          <option value="Years">YEARS</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* IMPACT PROJECTIONS */}
                  <div className="widget" style={{ padding: '0.75rem', background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: '1rem' }}>
                    <span className="section-label" style={{ fontSize: '0.55rem', color: 'var(--accent)', marginBottom: '0.5rem', display: 'block' }}>IMPACT_PROJECTIONS</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.15rem' }}>TRAFFIC DISRUPTION</label>
                        <input className="search-field" placeholder="e.g., 30% increase for 6 months" value={policyForm.impactTraffic} onChange={e => setPolicyForm({...policyForm, impactTraffic: e.target.value})} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.15rem' }}>UNDERGROUND UTILITIES RISK</label>
                        <input className="search-field" placeholder="e.g., Water main rerouting needed" value={policyForm.impactUnderground} onChange={e => setPolicyForm({...policyForm, impactUnderground: e.target.value})} style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>

                  {/* EXPECTED OUTCOME */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>EXPECTED_OUTCOME & ROI</label>
                    <textarea className="search-field" placeholder="Describe projected benefits..." value={policyForm.outcome} onChange={e => setPolicyForm({...policyForm, outcome: e.target.value})} style={{ minHeight: '60px', resize: 'vertical', width: '100%' }} />
                  </div>

                  {/* ANALYZE BUTTON */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <button className="action-btn" onClick={() => handleAction(handleAnalyzePolicy)} disabled={isAnalyzingPolicy} style={{ width: '100%', background: 'var(--accent)', color: '#fff', fontWeight: 800 }}>
                      {isAnalyzingPolicy ? <><Loader2 className="spin" size={16} /> ANALYZING...</> : '🧠 ANALYZE POLICY (GEMMA_AI)'}
                    </button>
                  </div>

                  {/* AI SCORE RESULT & DETAILED REPORT */}
                  {aiPolicyScore !== null && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '1.25rem', background: 'rgba(10,11,16,0.95)', border: '1px solid var(--accent)', borderRadius: '12px', color: '#fff', textAlign: 'left' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.55rem', color: 'var(--accent)', letterSpacing: '2px', fontWeight: 900 }}>AI_VIABILITY_SCORE</span>
                        <div style={{ 
                          fontSize: '2.5rem', fontWeight: 900, 
                          color: aiPolicyScore >= 75 ? '#10b981' : aiPolicyScore >= 50 ? '#f59e0b' : '#ef4444', 
                          margin: '0.25rem 0',
                          textShadow: aiPolicyScore >= 75 ? '0 0 20px rgba(16,185,129,0.3)' : aiPolicyScore >= 50 ? '0 0 20px rgba(245,158,11,0.3)' : '0 0 20px rgba(239,68,68,0.3)'
                        }}>
                          {aiPolicyScore}%
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: aiPolicyScore >= 75 ? '#10b981' : aiPolicyScore >= 50 ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          {aiPolicyScore >= 75 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} 
                          {aiPolicyReport?.status} — {aiPolicyScore >= 75 ? 'READY TO IMPLEMENT' : 'NEEDS REVISION'}
                        </div>
                      </div>

                      {/* SCORE BREAKDOWN */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.55rem', color: 'var(--accent)', display: 'block', marginBottom: '0.6rem', fontWeight: 800 }}>VITALITY_GAIN_ANALYSIS</span>
                        {aiPolicyReport?.breakdown?.map((b, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', marginBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.2rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
                            <span style={{ color: b.status === 'pass' ? '#10b981' : '#ef4444', fontWeight: 900 }}>{b.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* REASONS */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.55rem', color: 'var(--accent)', display: 'block', marginBottom: '0.5rem', fontWeight: 800 }}>DETAILED_REASONING</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {aiPolicyReport?.reasons?.map((r, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '6px' }}>
                              <span style={{ color: 'var(--accent)' }}>•</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI SUGGESTIONS SECTION */}
                      <div style={{ background: 'rgba(37,99,235,0.08)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid var(--accent)', marginBottom: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '0.75rem' }}>
                          <Bot size={16} /> NEXUS AI SUGGESTIONS (CITIZEN_FIRST)
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {aiPolicyReport?.suggestions?.map((s, i) => (
                            <div key={i} style={{ fontSize: '0.6rem', color: '#fff', lineHeight: 1.4, display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--accent)', fontWeight: 900 }}>»</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={handleDownloadReport} 
                          style={{ 
                            width: '100%', marginTop: '1rem', 
                            background: 'rgba(255,255,255,0.05)', color: 'var(--accent)', 
                            border: '1px solid var(--accent-glass)', borderRadius: '8px', 
                            padding: '0.6rem', fontSize: '0.6rem', fontWeight: 900, 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                          <FileText size={14} /> DOWNLOAD FULL STRATEGY REPORT (.PDF)
                        </button>
                      </div>

                      {aiPolicyScore >= 75 ? (
                        <button className="action-btn" onClick={() => handleAction(handleBroadcastPolicy)} disabled={isBroadcasting} style={{ width: '100%', background: '#10b981', color: '#fff', fontWeight: 900, letterSpacing: '1px', fontSize: '0.75rem', height: '45px' }}>
                          {isBroadcasting ? <><Loader2 className="spin" size={16} /> DEPLOYING...</> : '🚀 DEPLOY GLOBAL DIRECTIVE'}
                        </button>
                      ) : (
                        <div style={{ 
                          width: '100%', padding: '0.85rem', borderRadius: '10px', 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.6
                        }}>
                          <ShieldAlert size={14} color="#ef4444" />
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.5px' }}>IMPLEMENTATION_LOCKED (MIN. 75%)</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

          {activeCategory === 'social' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <MessageSquare size={14} /> PUBLIC_REQUEST_INBOX
                </span>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>Management of incoming citizen grievances.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {publicRequests.map(req => (
                    <div 
                      key={req.id} 
                      className="report-card widget" 
                      style={{ padding: '1rem', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: '0.2s' }} 
                      onClick={() => handleAction(() => {
                        flyTo(req.lngLat);
                        setSelectedRequest(req);
                      })}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.type.toUpperCase()}</span>
                        <span style={{ 
                          fontSize: '0.5rem', 
                          padding: '3px 8px', 
                          borderRadius: '20px', 
                          background: req.status === 'Resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                          color: req.status === 'Resolved' ? 'var(--success)' : 'var(--danger)',
                          fontWeight: 900
                        }}>{req.status.toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <MapPin size={10} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{req.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-section" style={{ marginTop: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <AlertTriangle size={14} /> LIVE_CITIZEN_COMPLAINTS
                </span>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>Direct reports from Bengaluru citizens with photo evidence.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {citizenComplaints.length === 0 && <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>No new complaints reported.</p>}
                  {citizenComplaints.map(complaint => (
                    <div key={complaint.id} style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                      {complaint.photo && (
                        <div style={{ height: '120px', width: '100%', overflow: 'hidden', borderBottom: '1px solid var(--glass-border)' }}>
                          <img src={complaint.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)' }}>{complaint.type.toUpperCase()}</span>
                          <span style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', background: complaint.status === 'resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: complaint.status === 'resolved' ? 'var(--success)' : 'var(--danger)', fontWeight: 800 }}>
                            {complaint.status.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{complaint.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                          <MapPin size={10} color="var(--text-secondary)" />
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{complaint.location || 'BENGALURU_METRO'}</span>
                        </div>
                        {complaint.status !== 'resolved' && (
                          <button 
                            className="action-btn" 
                            onClick={() => handleResolveComplaint(complaint.id)}
                            style={{ width: '100%', background: 'var(--success)', color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}
                          >
                            <CheckCircle2 size={14} /> MARK AS RESOLVED
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
