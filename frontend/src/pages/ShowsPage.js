import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getShowsByMovie } from '../services/api';

export default function ShowsPage() {
  const { movieId } = useParams();
  const navigate    = useNavigate();
  const [movie, setMovie]   = useState(null);
  const [shows, setShows]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, sRes] = await Promise.all([
          getMovieById(movieId),
          getShowsByMovie(movieId),
        ]);
        setMovie(mRes.data);
        setShows(sRes.data);
      } finally { setLoading(false); }
    }
    load();
  }, [movieId]);

  function formatDate(dt) {
    return new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function formatTime(dt) {
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return <div className="loading">Loading shows...</div>;

  return (
    <div>
      <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>← Back</button>

      {movie && (
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '4rem' }}>🎬</div>
          <div>
            <div className="page-title">{movie.title}</div>
            <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0', flexWrap: 'wrap' }}>
              <span className="badge badge-genre">{movie.genre}</span>
              <span className="badge badge-rating">{movie.rating}</span>
              <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                {movie.durationMinutes} min
              </span>
            </div>
            <div className="page-subtitle">{movie.description}</div>
          </div>
        </div>
      )}

      <div className="section-title">Select a Show</div>

      {shows.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📅</div>
          <p>No upcoming shows for this movie</p>
        </div>
      ) : (
        <div className="shows-list">
          {shows.map(show => {
            const pct = ((show.totalSeats - show.availableSeats) / show.totalSeats) * 100;
            const filling = pct > 80 ? 'Filling Fast!' : pct > 50 ? 'Available' : 'Open';
            const fillColor = pct > 80 ? '#f87171' : pct > 50 ? '#fbbf24' : '#7dde7d';
            return (
              <div key={show.id} className="show-card">
                <div>
                  <div className="show-time">{formatTime(show.showTime)}</div>
                  <div className="show-detail">📅 {formatDate(show.showTime)} &nbsp;·&nbsp; 🏟 {show.hallName}</div>
                </div>
                <div style={{ flex: 1, padding: '0 1rem' }}>
                  <div style={{ background: 'var(--surface2)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: fillColor, borderRadius: '4px', transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: fillColor }}>{filling}</div>
                </div>
                <div className="show-seats">
                  <div className="seats-count">{show.availableSeats}</div>
                  <div className="seats-label">seats left</div>
                </div>
                <button
                  className="btn btn-primary"
                  disabled={show.availableSeats === 0}
                  onClick={() => navigate(`/shows/${show.id}/seats`)}
                >
                  {show.availableSeats === 0 ? 'Houseful' : 'Select Seats →'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
