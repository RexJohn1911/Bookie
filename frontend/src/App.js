import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MoviesPage      from './pages/MoviesPage';
import ShowsPage       from './pages/ShowsPage';
import SeatsPage       from './pages/SeatsPage';
import BookingHistory  from './pages/BookingHistory';
import AdminPage       from './pages/AdminPage';
import BookingSuccess  from './pages/BookingSuccess';
import LoginPage       from './pages/LoginPage';
import AdminLoginPage  from './pages/AdminLoginPage';
import './App.css';

// Guard: redirects to login if user is not signed in
function RequireUser({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

// Guard: redirects to admin login if not authenticated as admin
function RequireAdmin({ children }) {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function Navbar() {
  const { pathname } = useLocation();
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor:'pointer' }}>
        🍿 CinemaBook
      </div>
      <div className="nav-links">
        <Link to="/"        className={`nav-link ${pathname === '/' ? 'active' : ''}`}>🎬 Movies</Link>

        {user ? (
          <>
            <Link to="/history" className={`nav-link ${pathname === '/history' ? 'active' : ''}`}>🎟 My Bookings</Link>
            <div className="nav-user">
              <span className="nav-username">👤 {user.name.split(' ')[0]}</span>
              <button className="btn btn-sm btn-secondary" onClick={() => { logoutUser(); navigate('/'); }}>
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>Sign In</Link>
        )}

        {admin ? (
          <div className="nav-user">
            <Link to="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`} style={{ marginRight: '0.75rem' }}>⚙️ Admin Panel</Link>
            <button className="btn btn-sm btn-secondary" onClick={() => { logoutAdmin(); navigate('/'); }}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/admin/login" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}>Admin</Link>
        )}
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"                       element={<MoviesPage />} />
          <Route path="/login"                  element={<LoginPage />} />
          <Route path="/admin/login"            element={<AdminLoginPage />} />
          <Route path="/movies/:movieId/shows"  element={<ShowsPage />} />
          <Route path="/booking/success"        element={<BookingSuccess />} />

          {/* User-protected routes */}
          <Route path="/shows/:showId/seats"    element={<RequireUser><SeatsPage /></RequireUser>} />
          <Route path="/history"                element={<RequireUser><BookingHistory /></RequireUser>} />

          {/* Admin-protected route */}
          <Route path="/admin"                  element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
