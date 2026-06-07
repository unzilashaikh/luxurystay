import { ClipboardCheck, AlertTriangle, CheckCircle2, Clock, X, UserPlus, Mail, Search, Filter, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const TASK_TYPE_MAP = {
  'Departure Clean': 'Full Clean',
  'Stay-over Clean': 'Touch Up',
  'Deep Clean': 'Deep Clean',
  'Turndown Service': 'Turn Down'
};

const Housekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    roomId: '',
    type: 'Departure Clean',
    priority: 'Medium',
    staffId: '',
    assignedTo: 'Unassigned',
  });
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newIssueData, setNewIssueData] = useState({ roomId: '', description: '', priority: 'High' });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccountData, setNewAccountData] = useState({ name: '', email: '', phone: '', password: '' });
  const [housekeepingAccounts, setHousekeepingAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [showAccountFilters, setShowAccountFilters] = useState(false);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchHousekeepingAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await api.users.getAll();
      const accounts = (res?.data?.users || []).filter((u) => u.role === 'Housekeeping Staff');
      setHousekeepingAccounts(accounts);
    } catch (err) {
      console.error('Failed to load housekeeping accounts:', err);
    } finally {
      setAccountsLoading(false);
    }
  };

  const filteredHousekeepingAccounts = housekeepingAccounts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
      (a.phone || '').includes(accountSearchQuery);
    const matchesStatus = accountStatusFilter === 'All' || a.status === accountStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const res = await api.rooms.getAll();
      setRooms(res?.data?.rooms || []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.housekeeping.getTasks();
      if (res?.data?.tasks) setTasks(res.data.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchHousekeepingAccounts();
    fetchRooms();
  }, []);

  const selectedTaskRoom = rooms.find((r) => r._id === newTaskData.roomId);
  const selectedIssueRoom = rooms.find((r) => r._id === newIssueData.roomId);

  const RoomDetailsBox = ({ room }) => {
    if (!room) return null;
    return (
      <div
        style={{
          marginTop: '10px',
          padding: '12px 14px',
          background: '#f8f6f2',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          fontSize: '13px',
        }}
      >
        <p style={{ margin: '0 0 6px' }}>
          <strong>Room:</strong> {room.number}
        </p>
        <p style={{ margin: '0 0 6px' }}>
          <strong>Type:</strong> {room.type}
        </p>
        <p style={{ margin: '0 0 6px' }}>
          <strong>Floor:</strong> {room.floor}
        </p>
        <p style={{ margin: '0 0 6px' }}>
          <strong>Status:</strong>{' '}
          <span
            className={`badge ${
              room.status === 'Available'
                ? 'badge-success'
                : room.status === 'Occupied'
                  ? 'badge-warning'
                  : 'badge-info'
            }`}
          >
            {room.status}
          </span>
        </p>
        <p style={{ margin: 0 }}>
          <strong>Price/night:</strong> ${room.price}
        </p>
      </div>
    );
  };

  const handleAddHousekeepingAccount = async () => {
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
        role: 'Housekeeping Staff',
        status: 'Active',
      });
      fetchHousekeepingAccounts();
      setShowAccountModal(false);
      setNewAccountData({ name: '', email: '', phone: '', password: '' });
      alert('Housekeeping account created. They can sign in at /housekeeping');
    } catch (err) {
      alert(err.message || 'Failed to create housekeeping account');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskData.roomId) {
      alert('Please select a room from the list.');
      return;
    }
    try {
      await api.housekeeping.createTask({
        room: newTaskData.roomId,
        staff: newTaskData.staffId || undefined,
        staffName: newTaskData.assignedTo,
        task: TASK_TYPE_MAP[newTaskData.type] || 'Full Clean',
        priority: newTaskData.priority,
      });
      fetchTasks();
      setShowTaskModal(false);
      setNewTaskData({
        roomId: '',
        type: 'Departure Clean',
        priority: 'Medium',
        staffId: '',
        assignedTo: 'Unassigned',
      });
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleReportIssue = async () => {
    if (!newIssueData.roomId || !newIssueData.description) {
      alert('Please select a room and describe the issue.');
      return;
    }
    try {
      await api.maintenance.createRequest({
        room: newIssueData.roomId,
        description: newIssueData.description,
        priority: newIssueData.priority === 'Critical' ? 'Urgent' : newIssueData.priority,
        reportedBy: 'Admin'
      });
      setShowIssueModal(false);
      setNewIssueData({ roomId: '', description: '', priority: 'High' });
      alert('Maintenance issue reported successfully.');
    } catch (err) {
      alert(err.message || 'Failed to report issue');
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await api.housekeeping.updateStatus(taskId, status);
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Housekeeping</h1>
          <p className="page-subtitle">Manage cleaning schedules and maintenance requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => setShowAccountModal(true)}>
            <UserPlus size={18} style={{ marginRight: '8px' }} /> Add Housekeeping Account
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (rooms.length === 0) fetchRooms();
              setShowIssueModal(true);
            }}
          >
            <AlertTriangle size={18} style={{ marginRight: '8px' }} /> Report Issue
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (housekeepingAccounts.length === 0) fetchHousekeepingAccounts();
              if (rooms.length === 0) fetchRooms();
              setShowTaskModal(true);
            }}
          >
            <ClipboardCheck size={18} style={{ marginRight: '8px' }} /> New Task
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="stat-title" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Total Tasks</p>
          <h3 className="stat-value" style={{ margin: '8px 0' }}>{tasks.length}</h3>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="stat-title" style={{ fontSize: '13px', color: 'var(--color-warning)' }}>Pending</p>
          <h3 className="stat-value" style={{ margin: '8px 0' }}>{tasks.filter((t) => t.status === 'Pending').length}</h3>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="stat-title" style={{ fontSize: '13px', color: 'var(--color-info)' }}>In Progress</p>
          <h3 className="stat-value" style={{ margin: '8px 0' }}>{tasks.filter((t) => t.status === 'In Progress').length}</h3>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="stat-title" style={{ fontSize: '13px', color: 'var(--color-success)' }}>Completed</p>
          <h3 className="stat-value" style={{ margin: '8px 0' }}>{tasks.filter((t) => t.status === 'Completed').length}</h3>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Housekeeping Accounts</h3>
        <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search housekeeping by name, email or phone..."
              style={{ paddingLeft: '40px', width: '100%' }}
              value={accountSearchQuery}
              onChange={(e) => setAccountSearchQuery(e.target.value)}
            />
          </div>
          <button className={`btn ${showAccountFilters ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowAccountFilters(!showAccountFilters)}>
            <Filter size={18} style={{ marginRight: '8px' }} /> Filters
          </button>
        </div>

        {showAccountFilters && (
          <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '20px', border: '1px solid var(--color-border)' }}>
            <div className="filter-group">
              <label className="input-label">Status</label>
              <select className="input-field" value={accountStatusFilter} onChange={(e) => setAccountStatusFilter(e.target.value)}>
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
                <th>Housekeeping Name</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accountsLoading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading housekeeping accounts...</td></tr>
              )}
              {!accountsLoading && filteredHousekeepingAccounts.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>No housekeeping accounts found. Add one to get started.</td></tr>
              )}
              {filteredHousekeepingAccounts.map((account) => (
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

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Details</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Loading tasks...</td></tr>
              )}
              {!loading && tasks.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>No housekeeping tasks yet.</td></tr>
              )}
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>Room {task.roomNumber}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{task.task}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: task.priority === 'High' ? 'var(--color-danger)' : task.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-text-muted)', fontWeight: '500', fontSize: '13px' }}>
                      {task.priority}
                    </span>
                  </td>
                  <td><span style={{ fontSize: '13px' }}>{task.staffName || 'Unassigned'}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {task.status === 'Completed' ? <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} /> : <Clock size={14} style={{ color: 'var(--color-warning)' }} />}
                      <span className={`badge ${task.status === 'Completed' ? 'badge-success' : task.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    {task.status === 'Pending' && (
                      <button className="btn-text" onClick={() => handleUpdateStatus(task._id, 'In Progress')}>Start</button>
                    )}
                    {task.status === 'In Progress' && (
                      <button className="btn-text" onClick={() => handleUpdateStatus(task._id, 'Completed')}>Complete</button>
                    )}
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
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>Housekeeping Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>Name:</strong> {selectedAccount.name}</p>
              <p><strong>Email:</strong> {selectedAccount.email}</p>
              <p><strong>Phone:</strong> {selectedAccount.phone || '—'}</p>
              <p><strong>Status:</strong> {selectedAccount.status}</p>
              <p><strong>Role:</strong> {selectedAccount.role}</p>
              <p><strong>Login:</strong> /housekeeping</p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedAccount(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowTaskModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>New Housekeeping Task</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Select room (from database)
                </label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newTaskData.roomId}
                  onChange={(e) => setNewTaskData({ ...newTaskData, roomId: e.target.value })}
                  disabled={roomsLoading}
                >
                  <option value="">{roomsLoading ? 'Loading rooms...' : '— Choose room —'}</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.number} — {r.type} — {r.floor} — {r.status}
                    </option>
                  ))}
                </select>
                {rooms.length === 0 && !roomsLoading && (
                  <p style={{ fontSize: '12px', color: 'var(--color-warning)', marginTop: '8px' }}>
                    Koi room nahi. Pehle Room Management se rooms add karo.
                  </p>
                )}
                <RoomDetailsBox room={selectedTaskRoom} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Task Type</label>
                <select className="input-field" value={newTaskData.type} onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value })} style={{ width: '100%' }}>
                  <option>Departure Clean</option>
                  <option>Stay-over Clean</option>
                  <option>Deep Clean</option>
                  <option>Turndown Service</option>
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Priority</label>
                <select className="input-field" value={newTaskData.priority} onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })} style={{ width: '100%' }}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Assign To (housekeeping staff)
                </label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newTaskData.staffId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) {
                      setNewTaskData({ ...newTaskData, staffId: '', assignedTo: 'Unassigned' });
                      return;
                    }
                    const person = housekeepingAccounts.find((a) => a._id === id);
                    setNewTaskData({
                      ...newTaskData,
                      staffId: id,
                      assignedTo: person?.name || 'Unassigned',
                    });
                  }}
                >
                  <option value="">— Unassigned —</option>
                  {housekeepingAccounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
                {housekeepingAccounts.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--color-warning)', marginTop: '8px' }}>
                    Pehle &quot;Add Housekeeping Account&quot; se staff account banao.
                  </p>
                )}
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddTask}>Save Task</button>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowAccountModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>Add Housekeeping Account</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Housekeeping portal login — not reception (front desk). Sign in at /housekeeping.
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
              <button className="btn btn-outline" onClick={() => setShowAccountModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddHousekeepingAccount}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowIssueModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-warning)' }}>Report Maintenance Issue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Select room
                </label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={newIssueData.roomId}
                  onChange={(e) => setNewIssueData({ ...newIssueData, roomId: e.target.value })}
                  disabled={roomsLoading}
                >
                  <option value="">{roomsLoading ? 'Loading rooms...' : '— Choose room —'}</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.number} — {r.type} — {r.floor} — {r.status}
                    </option>
                  ))}
                </select>
                <RoomDetailsBox room={selectedIssueRoom} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Issue Description</label>
                <textarea className="input-field" value={newIssueData.description} onChange={(e) => setNewIssueData({ ...newIssueData, description: e.target.value })} placeholder="Describe the issue..." style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Priority</label>
                <select className="input-field" value={newIssueData.priority} onChange={(e) => setNewIssueData({ ...newIssueData, priority: e.target.value })} style={{ width: '100%' }}>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowIssueModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-warning)', color: '#000', borderColor: 'var(--color-warning)' }} onClick={handleReportIssue}>Submit Issue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Housekeeping;
