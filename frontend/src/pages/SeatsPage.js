import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getShowById, getSeatsByShow, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SeatsPage() {
  const { showId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [show, setShow]             = useState(null);
  const [seats, setSeats]           = useState([]);
  const [selected, setSelected]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, stRes] = await Promise.all([getShowById(showId), getSeatsByShow(showId)]);
        setShow(sRes.data);
        setSeats(stRes.data);
      } catch { toast.error('Failed to load show details'); }
      finally { setLoading(false); }
    }
    load();
  }, [showId]);

  const rows = useMemo(() => {
    const map = {};
    seats.forEach(seat => {
      if (!map[seat.rowLabel]) map[seat.rowLabel] = [];
      map[seat.rowLabel].push(seat);
    });
    Object.values(map).forEach(row => row.sort((a, b) => a.seatIndex - b.seatIndex));
    return map;
  }, [seats]);

  function toggleSeat(seat) {
    if (seat.status !== 'AVAILABLE') return;
    setSelected(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  }

  const totalAmount = useMemo(() => {
    if (!show) return 0;
    return selected.reduce((sum, seatNum) => {
      const seat = seats.find(s => s.seatNumber === seatNum);
      if (!seat) return sum;
      let price = show.movie.ticketPrice;
      if (seat.seatType === 'PREMIUM') price *= 1.5;
      if (seat.seatType === 'VIP')     price *= 2.0;
      return sum + price;
    }, 0);
  }, [selected, seats, show]);

  async function handleBook() {
    if (selected.length === 0) return toast.error('Please select at least one seat');
    try {
      setSubmitting(true);
      const res = await createBooking({
        showId: Number(showId),
        customerName:  user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        seatNumbers:   selected,
      });
      navigate('/booking/success', { state: { booking: res.data } });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Booking failed. Try again.');
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="loading">Loading seat map...</div>;

  return (
    <div>
      <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>← Back</button>

      {show && (
        <div className="page-header">
          <div>
            <div className="page-title">{show.movie.title}</div>
            <div className="page-subtitle">
              🏟 {show.hallName} &nbsp;·&nbsp;
              📅 {new Date(show.showTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>
      )}

      {/* User info banner */}
      {user && (
        <div className="user-info-banner">
          Booking as <strong>{user.name}</strong> · {user.email}
        </div>
      )}

      {/* Seat map */}
      <div className="seat-map-wrapper">
        <div className="screen-bar" />
        <div className="screen-label">SCREEN</div>

        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="seat-row">
            <div className="row-label">{rowLabel}</div>
            {rowSeats.map(seat => (
              <div
                key={seat.id}
                title={`${seat.seatNumber} · ${seat.seatType}`}
                className={[
                  'seat',
                  seat.seatType.toLowerCase(),
                  seat.status !== 'AVAILABLE' ? 'booked'
                    : selected.includes(seat.seatNumber) ? 'selected'
                    : 'available'
                ].join(' ')}
                onClick={() => toggleSeat(seat)}
              >
                {seat.seatIndex}
              </div>
            ))}
            <div className="row-label">{rowLabel}</div>
          </div>
        ))}

        <div className="seat-legend">
          {[
            { label:'Regular', bg:'var(--surface2)', border:'var(--border)' },
            { label:'Premium (1.5×)', bg:'transparent', border:'var(--gold)' },
            { label:'VIP (2×)', bg:'transparent', border:'#a855f7' },
            { label:'Selected', bg:'var(--accent)', border:'var(--accent2)' },
            { label:'Booked', bg:'#2a2a2a', border:'#333' },
          ].map(l => (
            <div key={l.label} className="legend-item">
              <div className="legend-box" style={{ background:l.bg, borderColor:l.border }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Booking panel */}
      <div className="booking-panel">
        <h3>Booking Summary</h3>
        <div className="form-group">
          <label>Selected Seats ({selected.length})</label>
          <div className="selected-seats-display">
            {selected.length === 0
              ? <span style={{ color:'var(--muted)', fontWeight:400 }}>Click seats above to select</span>
              : selected.join(', ')}
          </div>
        </div>
        <div className="total-amount">Total: ₹{totalAmount.toFixed(2)}</div>
        <button
          className="btn btn-primary"
          style={{ width:'100%', padding:'0.85rem', fontSize:'1rem' }}
          onClick={handleBook}
          disabled={submitting || selected.length === 0}
        >
          {submitting ? 'Booking...' : `Confirm Booking · ₹${totalAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
