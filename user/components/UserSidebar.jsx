import { Terminal, Leaf, ShieldAlert, History, Globe, X, Camera, MessageSquare, AlertCircle, Bell } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const UserSidebar = ({ 
  handleFetchSentiment, 
  isSentimentLoading, 
  aqiEnabled, 
  setAqiEnabled, 
  greenEnabled, 
  setGreenEnabled,
  floodLevel,
  setFloodLevel,
  isRainy,
  setIsRainy,
  timelineYear,
  setTimelineYear,
  isSidebarCollapsed = false,
  setIsSidebarCollapsed = () => {},
  handleFileComplaint = async () => {},
  notifications = []
}) => {
  const [complaintForm, setComplaintForm] = useState({ type: 'Water Supply', description: '', photo: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const onSubmit = async () => {
    if (!complaintForm.description) return alert("Please provide a description.");
    setIsSubmitting(true);
    const success = await handleFileComplaint(complaintForm);
    if (success) {
      setComplaintForm({ type: 'Water Supply', description: '', photo: null });
    }
    setIsSubmitting(false);
  };
  return (
    <div className={`side-panel ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="scanline" />
      <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Globe size={24} color="var(--accent)" />
          <div className="header-text">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>CITIZEN NEXUS</h2>
            <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>PUBLIC_CORE_v4.0</span>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarCollapsed(true)}
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

      <div className="widget content-widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div className="scroll-area" style={{ flex: 1, padding: '1rem' }}>
          
          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={14} /> COMMUNITY SENTIMENT
            </span>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,242,255,0.02)', borderRadius: '12px', border: '1px solid var(--accent-glass)' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Real-time analysis of city-wide mood and public discourse.</p>
              <button className="action-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading}>
                {isSentimentLoading ? <Loader2 className="spin" size={16} /> : 'ANALYZE COMMUNITY MOOD'}
              </button>
            </div>
          </div>

          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Leaf size={14} /> ENVIRONMENTAL TELEMETRY
            </span>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <div className="toggle-row"><span>AIR_QUALITY_INDEX (AQI)</span><button className={`toggle-sm ${aqiEnabled ? 'on' : ''}`} onClick={() => setAqiEnabled(!aqiEnabled)} /></div>
              <div className="toggle-row" style={{ marginTop: '1rem' }}><span>VEGETATION_DENSITY (NDVI)</span><button className={`toggle-sm ${greenEnabled ? 'on' : ''}`} onClick={() => setGreenEnabled(!greenEnabled)} /></div>
            </div>
          </div>

          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={14} /> PUBLIC SAFETY MODEL
            </span>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
              <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>FLOOD_RISK_THRESHOLD: {floodLevel}M</label>
              <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(239,68,68,0.2)' }} />
              <div className="toggle-row" style={{ marginTop: '1rem' }}><span>PRECIPITATION_SIM</span><button className={`toggle-sm ${isRainy ? 'on' : ''}`} onClick={() => setIsRainy(!isRainy)} /></div>
            </div>
          </div>

          <div className="panel-section" style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, fontSize: '0.6rem', letterSpacing: '1px' }}>
              <MessageSquare size={14} strokeWidth={2.5} /> CITIZEN_REPORT_HUB
            </span>
            <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.02) 100%)', borderRadius: '16px', border: '1px solid var(--accent-glass)', boxShadow: '0 8px 32px rgba(37,99,235,0.05)' }}>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>CATEGORY_SPECIFICATION</label>
                <select 
                  className="search-field"
                  value={complaintForm.type}
                  onChange={e => setComplaintForm({...complaintForm, type: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s' }}
                >
                  <option>Water Supply</option>
                  <option>Power Outage</option>
                  <option>Road Pothole</option>
                  <option>Waste Management</option>
                  <option>Public Safety</option>
                  <option>Others</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>VISUAL_EVIDENCE (CAPTURE/UPLOAD)</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    height: '100px', background: 'rgba(255,255,255,0.8)', border: '2px dashed var(--accent-glass)', 
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--accent-glass)'}
                >
                  {complaintForm.photo ? (
                    <img src={URL.createObjectURL(complaintForm.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <Camera size={24} color="var(--accent)" style={{ opacity: 0.6, marginBottom: '0.25rem' }} />
                      <p style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>ATTACH_MEDIA</p>
                    </div>
                  )}
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={e => setComplaintForm({...complaintForm, photo: e.target.files[0]})} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>DETAILED_SYNOPSIS</label>
                <textarea 
                  className="search-field"
                  placeholder="Describe the urban anomaly..."
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                  style={{ width: '100%', minHeight: '90px', padding: '0.75rem', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
                />
              </div>

              <button 
                className="action-btn" 
                onClick={onSubmit} 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', background: 'var(--accent)', color: '#fff', 
                  borderRadius: '12px', padding: '0.85rem', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px',
                  boxShadow: '0 4px 15px rgba(37,99,235,0.2)', transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? <Loader2 className="spin" size={16} /> : <><AlertCircle size={16} /> SUBMIT_REPORT</>}
              </button>
            </div>
          </div>

          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, fontSize: '0.6rem', letterSpacing: '1px' }}>
              <Bell size={14} strokeWidth={2.5} /> NEXUS_DIRECTIVE_FEED
            </span>
            <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }} className="scroll-area">
              {notifications.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4 }}>
                  <Bell size={24} style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.6rem', fontWeight: 800 }}>NO_ACTIVE_DIRECTIVES</p>
                </div>
              )}
              {notifications.map(n => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={n.id} 
                  style={{ 
                    padding: '1.25rem', background: 'rgba(255,255,255,0.98)', 
                    border: '1px solid var(--glass-border)', borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    borderLeft: `4px solid ${n.policy_title?.includes('RESOLVED') ? 'var(--success)' : 'var(--accent)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-primary)', flex: 1, lineHeight: 1.3 }}>{n.policy_title || n.policy}</span>
                    <span style={{ fontSize: '0.5rem', fontWeight: 900, color: 'var(--text-secondary)', opacity: 0.6 }}>{n.duration || 'IMMEDIATE'}</span>
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{n.purpose}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <TrendingUp size={10} color="var(--success)" />
                      <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--success)' }}>{n.prediction || 'AI_SAFE'}</span>
                    </div>
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.5 }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <span className="section-label" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={14} /> BENGALURU LEGACY_TRACK
            </span>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245,158,11,0.02)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)' }}>
              <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--warning)' }}>CHRONOLOGICAL_YEAR: {timelineYear}</label>
              <input type="range" min="1920" max="2024" step="10" value={timelineYear} onChange={e => setTimelineYear(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(245,158,11,0.2)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
