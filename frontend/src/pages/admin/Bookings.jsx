import { CalendarPlus, Search, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const Bookings = ({
  pageTitle = 'Bookings',
  pageSubtitle = 'Manage reservations and guest arrivals.',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managingBooking, setManagingBooking] = useState(null);
  const [manageForm, setManageForm] = useState({ status: '', paymentStatus: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [registeredGuests, setRegisteredGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchRegisteredGuests = async () => {
    setGuestsLoading(true);
    try {
      const res = await api.users.getGuests();
      setRegisteredGuests(res?.data?.guests || []);
    } catch (err) {
      console.error('Failed to load guests:', err);
      setRegisteredGuests([]);
    } finally {
      setGuestsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.rooms.getAll();
      setRooms(res?.data?.rooms || []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setRooms([]);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.bookings.getAll();
      if (res?.data?.bookings) setBookings(res.data.bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const name = b.guestName || b.guest || '';
    const email = b.guestEmail || '';
    const idStr = b.bookingId || b.id || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      idStr.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [form, setForm] = useState({
    guestId: '',
    guest: '',
    guestEmail: '',
    guestPhone: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    status: 'Pending',
    payment: 'Pending',
  });

  const selectedGuestAccount = registeredGuests.find((g) => g._id === form.guestId);
  const selectedRoom = rooms.find((r) => r._id === form.roomId);

  const handleGuestSelect = (guestId) => {
    const selected = registeredGuests.find((g) => g._id === guestId);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        guestId,
        guest: selected.name,
        guestEmail: selected.email,
        guestPhone: selected.phone || '',
      }));
    } else {
      setForm((prev) => ({ ...prev, guestId: '', guest: '', guestEmail: '', guestPhone: '' }));
    }
  };

  const handleOpenAdd = () => {
    setSaveError('');
    setForm({
      guestId: '',
      guest: '',
      guestEmail: '',
      guestPhone: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      status: 'Confirmed',
      payment: 'Pending',
    });
    setShowModal(true);
    fetchRegisteredGuests();
    fetchRooms();
  };

  const handleOpenManage = (booking) => {
    setManagingBooking(booking);
    setManageForm({
      status: booking.status || 'Pending',
      paymentStatus: booking.paymentStatus || booking.payment || 'Pending',
    });
  };

  const handleSave = async () => {
    setSaveError('');
    if (!form.guestId && !form.guestEmail?.trim()) {
      setSaveError('Please select a registered guest or enter their portal login email.');
      return;
    }
    if (!form.guest?.trim() || !form.roomId || !form.checkIn || !form.checkOut) {
      setSaveError('Please fill guest name, room, check-in and check-out.');
      return;
    }
    try {
      await api.bookings.create({
        guestName: form.guest.trim(),
        guestEmail: form.guestEmail.trim().toLowerCase(),
        guestPhone: form.guestPhone.trim(),
        room: form.roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: form.status,
        paymentStatus: form.payment,
      });
      fetchBookings();
      setShowModal(false);
      alert(`Booking saved. Guest can sign in at /guest with ${form.guestEmail.trim().toLowerCase()}`);
    } catch (err) {
      setSaveError(err.message || 'Failed to record reservation');
    }
  };

  const handleManageSave = async () => {
    if (!managingBooking) return;
    setActionLoading(true);
    try {
      await api.bookings.update(managingBooking._id, {
        status: manageForm.status,
        paymentStatus: manageForm.paymentStatus,
      });
      await fetchBookings();
      setManagingBooking(null);
    } catch (err) {
      alert(err.message || 'Failed to update booking');
    } finally {
      setActionLoading(false);
    }
  };

  const runBookingAction = async (action) => {
    if (!managingBooking) return;
    setActionLoading(true);
    try {
      if (action === 'cancel') await api.bookings.cancel(managingBooking._id);
      if (action === 'checkin') await api.bookings.checkIn(managingBooking._id);
      if (action === 'checkout') await api.bookings.checkOut(managingBooking._id);
      await fetchBookings();
      setManagingBooking(null);
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">{pageSubtitle}</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <CalendarPlus size={18} style={{ marginRight: '8px' }} /> New Booking
        </button>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Guest Name or Booking ID..."
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} style={{ marginRight: '8px' }} /> Filters
          </button>
        </div>

        {showFilters && (
          <div
            style={{
              padding: '20px',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              gap: '20px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="filter-group">
              <label className="input-label">Status</label>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Checked In</option>
                <option>Checked Out</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Guest Email</th>
                <th>Room Info</th>
                <th>Stay Dates</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading bookings...
                  </td>
                </tr>
              )}
              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No bookings yet. Add rooms first, then create a booking.
                  </td>
                </tr>
              )}
              {filteredBookings.map((booking) => {
                const bId = booking.bookingId || booking.id || '—';
                const bGuest = booking.guestName || booking.guest || 'N/A';
                const bRoomNum = booking.room?.number ?? booking.room ?? 'N/A';
                const bRoomType = booking.room?.type || booking.type || 'N/A';
                const bCheckIn = formatDate(booking.checkIn);
                const bCheckOut = formatDate(booking.checkOut);
                const bPayment = booking.paymentStatus || booking.payment || 'Pending';

                return (
                  <tr key={booking._id || bId}>
                    <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{bId}</td>
                    <td>{bGuest}</td>
                    <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {booking.guestEmail || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>Room {bRoomNum}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{bRoomType}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span>{bCheckIn}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                        <span>{bCheckOut}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === 'Confirmed' || booking.status === 'Checked In'
                            ? 'badge-success'
                            : booking.status === 'Pending'
                              ? 'badge-warning'
                              : 'badge-danger'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '13px',
                          color:
                            bPayment === 'Paid'
                              ? 'var(--color-success)'
                              : bPayment === 'Pending'
                                ? 'var(--color-warning)'
                                : 'var(--color-danger)',
                        }}
                      >
                        ● {bPayment}
                      </span>
                    </td>
                    <td>
                      <button className="btn-text" onClick={() => handleOpenManage(booking)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              background: '#fff',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Create New Reservation</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowModal(false)}
                style={{ background: '#f5f5f5', borderRadius: '50%', padding: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            {saveError && (
              <div style={{ padding: '12px', marginBottom: '16px', background: '#ffebee', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '14px' }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section style={{ padding: '16px', background: '#f8f6f2', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  1. Guest account (portal login)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
                  Dropdown se guest choose karo — email auto-fill hogi. Wahi email se guest <strong>/guest</strong> par login karke room dekhega.
                </p>

                <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>
                  Select registered guest *
                </label>
                <select
                  className="input-field"
                  value={form.guestId}
                  onChange={(e) => handleGuestSelect(e.target.value)}
                  style={{ width: '100%', marginBottom: '12px' }}
                  disabled={guestsLoading}
                >
                  <option value="">
                    {guestsLoading ? 'Loading guests...' : '— Choose guest —'}
                  </option>
                  {registeredGuests.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} — {g.email}
                    </option>
                  ))}
                </select>
                {!guestsLoading && registeredGuests.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--color-warning)', margin: '0 0 12px' }}>
                    Koi guest account nahi. Pehle Guest Profiles se guest add karo.
                  </p>
                )}

                {selectedGuestAccount && (
                  <div style={{ padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '14px' }}>
                    <p style={{ margin: '0 0 6px' }}><strong>Name:</strong> {form.guest}</p>
                    <p style={{ margin: '0 0 6px' }}><strong>Email:</strong> {form.guestEmail}</p>
                    <p style={{ margin: 0 }}><strong>Phone:</strong> {form.guestPhone || '—'}</p>
                  </div>
                )}
              </section>

              <section>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>2. Room & stay</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Room *</label>
                  <select
                    className="input-field"
                    value={form.roomId}
                    onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    <option value="">— Select room —</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        Room {r.number} — {r.type} (${r.price}/night) — {r.status}
                      </option>
                    ))}
                  </select>
                  {selectedRoom && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                      Guest portal par dikhega: <strong>Room {selectedRoom.number}</strong> ({selectedRoom.type})
                    </p>
                  )}
                </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Check-In Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="input-label">Check-Out Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Booking Status</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Waitlisted</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Payment Status</label>
                  <select
                    className="input-field"
                    value={form.payment}
                    onChange={(e) => setForm({ ...form, payment: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Unpaid</option>
                  </select>
                </div>
              </div>
              </section>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!form.guestEmail || !form.roomId}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {managingBooking && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '28px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setManagingBooking(null)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>Manage Booking</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              <strong>{managingBooking.bookingId}</strong> — {managingBooking.guestName}
              {managingBooking.guestEmail && (
                <span style={{ display: 'block', marginTop: '4px' }}>{managingBooking.guestEmail}</span>
              )}
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Room:</strong> {managingBooking.room?.number ?? '—'}{' '}
                {managingBooking.room?.type ? `(${managingBooking.room.type})` : ''}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Stay:</strong> {formatDate(managingBooking.checkIn)} → {formatDate(managingBooking.checkOut)}
              </p>
              {managingBooking.totalPrice != null && (
                <p style={{ margin: 0 }}>
                  <strong>Total:</strong> ${managingBooking.totalPrice}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label">Booking Status</label>
                <select
                  className="input-field"
                  value={manageForm.status}
                  onChange={(e) => setManageForm({ ...manageForm, status: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={actionLoading}
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Checked In</option>
                  <option>Checked Out</option>
                  <option>Cancelled</option>
                  <option>Waitlisted</option>
                </select>
              </div>
              <div>
                <label className="input-label">Payment Status</label>
                <select
                  className="input-field"
                  value={manageForm.paymentStatus}
                  onChange={(e) => setManageForm({ ...manageForm, paymentStatus: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={actionLoading}
                >
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Unpaid</option>
                  <option>Refunded</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {managingBooking.status === 'Confirmed' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  onClick={() => runBookingAction('checkin')}
                >
                  Check In Guest
                </button>
              )}
              {managingBooking.status === 'Checked In' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  onClick={() => runBookingAction('checkout')}
                >
                  Check Out
                </button>
              )}
              {!['Cancelled', 'Checked Out'].includes(managingBooking.status) && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                  disabled={actionLoading}
                  onClick={() => {
                    if (window.confirm('Cancel this booking?')) runBookingAction('cancel');
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setManagingBooking(null)}
                disabled={actionLoading}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleManageSave}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
