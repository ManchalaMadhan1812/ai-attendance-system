import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AttendanceLogs({ isAdmin = false }) {
  const [logs, setLogs] = useState([]);
  const [department, setDepartment] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/attendance/logs?`;
      if (department !== 'All') url += `department=${department}&`;
      if (startDate) url += `start_date=${startDate}&`;
      if (endDate) url += `end_date=${endDate}&`;

      const res = await axios.get(url);
      setLogs(res.data || []);
    } catch (err) {
      console.error("Fetch attendance logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [department, startDate, endDate]);

  const handleExport = (format) => {
    window.open(`${API_BASE}/api/attendance/export?format=${format}`, '_blank');
  };

  const handleDeleteLog = async (logId) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await axios.delete(`${API_BASE}/api/attendance/logs/${logId}`);
        fetchLogs();
      } catch (err) {
        console.error("Delete log error:", err);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="#06b6d4" size={24} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Attendance Records & History</h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleExport('csv')} className="gradient-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={() => handleExport('excel')} className="gradient-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#9ca3af" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Filters:</span>
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#9ca3af" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
          />
          <span style={{ color: '#9ca3af' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        <button onClick={fetchLogs} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* Logs Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <th style={{ padding: '12px 16px' }}>Log ID</th>
              <th style={{ padding: '12px 16px' }}>Student ID</th>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Department</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Time</th>
              <th style={{ padding: '12px 16px' }}>Confidence</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  {loading ? 'Loading attendance logs...' : 'No attendance logs found matching parameters.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>#{log.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#06b6d4' }}>{log.student_id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{log.student_name}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{log.department}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{log.date}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{log.time}</td>
                  <td style={{ padding: '12px 16px', color: '#10b981' }}>{log.confidence}%</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`status-badge ${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', opacity: 0.8 }}
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
