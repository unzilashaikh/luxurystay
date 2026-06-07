import { User, Lock, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { getUser, setAuth, getToken } from '../../utils/auth';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startEditProfile = () => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setProfileMsg('');
    setProfileErr('');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm) return;
    setProfileSaving(true);
    setProfileErr('');
    setProfileMsg('');
    try {
      const res = await api.users.updateMe({
        name: profileForm.name.trim(),
        email: profileForm.email.trim().toLowerCase(),
        phone: profileForm.phone.trim(),
      });
      const updated = res?.data?.user;
      if (updated) {
        setUser(updated);
        const token = getToken();
        if (token) setAuth(token, updated);
      }
      setProfileForm(null);
      setProfileMsg('Profile saved.');
    } catch (err) {
      setProfileErr(err.message || 'Could not save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwdErr('');
    setPwdMsg('');
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      setPwdErr('Enter current and new password.');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdErr('New password must be at least 6 characters.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdErr('New passwords do not match.');
      return;
    }
    setPwdSaving(true);
    try {
      const res = await api.auth.updatePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      if (res?.data?.user) {
        setAuth(res.token, res.data.user);
        setUser(res.data.user);
      }
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwdMsg('Password updated successfully.');
    } catch (err) {
      setPwdErr(err.message || 'Could not update password');
    } finally {
      setPwdSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'My Account', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
  ];

  if (loading && !user) {
    return (
      <div className="page-content">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Your admin account — only what works with the database.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', marginTop: '24px', maxWidth: '720px' }}>
        <div className="card" style={{ padding: '10px', height: 'fit-content' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="nav-item"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '4px',
                  backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-main)',
                  fontWeight: active ? 600 : 400,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div>
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--color-primary)" /> My Account
              </h3>

              {profileMsg && (
                <div style={{ padding: '10px', marginBottom: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '14px' }}>
                  {profileMsg}
                </div>
              )}
              {profileErr && (
                <div style={{ padding: '10px', marginBottom: '16px', background: '#ffebee', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '14px' }}>
                  {profileErr}
                </div>
              )}

              {profileForm ? (
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="input-label">Full name</label>
                    <input className="input-field" style={{ width: '100%' }} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input type="email" className="input-field" style={{ width: '100%' }} value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <input className="input-field" style={{ width: '100%' }} value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setProfileForm(null)} disabled={profileSaving}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                      {profileSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                    <strong>Name:</strong> {user?.name || '—'}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                    <strong>Email:</strong> {user?.email || '—'}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                    <strong>Phone:</strong> {user?.phone || '—'}
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
                    <strong>Role:</strong> {user?.role || '—'}
                  </p>
                  <button type="button" className="btn btn-primary" onClick={startEditProfile}>
                    Edit Profile
                  </button>
                </>
              )}

              <div
                style={{
                  marginTop: '24px',
                  padding: '14px',
                  background: '#f8f6f2',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <Bell size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Booking and inventory alerts appear in the <strong>bell icon</strong> at the top — no extra setup needed here.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="var(--color-primary)" /> Change Password
              </h3>

              {pwdMsg && (
                <div style={{ padding: '10px', marginBottom: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '14px' }}>
                  {pwdMsg}
                </div>
              )}
              {pwdErr && (
                <div style={{ padding: '10px', marginBottom: '16px', background: '#ffebee', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '14px' }}>
                  {pwdErr}
                </div>
              )}

              <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
                <div>
                  <label className="input-label">Current password</label>
                  <input
                    type="password"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="input-label">New password</label>
                  <input
                    type="password"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="input-label">Confirm new password</label>
                  <input
                    type="password"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={pwdForm.confirm}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={pwdSaving} style={{ alignSelf: 'flex-start' }}>
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
