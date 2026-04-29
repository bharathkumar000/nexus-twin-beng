import React from 'react';
import { Layers, LogOut, MessageSquare, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDock = ({ 
  currentStyle, 
  setCurrentStyle, 
  handleLogout, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  activeSidebarTab, 
  setActiveSidebarTab 
}) => {
  return (
    <div className="bottom-dock">
      <div className="dock-section">
        <button 
          className={`dock-btn ${!isSidebarCollapsed && activeSidebarTab === 'complaints' ? 'active' : ''}`}
          onClick={() => { setActiveSidebarTab('complaints'); setIsSidebarCollapsed(false); }}
        >
          <motion.div
            animate={!isSidebarCollapsed && activeSidebarTab === 'complaints' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <MessageSquare size={18} /><span>REPORT</span>
          </motion.div>
        </button>

        <button 
          className={`dock-btn ${!isSidebarCollapsed && activeSidebarTab === 'notifications' ? 'active' : ''}`}
          onClick={() => { setActiveSidebarTab('notifications'); setIsSidebarCollapsed(false); }}
        >
          <motion.div
            animate={!isSidebarCollapsed && activeSidebarTab === 'notifications' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <Bell size={18} /><span>ALERTS</span>
          </motion.div>
        </button>

        <button className="dock-btn" onClick={() => {
            const styles = ['satellite', 'hybrid', 'streets'];
            const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
            setCurrentStyle(styles[nextIndex]);
          }}>
          <Layers size={18} /><span>{(currentStyle || 'streets').toUpperCase()}</span>
        </button>

        <button className="dock-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={18} /><span>LOGOUT</span>
        </button>
      </div>
    </div>
  );
};

export default UserDock;
