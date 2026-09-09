import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, UserX, BarChart2, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Analytics() {
  const [stats, setStats] = useState({
    total_students: 0,
    today_present: 0,
    today_late: 0,
    today_absent: 0,
    attendance_rate: 0,
    department_stats: {}
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/attendance/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Fetch stats error:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* Total Roster */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Total Registered</span>
            <Users color="#06b6d4" size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.total_students}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>Active registered profiles</div>
        </div>

        {/* Present Today */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Present Today</span>
            <UserCheck color="#10b981" size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>{stats.today_present}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px' }}>On time logs</div>
        </div>

        {/* Late Arrival */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Late Arrivals</span>
            <Clock color="#f59e0b" size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>{stats.today_late}</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px' }}>Logged past 09:30 AM</div>
        </div>

        {/* Absent */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Absent Today</span>
            <UserX color="#f43f5e" size={20} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f43f5e' }}>{stats.today_absent}</div>
          <div style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '6px' }}>Unmarked roster</div>
        </div>
      </div>

      {/* Attendance Rate & Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        {/* Attendance Rate Circle */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textCenter: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp color="#8b5cf6" size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Daily Attendance Rate</h3>
          </div>

          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'conic-gradient(#06b6d4 ' + stats.attendance_rate + '%, rgba(255,255,255,0.05) 0)', margin: '10px 0' }}>
            <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: '#0b0f19', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f9fafb' }}>{stats.attendance_rate}%</span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Turnout</span>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart2 color="#06b6d4" size={22} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Department Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(stats.department_stats).length === 0 ? (
              <p style={{ color: '#6b7280', padding: '20px 0' }}>No department data available.</p>
            ) : (
              Object.entries(stats.department_stats).map(([dept, data]) => {
                const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 500 }}>{dept}</span>
                      <span style={{ color: '#9ca3af' }}>{data.present} / {data.total} Present ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease-in-out'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
