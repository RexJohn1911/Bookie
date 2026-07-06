import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getAllMoviesAdmin, addMovie, updateMovie, deleteMovie,
  getAllShows, addShow, deleteShow, getAllBookings, adminCancelBooking
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyMovie = { title:'', genre:'', language:'', description:'', posterUrl:'', durationMinutes:'', rating:'UA', ticketPrice:'', active:true };
const emptyShow  = { movieId:'', showTime:'', hallName:'', totalSeats:80 };

const F = ({ label, children }) => (
  <div className="form-group"><label>{label}</label>{children}</div>
);

export default function AdminPage() {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('movies');
  const [movies, setMovies]   = useState([]);
  const [shows, setShows]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [movieForm, setMovieForm]     = useState(emptyMovie);
  const [editingId, setEditingId]     = useState(null);
  const [movieSubmit, setMovieSubmit] = useState(false);
  const [showForm, setShowForm]       = useState(emptyShow);
  const [showSubmit, setShowSubmit]   = useState(false);

  const updateMovieForm = (field, value) => setMovieForm(prev => ({ ...prev, [field]: value }));
  const updateShowForm = (field, value) => setShowForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => { fetchData(); }, [tab]);

  async function fetchData() {
    setLoading(true); setError(null);
    try {
      if (tab === 'movies') {
        const res = await getAllMoviesAdmin();
        setMovies(res.data);
      } else if (tab === 'shows') {
        const [mRes, sRes] = await Promise.all([
          getAllMoviesAdmin(),
          getAllShows()
        ]);
        setMovies(mRes.data);
        setShows(sRes.data);
      } else if (tab === 'bookings') {
        const res = await getAllBookings();
        setBookings(res.data);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load. Check admin credentials.');
    } finally { setLoading(false); }
  }

  async function handleMovieSubmit() {
    if (!movieForm.title || !movieForm.genre || !movieForm.language || !movieForm.ticketPrice)
      return toast.error('Fill in all required fields');
    setMovieSubmit(true);
    try {
      editingId ? await updateMovie(editingId, movieForm) : await addMovie(movieForm);
      toast.success(editingId ? 'Movie updated!' : 'Movie added!');
      setMovieForm({ ...emptyMovie }); setEditingId(null); fetchData();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setMovieSubmit(false); }
  }

  async function handleDeleteMovie(id) {
    if (!window.confirm('Remove this movie?')) return;
    try { await deleteMovie(id); toast.success('Movie removed'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.error || 'Delete failed'); }
  }

  async function handleShowSubmit() {
    if (!showForm.movieId || !showForm.showTime || !showForm.hallName)
      return toast.error('Fill in all show fields');
    setShowSubmit(true);
    try {
      await addShow({ movie:{ id: showForm.movieId }, showTime: showForm.showTime, hallName: showForm.hallName, totalSeats: showForm.totalSeats });
      toast.success('Show added!'); setShowForm({ ...emptyShow }); fetchData();
    } catch (e) { toast.error(e.response?.data?.error || 'Add show failed'); }
    finally { setShowSubmit(false); }
  }

  async function handleDeleteShow(id) {
    if (!window.confirm('Delete this show?')) return;
    try { await deleteShow(id); toast.success('Show deleted'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.error || 'Delete failed'); }
  }

  async function handleCancelBooking(id) {
    if (!window.confirm('Cancel this booking?')) return;
    try { await adminCancelBooking(id); toast.success('Booking cancelled'); fetchData(); }
    catch (e) { toast.error(e.response?.data?.error || 'Cancel failed'); }
  }


  return (
    <div>
      <div className="page-header">
        <div className="page-title">⚙️ Admin Panel</div>
        <button className="btn btn-danger btn-sm" onClick={() => { logoutAdmin(); navigate('/'); }}>
          Logout Admin
        </button>
      </div>

      <div className="admin-tabs">
        {['movies','shows','bookings'].map(t => (
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t==='movies'?'🎬 Movies': t==='shows'?'📅 Shows':'🎟 Bookings'}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading {tab}...</div>}
      {error && <div style={{color:'#f87171',padding:'1rem',background:'rgba(220,50,50,0.1)',borderRadius:'8px',marginBottom:'1rem'}}>⚠️ {error}</div>}

      {/* ── Movies tab ── */}
      {!loading && tab==='movies' && (
        <div>
          <div className="panel-card">
            <h3 style={{marginBottom:'1.25rem'}}>{editingId ? '✏️ Edit Movie' : '➕ Add Movie'}</h3>
            <div className="form-row">
              <F label="Title *"><input className="input" value={movieForm.title} onChange={e=>updateMovieForm('title', e.target.value)} /></F>
              <F label="Genre *"><input className="input" value={movieForm.genre} onChange={e=>updateMovieForm('genre', e.target.value)} /></F>
            </div>
            <div className="form-row">
              <F label="Language *"><input className="input" value={movieForm.language} onChange={e=>updateMovieForm('language', e.target.value)} /></F>
              <F label="Rating">
                <select className="input" value={movieForm.rating} onChange={e=>updateMovieForm('rating', e.target.value)}>
                  {['U','UA','A'].map(r=><option key={r}>{r}</option>)}
                </select>
              </F>
            </div>
            <div className="form-row">
              <F label="Duration (min)"><input className="input" type="number" value={movieForm.durationMinutes} onChange={e=>updateMovieForm('durationMinutes', e.target.value)} /></F>
              <F label="Ticket Price (₹) *"><input className="input" type="number" value={movieForm.ticketPrice} onChange={e=>updateMovieForm('ticketPrice', e.target.value)} /></F>
            </div>
            <F label="Poster URL"><input className="input" value={movieForm.posterUrl} onChange={e=>updateMovieForm('posterUrl', e.target.value)} /></F>
            <F label="Description"><textarea className="input" rows={3} value={movieForm.description} onChange={e=>updateMovieForm('description', e.target.value)} /></F>
            <div style={{display:'flex',gap:'0.75rem',marginTop:'0.5rem'}}>
              <button className="btn btn-primary" onClick={handleMovieSubmit} disabled={movieSubmit}>
                {movieSubmit ? 'Saving...' : editingId ? 'Update Movie' : 'Add Movie'}
              </button>
              {editingId && <button className="btn btn-secondary" onClick={()=>{setMovieForm(emptyMovie);setEditingId(null);}}>Cancel Edit</button>}
            </div>
          </div>

          <div className="movies-grid">
            {movies.map(m => (
              <div key={m.id} className="movie-card" style={{opacity:m.active?1:0.5}}>
                <div className="movie-poster">
                  {m.posterUrl ? <img src={m.posterUrl} alt={m.title} /> : <span>🎬</span>}
                </div>
                <div className="movie-info">
                  <div className="movie-title">{m.title} {!m.active && <span style={{color:'#f87171',fontSize:'0.72rem'}}>(Inactive)</span>}</div>
                  <div className="movie-meta">
                    <span className="badge badge-genre">{m.genre}</span>
                    <span className="badge badge-rating">{m.rating}</span>
                  </div>
                  <div className="movie-meta" style={{marginTop:'0.3rem'}}>₹{m.ticketPrice} · {m.durationMinutes} min</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',padding:'0.75rem'}}>
                  <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={()=>{setMovieForm({...m});setEditingId(m.id);window.scrollTo({top:0,behavior:'smooth'});}}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{flex:1}} onClick={()=>handleDeleteMovie(m.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Shows tab ── */}
      {!loading && tab==='shows' && (
        <div>
          <div className="panel-card">
            <h3 style={{marginBottom:'1.25rem'}}>➕ Add Show</h3>
            <div className="form-row">
              <F label="Movie *">
                <select className="input" value={showForm.movieId} onChange={e=>updateShowForm('movieId', e.target.value)}>
                  <option value="">Select movie</option>
                  {movies.filter(m=>m.active).map(m=><option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </F>
              <F label="Hall Name *"><input className="input" placeholder="e.g. Hall A" value={showForm.hallName} onChange={e=>updateShowForm('hallName', e.target.value)} /></F>
            </div>
            <div className="form-row">
              <F label="Show Time *"><input className="input" type="datetime-local" value={showForm.showTime} onChange={e=>updateShowForm('showTime', e.target.value)} /></F>
              <F label="Total Seats"><input className="input" type="number" value={showForm.totalSeats} onChange={e=>updateShowForm('totalSeats', Number(e.target.value))} /></F>
            </div>
            <button className="btn btn-primary" onClick={handleShowSubmit} disabled={showSubmit}>
              {showSubmit ? 'Adding...' : 'Add Show'}
            </button>
          </div>

          <h3 style={{marginTop:'2rem', marginBottom:'1rem'}}>Scheduled Shows</h3>
          {shows.length === 0 ? (
            <div className="empty-state"><div className="emoji">📅</div><p>No shows scheduled yet</p></div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              {shows.map(show => (
                <div key={show.id} className="booking-card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
                  <div>
                    <div className="booking-movie">{show.movie.title}</div>
                    <div className="booking-details" style={{marginTop:'0.25rem'}}>
                      <span>🏟 {show.hallName}</span>
                      <span>📅 {new Date(show.showTime).toLocaleString('en-IN', {dateStyle:'medium', timeStyle:'short'})}</span>
                      <span>💺 {show.availableSeats} / {show.totalSeats} seats left</span>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteShow(show.id)}>
                    Delete Show
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Bookings tab ── */}
      {!loading && tab==='bookings' && (
        <div>
          {bookings.length===0
            ? <div className="empty-state"><div className="emoji">🎭</div><p>No bookings yet</p></div>
            : bookings.map(b => (
              <div key={b.id} className="booking-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <span className="booking-ref">{b.bookingReference}</span>
                  <span className={`booking-status status-${b.status}`}>{b.status}</span>
                </div>
                <div className="booking-movie">{b.movieTitle}</div>
                <div className="booking-details">
                  <span>📅 {new Date(b.showTime).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</span>
                  <span>🏟 {b.hallName}</span>
                  <span>👤 {b.customerName}</span>
                  <span>📧 {b.customerEmail}</span>
                </div>
                <div className="booking-details">
                  <span>💺 {b.seatNumbers?.join(', ')}</span>
                  <span style={{color:'#7dde7d',fontWeight:700}}>₹{b.totalAmount?.toFixed(2)}</span>
                </div>
                {b.status==='CONFIRMED' && (
                  <button className="btn btn-danger btn-sm" style={{marginTop:'0.75rem'}} onClick={()=>handleCancelBooking(b.id)}>
                    Cancel Booking
                  </button>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
