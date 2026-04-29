import React from 'react';
import { Globe, Leaf, ShieldAlert, History, Layers, LogOut } from 'lucide-react';

const UserDock = ({ currentStyle, setCurrentStyle, handleLogout }) => {
  return (
    <div className="bottom-dock">
      <div className="dock-section">
        <button className="dock-btn" onClick={() => {
            const styles = ['satellite', 'hybrid', 'streets'];
            const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
            setCurrentStyle(styles[nextIndex]);
          }}>
          <Layers size={18} /><span>{currentStyle.toUpperCase()}</span>
        </button>
        <button className="dock-btn" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={18} /><span>LOGOUT</span>
        </button>
      </div>
    </div>
  );
};

export default UserDock;
