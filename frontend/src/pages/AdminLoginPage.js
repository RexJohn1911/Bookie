import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAllMoviesAdmin } from '../services/api';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!password) return toast.error('Enter the admin password');
    setLoading(true);
    try {
      // Validate by attempting to fetch admin movies using the entered password
      await getAllMoviesAdmin(password);
      loginAdmin(password);
      toast.success('Admin access granted');
      navigate('/admin');
    } catch (e) {
      if (e.response?.status === 401) {
        toast.error('Incorrect admin password');
      } else {
        toast.error(e.response?.data?.error || 'Authentication failed. Is backend running?');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'70vh' }}>
      <div className="auth-card">
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>⚙️</div>
          <div className="page-title">Admin Login</div>
          <div className="page-subtitle">Enter your admin password to continue</div>
        </div>

        <div className="form-group">
          <label>Admin Password</label>
          <input className="input" type="password" placeholder="Enter password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <button className="btn btn-primary" style={{ width:'100%', padding:'0.85rem', fontSize:'1rem', marginTop:'0.5rem' }}
          onClick={handleLogin} disabled={loading}>
          {loading ? 'Verifying...' : 'Login as Admin'}
        </button>

        <button className="btn btn-secondary" style={{ width:'100%', marginTop:'0.75rem' }}
          onClick={() => navigate('/')}>
          ← Back to Movies
        </button>
      </div>
    </div>
  );
}
