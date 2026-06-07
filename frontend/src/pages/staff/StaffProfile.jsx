import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { getUser, setAuth, getToken } from '../../utils/auth';

const StaffProfile = () => {
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.auth.getMe();
        if (res?.data?.user) {
          setUser(res.data.user);
          const token = getToken();
          if (token) setAuth(token, res.data.user);
        }
      } catch (err) {
        setError(err.message || 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        setUser(updated);
        const token = getToken();
        if (token) setAuth(token, updated);
      }
      setForm(null);
      setMessage('Profile updated successfully.');
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
          <h1 className="page-title">Receptionist Profile</h1>
          <p className="page-subtitle">Your account from the database.</p>
        </div>
        {!form && (
          <button type="button" className="btn btn-primary" onClick={startEdit}>
            Edit Profile
          </button>
        )}
      </div>

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
              <label className="input-label">Full name</label>
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setForm(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <p style={{ margin: 0 }}>
              <strong>Name:</strong> {user?.name || '—'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Email:</strong> {user?.email || '—'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Phone:</strong> {user?.phone || '—'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Role:</strong> {user?.role || '—'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Status:</strong>{' '}
              <span className={`badge ${user?.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                {user?.status || '—'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;
