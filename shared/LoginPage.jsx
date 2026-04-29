'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, Loader2, Zap, ShieldCheck, Fingerprint, Activity, Globe, MessageSquare } from 'lucide-react';
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
    
    // Smooth delay for 'Syncing' feel
    await new Promise(resolve => setTimeout(resolve, 800));

    // LOCAL AUTH BRIDGE - Allows login on Vercel without a backend
    const LOCAL_USERS = {
      '1': { password: '1', role: 'admin', name: 'Master Admin' },
      '2': { password: '2', role: 'user', name: 'Citizen Observer' },
      'admin': { password: 'admin123', role: 'admin', name: 'Command Admin' },
      'user': { password: 'user123', role: 'user', name: 'Citizen Observer' }
    };

    const localUser = LOCAL_USERS[username];
    if (localUser && localUser.password === password) {
      localStorage.setItem('auth_token', `mock-jwt-${localUser.role}`);
      localStorage.setItem('user_role', localUser.role);
      localStorage.setItem('user_name', localUser.name);
      
      if (localUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
      setIsLoading(false);
      return;
    }

    // FALLBACK TO BACKEND (if running locally)
    try {
      const res = await axios.post(`/api/login`, { username, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.user.role);
        localStorage.setItem('user_name', res.data.user.name);
        
        if (res.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      }
    } catch (err) {
      setError('Authorization failed. Check credentials.');
    }
    setIsLoading(false);
  };

  const isAdmin = role === 'admin' || !role;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '900px', 
          background: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)', 
          overflow: 'hidden' 
        }}
      >
        {/* LEFT COLUMN - BLUE */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)', 
          padding: '3rem', 
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
            <div style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              {isAdmin ? <ShieldAlert size={28} /> : <User size={28} />}
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '2px' }}>NEXUS TWIN</span>
          </div>

          <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '1.25rem' }}>URBAN COMMAND</h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: '4rem' }}>
            Access the Bengaluru Digital Twin command core and simulation layers.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><Activity size={16} /></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>REAL-TIME SIMULATION</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><Globe size={16} /></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>GEOSPATIAL ANALYSIS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}><MessageSquare size={16} /></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>CITIZEN FEEDBACK LOOP</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - WHITE */}
        <div style={{ flex: 1.2, padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', letterSpacing: '3px', marginBottom: '0.75rem' }}>
              URBAN PLANNERS AND CITIZENS
            </p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>WELCOME</h2>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: '1.5px' }}>
              NEXUS TWIN SECURE GATEWAY
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>AUTHORIZATION ID</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <User size={16} color="#94a3b8" style={{ marginRight: '0.75rem' }} />
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="ID_IDENTIFIER" 
                  required 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>COMMAND ACCESS KEY</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <Lock size={16} color="#94a3b8" style={{ marginRight: '0.75rem' }} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••••••" 
                  required 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}
                />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{error}</p>}

            <button type="submit" disabled={isLoading} style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s', marginTop: '0.5rem' }}>
              {isLoading ? <Loader2 className="spin" size={18} /> : 'ENTER DASHBOARD →'}
            </button>
          </form>



          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 900, marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '1px' }}>SYSTEM AUTHENTICATION BYPASS</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <div onClick={() => { setUsername('1'); setPassword('1'); }} style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', marginRight: '0.5rem' }}>ADMIN</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>1 | 1</span>
              </div>
              <div onClick={() => { setUsername('2'); setPassword('2'); }} style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', marginRight: '0.5rem' }}>CITIZEN</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>2 | 2</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
