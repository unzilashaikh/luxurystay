import { Search, UserPlus, Filter, Mail, Phone, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const Guests = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showNewGuestModal, setShowNewGuestModal] = useState(false);
  const [newGuestData, setNewGuestData] = useState({ name: '', email: '', phone: '', password: '', status: 'Active' });
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await api.users.getGuests();
      if (res?.data?.guests) setGuests(res.data.guests);
    } catch (err) {
      console.error('Failed to load guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.phone || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddGuest = async () => {
    if (!newGuestData.name || !newGuestData.email) {
      alert('Please fill in both Name and Email.');
      return;
    }
    try {
      await api.users.create({
        name: newGuestData.name,
        email: newGuestData.email,
        phone: newGuestData.phone,
        password: newGuestData.password || 'password123',
        role: 'Guest',
        status: newGuestData.status
      });
      fetchGuests();
      setShowNewGuestModal(false);
      setNewGuestData({ name: '', email: '', phone: '', password: '', status: 'Active' });
    } catch (err) {
      alert(err.message || 'Failed to add guest');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest Profiles</h1>
          <p className="page-subtitle">Manage guest information and accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewGuestModal(true)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} /> New Guest
        </button>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search guests by name, email or phone..."
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} style={{ marginRight: '8px' }} /> Filters
          </button>
        </div>

        {showFilters && (
          <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '20px', border: '1px solid var(--color-border)' }}>
            <div className="filter-group">
              <label className="input-label">Status</label>
              <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading guests...</td></tr>
              )}
              {!loading && filteredGuests.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>No guests found. Add guests to get started.</td></tr>
              )}
              {filteredGuests.map((guest) => (
                <tr key={guest._id}>
                  <td>
                    <span style={{ fontWeight: '500' }}>{guest.name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {guest.email}</span>
                      {guest.phone && (
                        <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {guest.phone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${guest.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {guest.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-text" onClick={() => setSelectedGuest(guest)}>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGuest && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setSelectedGuest(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Guest Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>Name:</strong> {selectedGuest.name}</p>
              <p><strong>Email:</strong> {selectedGuest.email}</p>
              <p><strong>Phone:</strong> {selectedGuest.phone || '—'}</p>
              <p><strong>Status:</strong> {selectedGuest.status}</p>
              <p><strong>Role:</strong> {selectedGuest.role}</p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelectedGuest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showNewGuestModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowNewGuestModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Add New Guest</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                <input type="text" className="input-field" value={newGuestData.name} onChange={(e) => setNewGuestData({ ...newGuestData, name: e.target.value })} placeholder="Enter full name" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                <input type="email" className="input-field" value={newGuestData.email} onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })} placeholder="Enter email" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Phone Number</label>
                <input type="text" className="input-field" value={newGuestData.phone} onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })} placeholder="Enter phone number" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Password (optional)</label>
                <input type="password" className="input-field" value={newGuestData.password} onChange={(e) => setNewGuestData({ ...newGuestData, password: e.target.value })} placeholder="Default: password123" style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowNewGuestModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddGuest}>Save Guest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
