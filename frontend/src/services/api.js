import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

const adminHeaders = (customKey) => {
  const key = customKey || localStorage.getItem('cb_admin_key') || 'changeme';
  return { headers: { 'X-Admin-Key': key } };
};

// ── Movies ────────────────────────────────────────────────────────────────────
export const getMovies         = ()          => API.get('/movies');
export const getAllMoviesAdmin  = (customKey) => API.get('/movies/admin/all', adminHeaders(customKey));
export const getMovieById      = (id)        => API.get(`/movies/${id}`);
export const searchMovies      = (title)     => API.get(`/movies/search?title=${title}`);
export const getMoviesByGenre  = (genre)     => API.get(`/movies/genre/${genre}`);
export const addMovie          = (data)      => API.post('/movies', data, adminHeaders());
export const updateMovie       = (id, data)  => API.put(`/movies/${id}`, data, adminHeaders());
export const deleteMovie       = (id)        => API.delete(`/movies/${id}`, adminHeaders());

// ── Shows ─────────────────────────────────────────────────────────────────────
export const getAllShows       = ()          => API.get('/shows');
export const getShowsByMovie   = (movieId)   => API.get(`/shows/movie/${movieId}`);
export const getShowById       = (id)        => API.get(`/shows/${id}`);
export const getSeatsByShow    = (showId)    => API.get(`/shows/${showId}/seats`);
export const addShow           = (data)      => API.post('/shows', data, adminHeaders());
export const deleteShow        = (id)        => API.delete(`/shows/${id}`, adminHeaders());

// ── Bookings ──────────────────────────────────────────────────────────────────
export const createBooking     = (data)      => API.post('/bookings', data);
export const getMyBookings     = (email)     => API.get(`/bookings/my?email=${email}`);
export const getBookingByRef   = (ref)       => API.get(`/bookings/ref/${ref}`);
export const getAllBookings     = ()          => API.get('/bookings/admin/all', adminHeaders());

// User self-cancel (no admin key — user owns it via email check on backend)
export const cancelMyBooking   = (id, email) => API.put(`/bookings/${id}/cancel-user`, { email });

// Admin cancel (any booking)
export const adminCancelBooking = (id)       => API.put(`/bookings/${id}/cancel`, {}, adminHeaders());
