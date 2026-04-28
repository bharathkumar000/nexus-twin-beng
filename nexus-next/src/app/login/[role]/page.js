'use client';
import React, { useState, use } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage({ params }) {
  const { role } = use(params);
  const router = useRouter();
  const [username, setUsername] = useState('1');
  const [password, setPassword] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.user.role);
        localStorage.setItem('user_name', res.data.user.name);
        router.push(res.data.user.role === 'admin' ? '/admin' : '/user');
      }
    } catch (err) {
      setError('Authorization failed. Check credentials.');
    }
    setIsLoading(false);
  };

  const isAdmin = role === 'admin';

  return (
    <div className="login-root">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card glass-panel"
      >
        <div className="login-header">
          <div className="icon-main" style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}>
            {isAdmin ? <ShieldAlert size={60} color="var(--danger)" /> : <User size={60} color="var(--accent)" />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px' }}>{isAdmin ? 'ADMIN AUTH' : 'CITIZEN LOGIN'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{isAdmin ? 'Secured Strategic Command' : 'BENGALURU PUBLIC PORTAL'}</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label><User size={14} /> IDENTIFIER</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username..." required />
          </div>

          <div className="input-group">
            <label><Lock size={14} /> ACCESS KEY</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>{error}</p>}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="spin" size={20} /> : 'INITIALIZE SESSION'}
          </button>
        </form>

        <button className="back-btn" onClick={() => router.push('/portal')}>
          <ArrowLeft size={16} /> RETURN TO PORTAL
        </button>
      </motion.div>

      <div className="portal-bg">
        <div className="grid-overlay" />
      </div>
    </div>
  );
}
