import React, { useState } from 'react';
import { Lock, Shield, AlertCircle, UserPlus, BarChart2, PlusCircle, FileText, LogOut, School, GraduationCap } from 'lucide-react';
import Registration from './Registration';
import Analytics from './Analytics';
import ManualMarkModal from './ManualMarkModal';
import AttendanceLogs from './AttendanceLogs';

export default function AdminPortal() {
  const [role, setRole] = useState('school'); // 'school' | 'teacher'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('registration');

  const handleLogin = (e) => {
    e.preventDefault();
    // School Admin Credentials: school / admin123
    // Teacher Panel Credentials: teacher / teacher123
    if (role === 'school' && username.trim() === 'school' && password === 'admin123') {
      setIsAuthenticated(true);
      setErrorMsg('');
      setActiveAdminTab('registration');
    } else if (role === 'teacher' && username.trim() === 'teacher' && password === 'teacher123') {
      setIsAuthenticated(true);
      setErrorMsg('');
      setActiveAdminTab('analytics');
    } else {
      setErrorMsg(`Invalid ${role === 'school' ? 'School Admin' : 'Teacher'} Credentials. Check details below.`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <div className="glass-panel" style={{ width: '440px', padding: '32px' }}>
          {/* Role Selection Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => { setRole('school'); setErrorMsg(''); setUsername(''); setPassword(''); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: role === 'school' ? '#ffffff' : '#9ca3af',
                background: role === 'school' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <School size={16} /> School Admin
            </button>

            <button
              onClick={() => { setRole('teacher'); setErrorMsg(''); setUsername(''); setPassword(''); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: role === 'teacher' ? '#ffffff' : '#9ca3af',
                background: role === 'teacher' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <GraduationCap size={16} /> Teacher Panel
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: role === 'school' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '14px', borderRadius: '50%', marginBottom: '12px' }}>
              {role === 'school' ? <School color="#ffffff" size={28} /> : <GraduationCap color="#ffffff" size={28} />}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              {role === 'school' ? 'School Administration Login' : 'Teacher Portal Login'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>
              {role === 'school' ? 'Student/User registration & roster management' : 'Class analytics, manual attendance & log management'}
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Username</label>
              <input
                type="text"
                placeholder={role === 'school' ? 'Username (school)' : 'Username (teacher)'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                required
              />
            </div>

            <button type="submit" className="gradient-btn" style={{ justifyContent: 'center', marginTop: '8px', background: role === 'teacher' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : undefined }}>
              <Shield size={18} />
              Login as {role === 'school' ? 'School Admin' : 'Teacher'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', marginTop: '20px' }}>
            {role === 'school' ? (
              <span>School Admin Credentials: <b>school</b> / <b>admin123</b></span>
            ) : (
              <span>Teacher Panel Credentials: <b>teacher</b> / <b>teacher123</b></span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Session Header Bar */}
      <div className="glass-card" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {role === 'school' ? <School color="#10b981" size={22} /> : <GraduationCap color="#8b5cf6" size={22} />}
            <div>
              <div style={{ fontWeight: 700, color: role === 'school' ? '#10b981' : '#8b5cf6', fontSize: '0.95rem' }}>
                {role === 'school' ? 'School Admin Panel' : 'Teacher Dashboard Portal'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Authenticated Session Active</div>
            </div>
          </div>

          {/* Admin Navigation Pills */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {role === 'school' ? (
              <button
                onClick={() => setActiveAdminTab('registration')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: activeAdminTab === 'registration' ? '#ffffff' : '#9ca3af',
                  background: activeAdminTab === 'registration' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserPlus size={16} /> User Registration & Roster
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveAdminTab('analytics')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: activeAdminTab === 'analytics' ? '#ffffff' : '#9ca3af',
                    background: activeAdminTab === 'analytics' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <BarChart2 size={16} /> Analytics & Stats
                </button>

                <button
                  onClick={() => setActiveAdminTab('manual_mark')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: activeAdminTab === 'manual_mark' ? '#ffffff' : '#9ca3af',
                    background: activeAdminTab === 'manual_mark' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <PlusCircle size={16} /> Manual Mark
                </button>

                <button
                  onClick={() => setActiveAdminTab('manage_logs')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: activeAdminTab === 'manage_logs' ? '#ffffff' : '#9ca3af',
                    background: activeAdminTab === 'manage_logs' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FileText size={16} /> Log Management
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Render Active Admin View */}
      {role === 'school' && activeAdminTab === 'registration' && <Registration />}
      {role === 'teacher' && activeAdminTab === 'analytics' && <Analytics />}
      {role === 'teacher' && activeAdminTab === 'manual_mark' && <ManualMarkModal />}
      {role === 'teacher' && activeAdminTab === 'manage_logs' && <AttendanceLogs isAdmin={true} />}
    </div>
  );
}
