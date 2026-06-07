import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './BookingModal.css';

const todayStr = () => new Date().toISOString().slice(0, 10);

const BookingModal = ({ isOpen, onClose, initialRoomId = '', initialCheckIn = '', initialCheckOut = '' }) => {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    room: initialRoomId || '',
    checkIn: initialCheckIn || todayStr(),
    checkOut: initialCheckOut || '',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    setForm((f) => ({
      ...f,
      room: initialRoomId || f.room,
      checkIn: initialCheckIn || f.checkIn || todayStr(),
      checkOut: initialCheckOut || f.checkOut,
    }));

    const load = async () => {
      setLoadingRooms(true);
      try {
        const res = await api.rooms.getAll('?status=Available');
        const list = (res?.data?.rooms || []).filter((r) => r.status === 'Available');
        setRooms(list);
        if (!initialRoomId && list.length === 1) {
          setForm((f) => ({ ...f, room: list[0]._id }));
        }
      } catch {
        setRooms([]);
        setError('Could not load available rooms. Is the backend running?');
      } finally {
        setLoadingRooms(false);
      }
    };
    load();
  }, [isOpen, initialRoomId, initialCheckIn, initialCheckOut]);

  if (!isOpen) return null;

  const selectedRoom = rooms.find((r) => r._id === form.room);
  const nights =
    form.checkIn && form.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const estimate = selectedRoom && nights ? nights * selectedRoom.price : 0;

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.guestName.trim() || !form.guestEmail.trim() || !form.room || !form.checkIn || !form.checkOut) {
      setError('Please fill in name, email, room, and dates.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.bookings.createPublic({
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        guestPhone: form.guestPhone.trim(),
        room: form.room,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: 'Pending',
        paymentStatus: 'Pending',
        notes: form.notes.trim() || undefined,
      });
      const bk = res?.data?.booking;
      setSuccess(
        bk?.bookingId
          ? `Request received! Reference ${bk.bookingId}. Our team will confirm shortly.`
          : 'Booking request submitted successfully.'
      );
      setTimeout(() => {
        onClose();
        setSuccess('');
        setForm({
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          room: '',
          checkIn: todayStr(),
          checkOut: '',
          notes: '',
        });
      }, 2800);
    } catch (err) {
      setError(err.message || 'Could not submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="booking-modal-header">
          <h2>Reserve Your Stay</h2>
          <p>Choose a room and dates — your request is saved and appears in our reception system.</p>
        </div>

        {success && (
          <div className="booking-alert booking-alert-success">{success}</div>
        )}
        {error && !success && <div className="booking-alert booking-alert-error">{error}</div>}

        <form className="booking-modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full name *</label>
              <input
                type="text"
                className="form-control"
                value={form.guestName}
                onChange={(e) => handleChange('guestName', e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                className="form-control"
                value={form.guestEmail}
                onChange={(e) => handleChange('guestEmail', e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                className="form-control"
                value={form.guestPhone}
                onChange={(e) => handleChange('guestPhone', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Room *</label>
            {loadingRooms ? (
              <p className="booking-hint">Loading available rooms...</p>
            ) : (
              <select
                className="form-control"
                value={form.room}
                onChange={(e) => handleChange('room', e.target.value)}
                required
              >
                <option value="">Select a room</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.number} — {r.type} (${r.price}/night)
                  </option>
                ))}
              </select>
            )}
            {!loadingRooms && rooms.length === 0 && (
              <p className="booking-hint">No rooms available right now. Please contact reception.</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Check-in *</label>
              <input
                type="date"
                className="form-control"
                min={todayStr()}
                value={form.checkIn}
                onChange={(e) => handleChange('checkIn', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-out *</label>
              <input
                type="date"
                className="form-control"
                min={form.checkIn || todayStr()}
                value={form.checkOut}
                onChange={(e) => handleChange('checkOut', e.target.value)}
                required
              />
            </div>
          </div>

          {estimate > 0 && (
            <p className="booking-estimate">
              Estimated total: <strong>${estimate.toFixed(2)}</strong> ({nights} night{nights !== 1 ? 's' : ''})
            </p>
          )}

          <div className="form-group">
            <label>Special requests</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Optional notes for our team"
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={submitting || !rooms.length}>
            {submitting ? 'Submitting...' : 'Request Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
