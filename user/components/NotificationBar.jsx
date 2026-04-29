import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, MapPin, Clock, IndianRupee, TrendingUp, FileText } from 'lucide-react';

const NotificationBar = ({ showNotifBar, latestNotif, setShowNotifBar }) => {
  if (!latestNotif) return null;

  return (
    <AnimatePresence>
      {showNotifBar && (
        <motion.div 
          initial={{ x: 400, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="widget"
          style={{ 
            position: 'fixed', top: '1.5rem', right: '1.5rem', width: '360px', zIndex: 1000, 
            borderLeft: '4px solid var(--accent)', 
            padding: 0, 
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'rgba(37,99,235,0.05)',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={12} color="#fff" />
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 900, letterSpacing: '1.5px' }}>NEW POLICY BROADCAST</span>
            </div>
            <button onClick={() => setShowNotifBar(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={12} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1rem' }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <FileText size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                {latestNotif.policy_title || latestNotif.policy}
              </h4>
            </div>

            {/* Metadata Grid */}
            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', 
              background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IndianRupee size={10} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>BUDGET</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: 700 }}>{latestNotif.price || 'N/A'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={10} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>ZONE</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: 700 }}>{latestNotif.location || 'N/A'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={10} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>TIMELINE</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: 700 }}>{latestNotif.duration || 'N/A'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <TrendingUp size={10} color="var(--success)" />
                <div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>AI SCORE</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 700 }}>{latestNotif.prediction || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Purpose */}
            {latestNotif.purpose && (
              <div style={{ 
                padding: '0.65rem', 
                background: 'rgba(37,99,235,0.04)', 
                borderRadius: '8px', 
                borderLeft: '3px solid var(--accent)',
                fontSize: '0.65rem', 
                color: 'var(--text-secondary)', 
                fontStyle: 'italic', 
                lineHeight: '1.5' 
              }}>
                "{latestNotif.purpose}"
              </div>
            )}

            {/* Timestamp */}
            <div style={{ marginTop: '0.5rem', fontSize: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
              {latestNotif.timestamp ? new Date(latestNotif.timestamp).toLocaleString() : 'Just now'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBar;
