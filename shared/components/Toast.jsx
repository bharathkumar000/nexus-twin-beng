import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    error: 'border-rose-500/20 bg-rose-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    info: 'border-blue-500/20 bg-blue-500/5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        minWidth: '320px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      <div style={{
        padding: '0.5rem',
        borderRadius: '10px',
        background: type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
                    type === 'error' ? 'rgba(244, 63, 94, 0.1)' :
                    type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'
      }}>
        {icons[type]}
      </div>
      
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '0.75rem', 
          fontWeight: 800, 
          color: 'var(--text-primary)',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {type === 'success' ? 'COMMAND_SUCCESS' : 
           type === 'error' ? 'SYSTEM_ERROR' : 
           type === 'warning' ? 'ACCESS_WARNING' : 'SYSTEM_INFO'}
        </p>
        <p style={{ 
          fontSize: '0.7rem', 
          color: 'var(--text-secondary)', 
          margin: '0.1rem 0 0 0',
          fontWeight: 600
        }}>
          {message}
        </p>
      </div>

      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: '0.25rem', 
          cursor: 'pointer',
          color: '#94a3b8'
        }}
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: type === 'success' ? '#10b981' : 
                      type === 'error' ? '#f43f5e' :
                      type === 'warning' ? '#f59e0b' : '#3b82f6',
          borderRadius: '0 0 0 16px'
        }}
      />
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
