import { useState } from 'react';
import { useGuest } from '../../context/GuestContext';
import { api } from '../../utils/api';
import { setAuth, getToken } from '../../utils/auth';

const GuestProfile = () => {
  const { user, bookings, activeBooking, loading, refresh } = useGuest();

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const startEdit = () => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await api.users.updateMe({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });
      const updated = res?.data?.user;
      if (updated) {
        const token = getToken();
        if (token) setAuth(token, updated);
      }
      setForm(null);
      setMessage('Profile updated successfully.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="page-content">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your account details from login.</p>
        </div>
        {!form && (
          <button type="button" className="btn btn-primary" onClick={startEdit}>
            Edit Profile
          </button>
        )}
      </div>

      {activeBooking && (
        <div className="card" style={{ maxWidth: '520px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Current stay</h3>
          <p style={{ margin: '0 0 6px' }}><strong>Booking:</strong> {activeBooking.bookingId}</p>
          <p style={{ margin: '0 0 6px' }}><strong>Room:</strong> {activeBooking.room?.number ?? '—'} ({activeBooking.room?.type})</p>
          <p style={{ margin: '0 0 6px' }}><strong>Check-in:</strong> {formatDate(activeBooking.checkIn)}</p>
          <p style={{ margin: 0 }}><strong>Check-out:</strong> {formatDate(activeBooking.checkOut)} · {activeBooking.status}</p>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="card" style={{ maxWidth: '520px', padding: '16px', marginBottom: '20px', background: '#fffbf5' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No booking linked to <strong>{user?.email}</strong>. Admin should create booking with this email.
          </p>
        </div>
      )}

      <div className="card" style={{ maxWidth: '520px', padding: '28px' }}>
        {message && (
          <div style={{ padding: '10px', marginBottom: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '14px' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px', marginBottom: '16px', background: '#ffebee', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {form ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="input-label">Full Name</label>
              <input className="input-field" style={{ width: '100%' }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" className="input-field" style={{ width: '100%' }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input className="input-field" style={{ width: '100%' }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setForm(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
              <span style={{ fontWeight: '600' }}>{user?.name || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
              <span>{user?.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Phone</span>
              <span>{user?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Role</span>
              <span>{user?.role || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
              <span className={`badge ${user?.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{user?.status || '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestProfile;
