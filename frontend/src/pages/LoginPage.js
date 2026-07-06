import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  function handleLogin() {
    if (!form.name.trim()) return toast.error('Enter your name');
    if (!form.email.trim() || !form.email.includes('@')) return toast.error('Enter a valid email');
    if (!form.phone.trim() || form.phone.length < 10) return toast.error('Enter a valid 10-digit phone');
    loginUser(form.name.trim(), form.email.trim(), form.phone.trim());
    toast.success(`Welcome, ${form.name.trim()}!`);
    navigate(from, { replace: true });
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'70vh' }}>
      <div className="auth-card">
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🎟</div>
          <div className="page-title">Sign In to CinemaBook</div>
          <div className="page-subtitle">Enter your details to book tickets</div>
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input className="input" placeholder="e.g. Rex John"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input className="input" type="email" placeholder="rex@email.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input className="input" type="tel" placeholder="10-digit mobile number"
            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <button className="btn btn-primary" style={{ width:'100%', padding:'0.85rem', fontSize:'1rem', marginTop:'0.5rem' }}
          onClick={handleLogin}>
          Continue →
        </button>

        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'0.82rem', marginTop:'1.25rem' }}>
          No password needed — your email identifies your bookings.
        </p>
      </div>
    </div>
  );
}
