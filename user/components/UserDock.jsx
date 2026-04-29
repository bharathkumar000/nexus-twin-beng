import React from 'react';
import { Layers, LogOut, MessageSquare, Bell, ShieldAlert } from 'lucide-react';
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
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`dock-btn ${!isSidebarCollapsed && activeSidebarTab === 'complaints' ? 'active' : ''}`}
          onClick={() => { 
            if (!isSidebarCollapsed && activeSidebarTab === 'complaints') {
              setIsSidebarCollapsed(true);
            } else {
              setActiveSidebarTab('complaints'); 
              setIsSidebarCollapsed(false); 
            }
          }}
        >
          <MessageSquare size={18} /><span>REPORT</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`dock-btn ${!isSidebarCollapsed && activeSidebarTab === 'notifications' ? 'active' : ''}`}
          onClick={() => { 
            if (!isSidebarCollapsed && activeSidebarTab === 'notifications') {
              setIsSidebarCollapsed(true);
            } else {
              setActiveSidebarTab('notifications'); 
              setIsSidebarCollapsed(false); 
            }
          }}
        >
          <Bell size={18} /><span>ALERTS</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="dock-btn" 
          onClick={() => {
            const styles = ['satellite', 'hybrid', 'streets'];
            const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
            setCurrentStyle(styles[nextIndex]);
          }}
        >
          <Layers size={18} /><span>{(currentStyle || 'streets').toUpperCase()}</span>
        </motion.button>


        <motion.button 
          whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="dock-btn danger" 
          onClick={handleLogout} 
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={18} /><span>LOGOUT</span>
        </motion.button>
      </div>
    </div>
  );
};

export default UserDock;
