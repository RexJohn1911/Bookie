import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelMyBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await getMyBookings(user.email);
      setBookings(res.data);
    } catch {
      toast.error('Failed to fetch bookings');
    } finally { setLoading(false); }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking? Your seats will be released.')) return;
    try {
      setCancelling(id);
      // User cancels their own booking — backend verifies email ownership
      await cancelMyBooking(id, user.email);
      toast.success('Booking cancelled. Seats released.');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Cancellation failed');
    } finally { setCancelling(null); }
  }

  function fmt(dt) {
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Bookings 🎟</div>
          <div className="page-subtitle">Bookings for {user.email}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🎭</div>
          <p>No bookings yet. <a href="/" style={{ color:'var(--accent2)' }}>Browse movies →</a></p>
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="booking-card">
            <div className="booking-ref">Ref: {b.bookingReference}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
              <div className="booking-movie">{b.movieTitle}</div>
              <span className={`booking-status status-${b.status}`}>{b.status}</span>
            </div>
            <div className="booking-details">
              <span>📅 {fmt(b.showTime)}</span>
              <span>🏟 {b.hallName}</span>
              <span>💺 {b.seatNumbers.join(', ')}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
              <div style={{ color:'#7dde7d', fontWeight:700, fontSize:'1.1rem' }}>
                ₹{b.totalAmount.toFixed(2)}
              </div>
              {b.status === 'CONFIRMED' && (
                <button
                  className="btn btn-danger btn-sm"
                  disabled={cancelling === b.id}
                  onClick={() => handleCancel(b.id)}
                >
                  {cancelling === b.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
