import { Search, UserPlus, Filter, Mail, Phone, X, Calendar } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../utils/api';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const StaffGuestRecords = () => {
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showNewGuestModal, setShowNewGuestModal] = useState(false);
  const [newGuestData, setNewGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'Active',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [guestRes, bookingRes] = await Promise.all([
        api.users.getGuests(),
        api.bookings.getAll(),
      ]);
      setGuests(guestRes?.data?.guests || []);
      setBookings(bookingRes?.data?.bookings || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load guest records.');
      setGuests([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const bookingsForGuest = useMemo(() => {
    const map = new Map();
    guests.forEach((g) => {
      const email = g.email?.toLowerCase();
      const list = bookings.filter(
        (b) =>
          (b.guest && String(b.guest) === String(g._id)) ||
          (email && b.guestEmail?.toLowerCase() === email) ||
          (g.name && b.guestName?.toLowerCase() === g.name.toLowerCase())
      );
      map.set(g._id, list);
    });
    return map;
  }, [guests, bookings]);

  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      g.name?.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      (g.phone || '').includes(q);
    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddGuest = async () => {
    if (!newGuestData.name?.trim() || !newGuestData.email?.trim()) {
      alert('Name and email are required.');
      return;
    }
    try {
      await api.users.createGuest({
        name: newGuestData.name.trim(),
        email: newGuestData.email.trim().toLowerCase(),
        phone: newGuestData.phone?.trim() || '',
        password: newGuestData.password || 'password123',
        status: newGuestData.status,
      });
      setShowNewGuestModal(false);
      setNewGuestData({ name: '', email: '', phone: '', password: '', status: 'Active' });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to add guest');
    }
  };

  const guestBookings = selectedGuest ? bookingsForGuest.get(selectedGuest._id) || [] : [];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest Records</h1>
          <p className="page-subtitle">Registered guests and their bookings from the database.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-primary" onClick={() => setShowNewGuestModal(true)}>
            <UserPlus size={18} style={{ marginRight: '8px' }} />
            New Guest
          </button>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '14px',
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            color: 'var(--color-danger)',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
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
              placeholder="Search by name, email or phone..."
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} style={{ marginRight: '8px' }} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div
            style={{
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid var(--color-border)',
            }}
          >
            <label className="input-label">Status</label>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
          </div>
        )}

        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
          {loading ? 'Loading...' : `${filteredGuests.length} guest(s) · ${bookings.length} total booking(s)`}
        </p>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Contact</th>
                <th>Bookings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading guest records...
                  </td>
                </tr>
              )}
              {!loading && filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No guests found. Add a guest or create a booking with guest email.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredGuests.map((guest) => {
                  const guestBk = bookingsForGuest.get(guest._id) || [];
                  const active = guestBk.filter((b) =>
                    ['Pending', 'Confirmed', 'Checked In'].includes(b.status)
                  ).length;
                  return (
                    <tr key={guest._id}>
                      <td style={{ fontWeight: '600' }}>{guest.name}</td>
                      <td>
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} /> {guest.email}
                          </span>
                          {guest.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} /> {guest.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{guestBk.length}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                          {' '}
                          ({active} active)
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${guest.status === 'Active' ? 'badge-success' : 'badge-warning'}`}
                        >
                          {guest.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn-text" onClick={() => setSelectedGuest(guest)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGuest && (
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
            padding: '24px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedGuest(null)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Guest Profile</h2>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0 }}>
                <strong>Name:</strong> {selectedGuest.name}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {selectedGuest.email}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Phone:</strong> {selectedGuest.phone || '—'}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Status:</strong> {selectedGuest.status}
              </p>
            </div>

            <h3 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} />
              Bookings ({guestBookings.length})
            </h3>
            {guestBookings.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No bookings linked to this guest.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {guestBookings.map((b) => (
                  <div
                    key={b._id}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.bookingId}</div>
                    <div>
                      Room {b.room?.number || '—'} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </div>
                    <span className={`badge ${b.status === 'Checked In' ? 'badge-success' : 'badge-warning'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedGuest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewGuestModal && (
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
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowNewGuestModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Register New Guest</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label">Full name *</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newGuestData.name}
                  onChange={(e) => setNewGuestData({ ...newGuestData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newGuestData.email}
                  onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newGuestData.phone}
                  onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Portal password (optional)</label>
                <input
                  type="password"
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="Default: password123"
                  value={newGuestData.password}
                  onChange={(e) => setNewGuestData({ ...newGuestData, password: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowNewGuestModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleAddGuest}>
                Save Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffGuestRecords;
