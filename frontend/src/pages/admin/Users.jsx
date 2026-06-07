import { UserPlus, Shield, Mail, BadgeCheck, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

// Only roles with a built login portal (see App.jsx routes)
const ALLOWED_ROLES = ['Receptionist', 'Housekeeping Staff', 'Guest'];
const HOUSEKEEPING_ROLES = ['Housekeeping Staff'];
const ADD_ROLE_OPTIONS = [
  { label: 'Receptionist', value: 'Receptionist' },
  { label: 'Housekeeping', value: 'Housekeeping Staff' },
  { label: 'Guest', value: 'Guest' },
];
const EDIT_ROLE_OPTIONS = [...ADD_ROLE_OPTIONS];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', role: 'Receptionist', email: '', password: '', status: 'Active' });
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.getAll();
      if (res?.data?.users) setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!ALLOWED_ROLES.includes(u.role)) return false;
    if (roleFilter === 'receptionist') return u.role === 'Receptionist';
    if (roleFilter === 'housekeeping') return HOUSEKEEPING_ROLES.includes(u.role);
    if (roleFilter === 'guest') return u.role === 'Guest';
    return true;
  });

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.role) {
      alert('Please fill in Name, Email, and Role.');
      return;
    }
    try {
      await api.users.create({
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password || 'password123',
        role: newUserData.role,
        status: newUserData.status
      });
      fetchUsers();
      setShowAddStaffModal(false);
      setNewStaffData({ name: '', role: 'Receptionist', email: '', password: '', status: 'Active' });
    } catch (err) {
      alert(err.message || 'Failed to add user');
    }
  };

  const handleEditSubmit = async () => {
    if (!editingUser.name || !editingUser.email || !editingUser.role) {
      alert('Please fill in Name, Email, and Role.');
      return;
    }
    try {
      await api.users.update(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      });
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.users.delete(deleteConfirmId);
      fetchUsers();
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage receptionist, housekeeping, and guest accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddStaffModal(true)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} /> Add User
        </button>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Users' },
            { key: 'receptionist', label: 'Receptionist' },
            { key: 'housekeeping', label: 'Housekeeping' },
            { key: 'guest', label: 'Guests' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`btn ${roleFilter === key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRoleFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading users...</td></tr>
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>No users found for this filter.</td></tr>
              )}
              {filteredUsers.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: '600' }}>
                        {member.name.charAt(0)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{member.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={10} /> {member.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={10} /> {member.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${member.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {member.status === 'Active' && <BadgeCheck size={12} style={{ marginRight: '4px' }} />}
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button className="btn-text" onClick={() => setEditingUser({ ...member })}>Edit</button>
                      <button className="btn-text" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteConfirmId(member._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddUserModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowAddStaffModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Add New User</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                <input type="text" className="input-field" value={newUserData.name} onChange={(e) => setNewStaffData({ ...newUserData, name: e.target.value })} placeholder="Enter full name" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                <input type="email" className="input-field" value={newUserData.email} onChange={(e) => setNewStaffData({ ...newUserData, email: e.target.value })} placeholder="Enter email address" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Password (optional)</label>
                <input type="password" className="input-field" value={newUserData.password} onChange={(e) => setNewStaffData({ ...newUserData, password: e.target.value })} placeholder="Default: password123" style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Role</label>
                <select className="input-field" value={newUserData.role} onChange={(e) => setNewStaffData({ ...newUserData, role: e.target.value })} style={{ width: '100%' }}>
                  {ADD_ROLE_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Status</label>
                <select className="input-field" value={newUserData.status} onChange={(e) => setNewStaffData({ ...newUserData, status: e.target.value })} style={{ width: '100%' }}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowAddStaffModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddUser}>Save User</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Edit User</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                <input type="text" className="input-field" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email Address</label>
                <input type="email" className="input-field" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Role</label>
                <select className="input-field" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} style={{ width: '100%' }}>
                  {EDIT_ROLE_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Status</label>
                <select className="input-field" value={editingUser.status} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} style={{ width: '100%' }}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-danger)' }}>Confirm Deletion</h2>
            <p style={{ marginBottom: '24px', color: 'var(--color-text-muted)' }}>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn" style={{ backgroundColor: 'var(--color-danger)', color: 'white' }} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
