import React, { useState, useEffect } from 'react';
import { Camera, Shield, FileText, Cpu, ShieldCheck, Sun, Moon } from 'lucide-react';
import LiveFeed from './components/LiveFeed';
import AdminPortal from './components/AdminPortal';
import AttendanceLogs from './components/AttendanceLogs';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu color="#ffffff" size={24} />
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              VisionPulse AI
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', letterSpacing: '0.5px' }}>
              Real-Time AI Facial Attendance System
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(31, 41, 55, 0.4)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('live')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'live' ? '#ffffff' : '#9ca3af',
              background: activeTab === 'live' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Camera size={16} /> Live AI Vision
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'logs' ? '#ffffff' : '#9ca3af',
              background: activeTab === 'logs' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={16} /> Attendance Logs
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'admin' ? '#ffffff' : '#9ca3af',
              background: activeTab === 'admin' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={16} /> Admin Portal
          </button>
        </nav>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px',
              borderRadius: '50%',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Light / Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '20px' }}>
            <ShieldCheck color="#10b981" size={16} />
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Engine Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'live' && <LiveFeed />}
        {activeTab === 'logs' && <AttendanceLogs />}
        {activeTab === 'admin' && <AdminPortal />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 32px', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
        AI Attendance System • Powered by OpenCV, FastAPI & React
      </footer>
    </div>
  );
}
