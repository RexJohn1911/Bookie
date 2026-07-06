import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BookingSuccess() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const booking    = state?.booking;

  if (!booking) {
    navigate('/');
    return null;
  }

  function fmt(dt) {
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  return (
    <div className="success-page">
      <div className="success-icon">🎉</div>
      <div className="page-title">Booking Confirmed!</div>
      <div className="page-subtitle" style={{ marginTop: '0.5rem' }}>
        Your tickets are ready. Enjoy the movie!
      </div>

      <div className="ticket-card">
        <div className="ticket-row">
          <span className="ticket-label">Booking Ref</span>
          <span className="ticket-value" style={{ fontFamily: 'monospace', color: 'var(--accent2)' }}>
            {booking.bookingReference}
          </span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Movie</span>
          <span className="ticket-value">{booking.movieTitle}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Show Time</span>
          <span className="ticket-value">{fmt(booking.showTime)}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Hall</span>
          <span className="ticket-value">{booking.hallName}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Seats</span>
          <span className="ticket-value">{booking.seatNumbers.join(', ')}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Name</span>
          <span className="ticket-value">{booking.customerName}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Total Paid</span>
          <span className="ticket-value" style={{ color: '#7dde7d', fontSize: '1.1rem' }}>
            ₹{booking.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Browse More Movies</button>
        <button className="btn btn-primary" onClick={() => navigate('/history')}>View My Bookings</button>
      </div>
    </div>
  );
}
