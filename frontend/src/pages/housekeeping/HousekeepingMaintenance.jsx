import { AlertTriangle, Plus, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import { getUser } from '../../utils/auth';

const HousekeepingMaintenance = () => {
  const user = getUser();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomId: '', description: '', priority: 'Medium' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mRes, rRes] = await Promise.all([api.maintenance.getRequests(), api.rooms.getAll()]);
      setRequests(mRes?.data?.requests || []);
      setRooms(rRes?.data?.rooms || []);
    } catch (err) {
      setError(err.message || 'Could not load maintenance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.description.trim()) {
      alert('Select a room and describe the issue.');
      return;
    }
    setSaving(true);
    try {
      await api.maintenance.createRequest({
        room: form.roomId,
        description: form.description.trim(),
        priority: form.priority,
        reportedBy: user?.name || 'Housekeeping Staff',
      });
      setShowForm(false);
      setForm({ roomId: '', description: '', priority: 'Medium' });
      await loadData();
      alert('Maintenance issue reported.');
    } catch (err) {
      alert(err.message || 'Failed to report issue');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === 'Resolved') {
        await api.maintenance.resolveRequest(id);
      } else {
        await api.maintenance.updateRequest(id, { status });
      }
      await loadData();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const open = requests.filter((r) => !['Resolved', 'Cancelled'].includes(r.status));
  const resolved = requests.filter((r) => r.status === 'Resolved');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Reports</h1>
          <p className="page-subtitle">Report room issues and track repair status from the database.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Report Issue
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px', background: '#ffebee', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Open Issues</span>
          <h2 style={{ margin: '4px 0' }}>{open.length}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Resolved</span>
          <h2 style={{ margin: '4px 0', color: 'var(--color-success)' }}>{resolved.length}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Total Reports</span>
          <h2 style={{ margin: '4px 0' }}>{requests.length}</h2>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No maintenance reports yet.
                  </td>
                </tr>
              )}
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <strong>Room {req.roomNumber}</strong>
                  </td>
                  <td style={{ maxWidth: '280px' }}>{req.description}</td>
                  <td>
                    <span
                      className={`badge ${
                        req.priority === 'Urgent' || req.priority === 'High'
                          ? 'badge-danger'
                          : req.priority === 'Medium'
                            ? 'badge-warning'
                            : 'badge-info'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        req.status === 'Resolved' ? 'badge-success' : req.status === 'In Progress' ? 'badge-info' : 'badge-warning'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{req.reportedBy || '—'}</td>
                  <td>
                    {req.status === 'Reported' && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px', marginRight: '6px' }}
                        onClick={() => handleStatusUpdate(req._id, 'In Progress')}
                      >
                        Start
                      </button>
                    )}
                    {['Reported', 'Assigned', 'In Progress'].includes(req.status) && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleStatusUpdate(req._id, 'Resolved')}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '28px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={22} color="var(--color-warning)" /> Report Room Issue
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Maintenance team will see this in the database.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Room</label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  required
                >
                  <option value="">— Select room —</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.number} — {r.type} ({r.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Issue description</label>
                <textarea
                  className="input-field"
                  rows={4}
                  style={{ width: '100%', resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. AC not cooling, leaking faucet..."
                  required
                />
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select
                  className="input-field"
                  style={{ width: '100%' }}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingMaintenance;
