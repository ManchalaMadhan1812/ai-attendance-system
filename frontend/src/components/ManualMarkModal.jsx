import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, AlertCircle, User } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ManualMarkModal({ onMarked }) {
  const [students, setStudents] = useState([]);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStatus, setManualStatus] = useState('Present');
  const [manualDate, setManualDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchRegisteredStudents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/students`);
        const list = res.data || [];
        setStudents(list);
        if (list.length > 0) {
          setManualStudentId(list[0].student_id);
        }
      } catch (err) {
        console.error("Fetch registered students error:", err);
      }
    };
    fetchRegisteredStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!manualStudentId) {
      setErrorMsg("Please select or enter a valid Student ID.");
      return;
    }

    setLoading(true);
    setMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('student_id', manualStudentId.trim());
    formData.append('status', manualStatus);
    if (manualDate) formData.append('date_str', manualDate);

    try {
      const res = await axios.post(`${API_BASE}/api/attendance/manual-mark`, formData);
      setMsg(res.data.message);
      if (onMarked) onMarked();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to record manual attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <PlusCircle color="#8b5cf6" size={24} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manual Attendance Override</h2>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <CheckCircle size={18} />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Dropdown Selection for Registered Roster */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
            Select Student / Employee from Registered Roster *
          </label>
          {students.length > 0 ? (
            <select
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            >
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name} ({s.student_id}) - {s.department}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g. madhan1812"
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              required
            />
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
            Attendance Status *
          </label>
          <select
            value={manualStatus}
            onChange={(e) => setManualStatus(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          >
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Excused">Excused</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
            Custom Date (Optional)
          </label>
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
        </div>

        <button type="submit" disabled={loading} className="gradient-btn" style={{ marginTop: '8px', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
          <PlusCircle size={18} />
          {loading ? 'Recording Log...' : 'Record Manual Attendance'}
        </button>
      </form>
    </div>
  );
}
