import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

const PublicRequestDossier = ({ selectedRequest, setSelectedRequest, setPublicRequests }) => {
  return (
    <AnimatePresence>
      {selectedRequest && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="preloader"
          style={{ zIndex: 4000, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
        >
          <div className="widget" style={{ width: '450px', padding: '2rem', border: '1px solid var(--accent)', background: '#fff', boxShadow: '0 20px 60px rgba(37,99,235,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '2px' }}>{(selectedRequest.type || 'GRIEVANCE').toUpperCase()}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <MapPin size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedRequest.location || 'Bengaluru'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SEVERITY_LVL</span>
                <p style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.2rem', color: selectedRequest.severity === 'High' ? 'var(--danger)' : 'var(--warning)' }}>{(selectedRequest.severity || 'MEDIUM').toUpperCase()}</p>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CURRENT_STATUS</span>
                <p style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.2rem' }}>{(selectedRequest.status || 'PENDING').toUpperCase()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>REPORT_DETAILS</span>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '0.75rem', lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>"{selectedRequest.description}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800 }}>{selectedRequest.reporter}</span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{selectedRequest.timestamp}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.65rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '2rem', padding: '1rem', borderLeft: '3px solid var(--accent)', background: 'rgba(37,99,235,0.02)' }}>
              <strong>AI NEXUS ASSESSMENT:</strong> Proximity analysis suggests localized disruption. Immediate dispatch of maintenance crew recommended to prevent gridlock.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                className="action-btn" 
                onClick={() => {
                  setPublicRequests(prev => prev.map(r => r.id === selectedRequest.id ? {...r, status: 'Resolved'} : r));
                  setSelectedRequest(null);
                }}
                style={{ background: 'var(--accent)', color: '#fff', height: '45px' }}
              >
                RESOLVE ISSUE
              </button>
              <button 
                className="action-btn danger" 
                onClick={() => setSelectedRequest(null)}
                style={{ height: '45px' }}
              >
                DISMISS
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublicRequestDossier;
