import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, Bot, Hammer, Globe, MessageSquare, 
  History, Target, Send, Megaphone, Loader2, Terminal
} from 'lucide-react';
import { ASSET_TEMPLATES } from '../utils/constants';

const AdminSidebar = ({ 
  activeCategory, 
  globalConfidence, 
  handleAiSuggest, 
  aiSuggestion, 
  timeHorizon, 
  setTimeHorizon, 
  activePriority, 
  setActivePriority,
  advisorLog,
  advisorQuery,
  setAdvisorQuery,
  handleAskAdvisor,
  policyForm,
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
  handleFetchSentiment,
  isSentimentLoading,
  publicRequests,
  setSelectedRequest,
  mapRef,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}) => {
  const handleAction = (callback) => {
    if (callback) callback();
  };

  return (
    <div className={`side-panel ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
        <ShieldAlert size={24} color="var(--accent)" />
        <div className="header-text">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>ADMIN NEXUS</h2>
          <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>CMD_ROOT_ACCESS_v4.0</span>
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
              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Activity size={14} /> DECISION CONFIDENCE METER</span>
                <div className="widget" style={{ padding: '1.5rem', background: 'rgba(37,99,235,0.03)', border: '1px solid var(--accent-glass)', textAlign: 'center', marginTop: '1rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: globalConfidence > 70 ? 'var(--success)' : globalConfidence > 40 ? 'var(--warning)' : 'var(--danger)' }}>{globalConfidence}%</div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', opacity: 0.8 }}>{globalConfidence > 70 ? '🟢 SAFE_STATUS' : globalConfidence > 40 ? '🟡 MODERATE_RISK' : '🔴 CRITICAL_RISK'}</span>
                  <button className="action-btn" onClick={() => handleAction(handleAiSuggest)} style={{ marginTop: '1.5rem', background: 'var(--accent)', color: '#fff' }}>AI: SUGGEST BEST PLAN</button>
                  {aiSuggestion && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(37,99,235,0.1)', borderRadius: '10px', fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' }}>" {aiSuggestion.text} "</motion.div>
                  )}
                </div>
              </div>

              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><History size={14} /> TIME TRAVEL HORIZON</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {['past', 'present', 'future'].map(t => (
                    <button key={t} onClick={() => handleAction(() => setTimeHorizon(t))} className={`tab-btn ${timeHorizon === t ? 'active' : ''}`} style={{ flex: 1, fontSize: '0.6rem' }}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Target size={14} /> STRATEGIC PRIORITY</span>
                <select value={activePriority} onChange={e => setActivePriority(e.target.value)} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                  <option value="balanced">BALANCED (CITY STABILITY)</option>
                  <option value="safety">MINIMIZE ACCIDENTS (EMS FOCUS)</option>
                  <option value="economy">MAXIMIZE GROWTH (TRAFFIC PRIORITY)</option>
                  <option value="green">NET ZERO (EMISSIONS FOCUS)</option>
                </select>
              </div>
            </motion.div>
          )}

          {activeCategory === 'directives' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
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

              {/* 6. GLOBAL BROADCAST */}
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <Megaphone size={14} /> STRATEGIC DIRECTIVE
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', padding: '1.25rem', background: 'rgba(37,99,235,0.02)', borderRadius: '12px', border: '1px solid var(--accent-glass)' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>DIRECTIVE_TITLE</label>
                    <input className="chat-mini" placeholder="e.g. MONSOON_ALERT_V4" value={policyForm.policy} onChange={e => setPolicyForm({...policyForm, policy: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>URBAN_IMPACT_RATIONALE</label>
                    <textarea className="chat-mini" placeholder="State the purpose of this broadcast..." value={policyForm.purpose} onChange={e => setPolicyForm({...policyForm, purpose: e.target.value})} style={{ width: '100%', minHeight: '80px', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', resize: 'none' }} />
                  </div>
                  <button className="action-btn" onClick={() => handleAction(handleBroadcastPolicy)} disabled={isBroadcasting} style={{ background: 'var(--accent)', marginTop: '0.5rem' }}>
                    {isBroadcasting ? <Loader2 className="spin" size={14} /> : 'DEPLOY CITY_WIDE DIRECTIVE'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeCategory === 'builder' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ 
                background: '#C6C6C6', 
                borderTop: '4px solid #FFFFFF', 
                borderLeft: '4px solid #FFFFFF', 
                borderBottom: '4px solid #555555', 
                borderRight: '4px solid #555555',
                padding: '1rem',
                marginBottom: '2rem',
                fontFamily: '"Courier New", Courier, monospace',
                imageRendering: 'pixelated',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                <div style={{ 
                  color: '#373737', 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textShadow: '1px 1px 0px rgba(255,255,255,0.8)'
                }}>
                  <Hammer size={18} /> INVENTORY
                </div>
                
                {['Buildings', 'Transport', 'Energy'].map(groupName => {
                  const assets = Object.entries(ASSET_TEMPLATES).filter(([_, a]) => a.group === groupName);
                  if (assets.length === 0) return null;
                  
                  // Calculate padding rows to make it look full
                  const totalSlots = Math.max(8, Math.ceil(assets.length / 4) * 4);
                  const emptySlots = totalSlots - assets.length;

                  return (
                    <div key={groupName} style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ 
                        fontSize: '0.75rem', 
                        color: '#373737', 
                        marginBottom: '0.5rem',
                        textShadow: '1px 1px 0px rgba(255,255,255,0.8)',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}>{groupName.toUpperCase()}</h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '2px',
                        background: '#8B8B8B',
                        padding: '6px',
                        borderTop: '3px solid #373737',
                        borderLeft: '3px solid #373737',
                        borderBottom: '3px solid #FFFFFF',
                        borderRight: '3px solid #FFFFFF'
                      }}>
                        {assets.map(([name, asset]) => {
                          const isActive = assetToPlace === name;
                          return (
                            <div 
                              key={name} 
                              draggable 
                              onDragStart={(e) => onDragStart(e, name)} 
                              onClick={() => handleAction(() => setAssetToPlace(name))} 
                              title={name.toUpperCase()}
                              style={{ 
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'grab', 
                                background: '#8B8B8B',
                                borderTop: isActive ? '2px solid #FFFFFF' : '2px solid #373737',
                                borderLeft: isActive ? '2px solid #FFFFFF' : '2px solid #373737',
                                borderBottom: isActive ? '2px solid #FFFFFF' : '2px solid #FFFFFF',
                                borderRight: isActive ? '2px solid #FFFFFF' : '2px solid #FFFFFF',
                                outline: isActive ? '2px solid #FFFFFF' : 'none',
                                outlineOffset: '-2px',
                                position: 'relative',
                                zIndex: isActive ? 10 : 1
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = '#999999';
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = '#8B8B8B';
                              }}
                            >
                              {isActive && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.2)' }} />}
                              <div style={{ 
                                color: '#373737', 
                                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                                transition: 'transform 0.1s',
                                filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.5))'
                              }}>
                                {asset.icon}
                              </div>
                            </div>
                          );
                        })}
                        {Array.from({ length: emptySlots }).map((_, i) => (
                          <div key={`empty-${i}`} style={{
                            aspectRatio: '1/1',
                            background: '#8B8B8B',
                            borderTop: '2px solid #373737',
                            borderLeft: '2px solid #373737',
                            borderBottom: '2px solid #FFFFFF',
                            borderRight: '2px solid #FFFFFF'
                          }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeCategory === 'crisis' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><ShieldAlert size={14} /> CRISIS_RESPONSE_HUB</span>
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>SIMULATED_FLOOD_DEPTH: {floodLevel}M</label>
                  <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(239,68,68,0.2)' }} />
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button className={`tab-btn ${showHydrants ? 'active' : ''}`} onClick={() => handleAction(() => setShowHydrants(!showHydrants))} style={{ fontSize: '0.6rem' }}>HYDRANTS</button>
                    <button className={`tab-btn ${isEmergencyActive ? 'active' : ''}`} onClick={() => handleAction(() => setIsEmergencyActive(!isEmergencyActive))} style={{ fontSize: '0.6rem' }}>EMS_UNIT</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeCategory === 'social' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <Heart size={14} /> CITIZEN SENTIMENT PULSE
                </span>
                <div className="widget" style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(239,68,68,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <Globe size={40} color="var(--accent)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>GLOBAL_SOCIAL_METRICS</h3>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Analyze real-time community feedback across Bengaluru wards.</p>
                  <button className="action-btn" onClick={() => handleAction(handleFetchSentiment)} disabled={isSentimentLoading}>
                    {isSentimentLoading ? <Loader2 className="spin" size={16} /> : 'INITIALIZE HEATMAP'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeCategory === 'reports' && (
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
                        mapRef.current.flyTo({ center: req.lngLat, zoom: 17, pitch: 60 });
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
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
