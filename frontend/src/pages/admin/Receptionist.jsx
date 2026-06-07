import { Search, UserPlus, Filter, Mail, Phone, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const Receptionist = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccountData, setNewAccountData] = useState({ name: '', email: '', phone: '', password: '' });

  const fetchReceptionistAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.users.getAll();
      const list = (res?.data?.users || []).filter((u) => u.role === 'Receptionist');
      setAccounts(list);
    } catch (err) {
      console.error('Failed to load receptionist accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionistAccounts();
  }, []);

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAccount = async () => {
    if (!newAccountData.name || !newAccountData.email) {
      alert('Please fill in Name and Email.');
      return;
    }
    try {
      await api.users.create({
        name: newAccountData.name,
        email: newAccountData.email,
        phone: newAccountData.phone,
        password: newAccountData.password || 'password123',
        role: 'Receptionist',
        status: 'Active',
      });
      fetchReceptionistAccounts();
      setShowAccountModal(false);
      setNewAccountData({ name: '', email: '', phone: '', password: '' });
      alert('Receptionist account created. They can sign in at /staff');
    } catch (err) {
      alert(err.message || 'Failed to create receptionist account');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receptionist</h1>
          <p className="page-subtitle">Manage front desk accounts — check-in, bookings, billing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAccountModal(true)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} /> Add Receptionist Account
        </button>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search receptionists by name, email or phone..."
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
                <th>Receptionist Name</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading receptionists...</td></tr>
              )}
              {!loading && filteredAccounts.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>No receptionist accounts found. Add one to get started.</td></tr>
              )}
              {filteredAccounts.map((account) => (
                <tr key={account._id}>
                  <td>
                    <span style={{ fontWeight: '500' }}>{account.name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {account.email}</span>
                      {account.phone && (
                        <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {account.phone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${account.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {account.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-text" onClick={() => setSelectedAccount(account)}>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAccount && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button type="button" onClick={() => setSelectedAccount(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Receptionist Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>Name:</strong> {selectedAccount.name}</p>
              <p><strong>Email:</strong> {selectedAccount.email}</p>
              <p><strong>Phone:</strong> {selectedAccount.phone || '—'}</p>
              <p><strong>Status:</strong> {selectedAccount.status}</p>
              <p><strong>Role:</strong> {selectedAccount.role}</p>
              <p><strong>Login:</strong> /staff</p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedAccount(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button type="button" onClick={() => setShowAccountModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>Add Receptionist Account</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Front desk portal login at /staff — separate from housekeeping.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                <input type="text" className="input-field" value={newAccountData.name} onChange={(e) => setNewAccountData({ ...newAccountData, name: e.target.value })} placeholder="Enter full name" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                <input type="email" className="input-field" value={newAccountData.email} onChange={(e) => setNewAccountData({ ...newAccountData, email: e.target.value })} placeholder="Enter email" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Phone Number (optional)</label>
                <input type="text" className="input-field" value={newAccountData.phone} onChange={(e) => setNewAccountData({ ...newAccountData, phone: e.target.value })} placeholder="Enter phone number" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Password (optional)</label>
                <input type="password" className="input-field" value={newAccountData.password} onChange={(e) => setNewAccountData({ ...newAccountData, password: e.target.value })} placeholder="Default: password123" style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAccountModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAddAccount}>Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receptionist;
