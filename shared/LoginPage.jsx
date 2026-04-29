'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

const LoginPage = () => {
  const { role } = useParams();
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
      const res = await axios.post(`/api/login`, { username, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.user.role);
        localStorage.setItem('user_name', res.data.user.name);
        router.push('/');
      }
    } catch (err) {
      setError('Authorization failed. Check credentials.');
    }
    setIsLoading(false);
  };

  const isAdmin = role === 'admin' || !role;

  return (
    <div className="login-root">
      <div className="vignette" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="login-card glass-panel"
      >
        <div className="login-header">
          <div className="icon-main pulse-glow" style={{ margin: '0 auto 1.5rem', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
            {isAdmin ? <ShieldAlert size={50} color="var(--danger)" /> : <User size={50} color="var(--accent)" />}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', background: 'linear-gradient(to right, var(--text-primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isAdmin ? 'SECURE_SHELL' : 'CITIZEN_GATE'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', marginTop: '0.4rem', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase' }}>
            {isAdmin ? 'BENGALURU NEXUS ADMIN AUTH' : 'BENGALURU NEXUS PUBLIC ACCESS'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label><User size={12} /> ID_IDENTIFIER</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="0" required />
          </div>

          <div className="input-group" style={{ marginTop: '1.25rem' }}>
            <label><Lock size={12} /> ACCESS_KEY</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" required />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600, marginTop: '1.25rem' }}>{error}</p>}

          <button type="submit" className="login-submit" disabled={isLoading} style={{ marginTop: '1.75rem' }}>
            {isLoading ? <Loader2 className="spin" size={20} /> : 'INITIALIZE SESSION'}
          </button>
        </form>

        <div className="demo-credentials" style={{ marginTop: '2rem', padding: '1.25rem', background: '#f1f5f9', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 900, marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '1.5px', textTransform: 'uppercase' }}>TEST_AUTHORIZATION_BYPASS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div onClick={() => { setUsername('1'); setPassword('1'); }} style={{ cursor: 'pointer', padding: '0.75rem', background: '#fff', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <p style={{ fontSize: '0.55rem', color: 'var(--danger)', fontWeight: 900, letterSpacing: '1px' }}>ADMIN</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 900 }}>1 | 1</p>
            </div>
            <div onClick={() => { setUsername('2'); setPassword('2'); }} style={{ cursor: 'pointer', padding: '0.75rem', background: '#fff', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(37,99,235,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <p style={{ fontSize: '0.55rem', color: 'var(--accent)', fontWeight: 900, letterSpacing: '1px' }}>CITIZEN</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 900 }}>2 | 2</p>
            </div>
          </div>
        </div>

        <button className="back-btn" onClick={() => router.push('/portal')} style={{ marginTop: '1.5rem', opacity: 0.6 }}>
          <ArrowLeft size={14} /> PORTAL_BACKDOOR
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
