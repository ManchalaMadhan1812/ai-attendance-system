import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit, Search, CheckCircle, AlertCircle, Upload, Shield, X, Save } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Registration() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration Form State
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('Computer Science');
  const [editEmail, setEditEmail] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  
  const [msg, setMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/students`);
      setStudents(res.data || []);
    } catch (err) {
      console.error("Fetch students error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!studentId || !name || !selectedFile) {
      setErrorMsg("Student ID, Name, and Face Image are required.");
      return;
    }

    setLoading(true);
    setMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('name', name);
    formData.append('department', department);
    formData.append('email', email);
    formData.append('file', selectedFile);

    try {
      await axios.post(`${API_BASE}/api/students/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg("Student registered and face embedding index created successfully!");
      setStudentId('');
      setName('');
      setEmail('');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchStudents();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to register student.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditDepartment(student.department || 'Computer Science');
    setEditEmail(student.email || '');
    setEditFile(null);
    setEditPreviewUrl(student.image_path ? `${API_BASE}/${student.image_path}` : null);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('department', editDepartment);
    formData.append('email', editEmail);
    if (editFile) {
      formData.append('file', editFile);
    }

    try {
      await axios.put(`${API_BASE}/api/students/${editingStudent.student_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(`Student profile ${editingStudent.student_id} updated successfully!`);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to update student profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete student ${id}?`)) {
      try {
        await axios.delete(`${API_BASE}/api/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', position: 'relative' }}>
      {/* Registration Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <UserPlus color="#06b6d4" size={24} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Register New User</h2>
        </div>

        {msg && (
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
            <CheckCircle size={18} />
            <span>{msg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
              Student / Employee ID *
            </label>
            <input
              type="text"
              placeholder="e.g. STU-1001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Alice Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. alice@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
          </div>

          {/* Photo Upload Zone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>
              Facial Photo Profile *
            </label>
            <div style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
              {previewUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #06b6d4' }} />
                  <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>Photo Selected</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#9ca3af' }}>
                  <Upload size={32} color="#06b6d4" />
                  <span style={{ fontSize: '0.85rem' }}>Upload facial photo (JPG / PNG)</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="gradient-btn" style={{ marginTop: '8px', justifyContent: 'center' }}>
            <Shield size={18} />
            {loading ? 'Processing Face Embeddings...' : 'Register Profile'}
          </button>
        </form>
      </div>

      {/* Edit Student Modal Overlay */}
      {editingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel" style={{ width: '440px', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(6,182,212,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit color="#06b6d4" size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Edit Student Profile</h3>
              </div>
              <button onClick={() => setEditingStudent(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Student ID (Read Only)</label>
                <input
                  type="text"
                  value={editingStudent.student_id}
                  disabled
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#06b6d4', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Department</label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Update Face Photo (Optional)</label>
                <div style={{ border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center', position: 'relative' }}>
                  {editPreviewUrl && (
                    <img src={editPreviewUrl} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 6px auto', display: 'block', border: '2px solid #06b6d4' }} />
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Click to replace photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingStudent(null)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="gradient-btn" style={{ flex: 1, justifyContent: 'center' }}>
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student List View */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registered Roster ({students.length})</h2>
          
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', maxHeight: '520px', overflowY: 'auto' }}>
          {filteredStudents.length === 0 ? (
            <p style={{ color: '#6b7280', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No registered users found.</p>
          ) : (
            filteredStudents.map(student => (
              <div key={student.student_id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textCenter: 'center', position: 'relative' }}>
                {/* Action Buttons: Edit & Delete */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(student)}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', opacity: 0.8 }}
                    title="Edit Student Profile"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(student.student_id)}
                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', opacity: 0.8 }}
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <img
                  src={student.image_path ? `${API_BASE}/${student.image_path}` : 'https://via.placeholder.com/80'}
                  alt={student.name}
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(6, 182, 212, 0.5)', marginBottom: '10px' }}
                />
                
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f9fafb', marginBottom: '2px', textAlign: 'center' }}>{student.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 500, marginBottom: '6px' }}>{student.student_id}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                  {student.department}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
