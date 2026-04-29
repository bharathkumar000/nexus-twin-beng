import { MapPin, Camera, MessageSquare, AlertCircle, Bell, TrendingUp, RefreshCw, X, ShieldAlert, Globe, CheckCircle2, Clock, ArrowUpCircle, Search, FileText, User, Coins } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserSidebar = ({ 
  isSidebarCollapsed = false,
  setIsSidebarCollapsed = () => {},
  handleFileComplaint = async () => {},
  notifications = [],
  myReports = [],
  handleUpvote = () => {},
  activeTab = 'notifications', // Default tab
  showToast = () => {}
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Sync internal state with prop
  React.useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [complaintForm, setComplaintForm] = useState({ 
    type: 'Water Supply', 
    description: '', 
    photo: null,
    location: null 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef(null);

  const handleCaptureLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lngLat = { lng: position.coords.longitude, lat: position.coords.latitude };
        setComplaintForm(prev => ({
          ...prev,
          location: lngLat
        }));
        setIsLocating(false);
        showToast("LOCATION_SYNCED: Coordinates captured.", "success");
      }, (error) => {
        showToast("GEOLOCATION_FAILED: " + error.message, "error");
        setIsLocating(false);
      });
    }
  };

  const onSubmit = async () => {
    if (!complaintForm.description) return showToast("Please provide a description.", "warning");
    if (!complaintForm.location) return showToast("Please tag your location.", "warning");
    setIsSubmitting(true);
    const success = await handleFileComplaint(complaintForm);
    if (success) {
      setComplaintForm({ type: 'Water Supply', description: '', photo: null, location: null });
    }
    setIsSubmitting(false);
  };

  const filteredNotifications = notifications.filter(n => 
    (n.policy_title || n.policy)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = myReports.filter(r => 
    r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`side-panel ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="scanline" />
      <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Globe size={24} color="var(--accent)" />
          <div className="header-text">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>CITIZEN NEXUS</h2>
            <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>PUBLIC_CORE_v5.0</span>
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
            cursor: 'pointer'
          }}
        >
          <X size={16} color="var(--text-secondary)" />
        </button>
      </div>

      <div className="widget content-widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '1rem' }}>
        <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', scrollbarWidth: 'thin' }}>

          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text"
              placeholder="Search Reports & Directives..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700 }}
            />
          </div>
          
          {currentTab === 'notifications' && (
          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, fontSize: '0.6rem', letterSpacing: '1px' }}>
              <Bell size={14} strokeWidth={2.5} /> NEXUS_DIRECTIVE_FEED
            </span>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredNotifications.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4 }}>
                  <Bell size={24} style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.6rem', fontWeight: 800 }}>NO_ACTIVE_DIRECTIVES</p>
                </div>
              )}
              {filteredNotifications.map(n => (
                <motion.div 
                  whileHover={{ scale: 1.02, x: 5 }}
                  onClick={() => setSelectedNotif(n)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={n.id} 
                  style={{ 
                    padding: '1rem', background: 'rgba(255,255,255,0.98)', 
                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    borderLeft: `4px solid ${n.policy_title?.includes('RESOLVED') ? 'var(--success)' : 'var(--accent)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>{n.policy_title || n.policy}</span>
                    <span style={{ fontSize: '0.45rem', fontWeight: 900, color: 'var(--text-secondary)', opacity: 0.6, whiteSpace: 'nowrap' }}>{n.duration || 'NEW'}</span>
                  </div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0.5rem 0' }}>{n.purpose}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <TrendingUp size={10} color="var(--success)" />
                      <span style={{ fontSize: '0.5rem', fontWeight: 900, color: 'var(--success)' }}>{n.prediction || 'AI_SAFE'}</span>
                    </div>
                    <span style={{ fontSize: '0.45rem', fontWeight: 800, color: 'var(--accent)' }}>VIEW_DETAILS →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          )}

          {currentTab === 'complaints' && (
          <>
          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, fontSize: '0.6rem', letterSpacing: '1px' }}>
              <MessageSquare size={14} strokeWidth={2.5} /> COMPLAINT_INITIALIZATION_BOX
            </span>
            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(255,255,255,0) 100%)', borderRadius: '20px', border: '1px solid var(--accent-glass)' }}>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>ANOMALY_CATEGORY</label>
                <select 
                  className="search-field"
                  value={complaintForm.type}
                  onChange={e => setComplaintForm({...complaintForm, type: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  <option>Water Supply Failure</option>
                  <option>Grid Power Outage</option>
                  <option>Urban Infrastructure Damage</option>
                  <option>Waste Disposal Violation</option>
                  <option>Public Safety Hazard</option>
                  <option>Emergency Services Request</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>GEOGRAPHIC_TAGGING</label>
                <button 
                  onClick={handleCaptureLocation}
                  disabled={isLocating}
                  style={{ 
                    width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)',
                    background: complaintForm.location ? 'rgba(16,185,129,0.1)' : '#fff',
                    color: complaintForm.location ? 'var(--success)' : 'var(--text-primary)',
                    fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  {isLocating ? <RefreshCw className="spin" size={14} /> : <><MapPin size={14} /> {complaintForm.location ? 'LOCATION_SYNCED' : 'CAPTURE_CURRENT_LOCATION'}</>}
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>VISUAL_EVIDENCE</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    height: '110px', background: '#fff', border: '2px dashed var(--accent-glass)', 
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: 'pointer', overflow: 'hidden'
                  }}
                >
                  {complaintForm.photo ? (
                    <img src={URL.createObjectURL(complaintForm.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <Camera size={24} color="var(--accent)" style={{ marginBottom: '0.25rem' }} />
                      <p style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>OPEN_CAMERA / UPLOAD</p>
                    </div>
                  )}
                  <input type="file" hidden ref={fileInputRef} accept="image/*" capture="environment" onChange={e => setComplaintForm({...complaintForm, photo: e.target.files[0]})} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>ISSUE_SYNOPSIS</label>
                <textarea 
                  className="search-field"
                  placeholder="Provide precise details of the anomaly..."
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                  style={{ width: '100%', minHeight: '90px', padding: '0.75rem', background: '#fff', borderRadius: '10px', fontSize: '0.75rem', resize: 'none' }}
                />
              </div>

              <button 
                className="action-btn" 
                onClick={onSubmit} 
                disabled={isSubmitting}
                style={{ width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: '12px', padding: '1rem', fontWeight: 900, letterSpacing: '1px' }}
              >
                {isSubmitting ? <Loader2 className="spin" size={16} /> : <><AlertCircle size={16} /> BROADCAST_REPORT</>}
              </button>
            </div>
          </div>

          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, fontSize: '0.6rem', letterSpacing: '1px' }}>
              <CheckCircle2 size={14} strokeWidth={2.5} /> PUBLIC_REPORTS_&_UPVOTING
            </span>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredReports.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4 }}>
                  <MessageSquare size={24} style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.6rem', fontWeight: 800 }}>NO_REPORTS_FOUND</p>
                </div>
              )}
              {filteredReports.map(report => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={report.id} 
                  style={{ 
                    padding: '1rem', background: 'rgba(255,255,255,0.98)', 
                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    borderLeft: `4px solid ${report.status === 'resolved' ? 'var(--success)' : 'var(--warning, #f59e0b)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, flex: 1 }}>{report.type}</span>
                    <span style={{ 
                      fontSize: '0.5rem', 
                      fontWeight: 900, 
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: report.status === 'resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: report.status === 'resolved' ? 'var(--success)' : '#f59e0b',
                      whiteSpace: 'nowrap' 
                    }}>
                      {(report.status || 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={10} />
                    <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>{report.location}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                      <Clock size={10} />
                      <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>{new Date(report.timestamp).toLocaleString()}</span>
                    </div>

                    {report.status !== 'resolved' && (
                      <button 
                        onClick={() => handleUpvote(report.id)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          background: 'rgba(37,99,235,0.1)', color: 'var(--accent)',
                          border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px',
                          padding: '0.35rem 0.6rem', fontSize: '0.6rem', fontWeight: 800,
                          cursor: 'pointer', transition: 'background 0.2s'
                        }}
                      >
                        <ArrowUpCircle size={14} />
                        <span>{report.upvotes || 1}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          </>
          )}
      </div>
    </div>

    {/* DETAILED NOTIFICATION OVERLAY (Moved outside scroll-area) */}
      <AnimatePresence>
        {selectedNotif && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            style={{ 
              position: 'absolute', top: '1rem', left: '1rem', right: '1rem', bottom: '1rem',
              background: '#fff', borderRadius: '24px', zIndex: 3000,
              boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
              padding: '2rem', display: 'flex', flexDirection: 'column',
              border: '1px solid var(--accent-glass)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '2px' }}>POLICY_DOSSIER</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{selectedNotif.policy_title || selectedNotif.policy}</h3>
              </div>
              <button onClick={() => setSelectedNotif(null)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                {selectedNotif.purpose}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(37,99,235,0.03)', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Coins size={14} color="var(--accent)" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)' }}>BUDGET_ALLOCATION</span>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{selectedNotif.budget || '₹1,200 Cr'}</span>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(37,99,235,0.03)', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Clock size={14} color="var(--accent)" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)' }}>IMPLEMENTATION_TIME</span>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{selectedNotif.duration || '24 MONTHS'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <MapPin size={18} color="var(--accent)" />
                  <div>
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', display: 'block' }}>PRIMARY_LOCATION</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedNotif.location || 'Multiple Zones'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <User size={18} color="var(--accent)" />
                  <div>
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', display: 'block' }}>OFFICER_IN_CHARGE</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedNotif.incharge || 'Dept. of Infrastructure'}</span>
                  </div>
                </div>
              </div>

              {selectedNotif.pdf_url && (
                <div style={{ marginTop: '2rem' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>DOCUMENTATION_ATTACHED</span>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                    background: '#fff', border: '2px dashed var(--glass-border)', borderRadius: '16px',
                    cursor: 'pointer'
                  }}>
                    <FileText size={24} color="#ef4444" />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-primary)', display: 'block' }}>POLICY_WHITE_PAPER.pdf</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>2.4 MB • PDF Document</span>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)' }}>DOWNLOAD</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setSelectedNotif(null); showToast("Directive supported.", "success"); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
                SUPPORT POLICY
              </button>
              <button onClick={() => { setSelectedNotif(null); showToast("Clarification requested.", "info"); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
                REQUEST CLARIFICATION
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSidebar;
