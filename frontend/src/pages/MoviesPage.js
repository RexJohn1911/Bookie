import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies, searchMovies, getMoviesByGenre } from '../services/api';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Romance', 'Sci-Fi', 'Animation'];

export default function MoviesPage() {
  const [movies, setMovies]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [genre, setGenre]       = useState('All');
  const navigate = useNavigate();

  useEffect(() => { fetchMovies(); }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      const res = await getMovies();
      setMovies(res.data);
    } finally { setLoading(false); }
  }

  async function handleSearch() {
    if (!search.trim()) return fetchMovies();
    const res = await searchMovies(search);
    setMovies(res.data);
  }

  async function handleGenre(g) {
    setGenre(g);
    setSearch('');
    if (g === 'All') return fetchMovies();
    const res = await getMoviesByGenre(g);
    setMovies(res.data);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Now Showing 🎬</div>
          <div className="page-subtitle">Pick a movie and book your seats instantly</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          className="input"
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      {/* Genre filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {GENRES.map(g => (
          <button
            key={g}
            className={`btn btn-sm ${genre === g ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleGenre(g)}
          >{g}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading movies...</div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🎭</div>
          <p>No movies found</p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => navigate(`/movies/${movie.id}/shows`)}
            >
              <div className="movie-poster">
                {movie.posterUrl
                  ? <img src={movie.posterUrl} alt={movie.title} />
                  : <span>🎬</span>
                }
              </div>
              <div className="movie-info">
                <div className="movie-title">{movie.title}</div>
                <div className="movie-meta">
                  <span className="badge badge-genre">{movie.genre}</span>
                  <span className="badge badge-rating">{movie.rating}</span>
                </div>
                <div className="movie-meta" style={{ marginTop: '0.4rem' }}>
                  <span>🌐 {movie.language}</span>
                  <span>⏱ {movie.durationMinutes} min</span>
                </div>
                <div className="movie-price">₹{movie.ticketPrice}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
