import { CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import { getUser } from '../../utils/auth';
import { isMyTask } from '../../utils/housekeepingUtils';

const HousekeepingDashboard = () => {
  const user = getUser();
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, rRes] = await Promise.all([api.housekeeping.getTasks(), api.rooms.getAll()]);
      setTasks(tRes?.data?.tasks || []);
      setRooms(rRes?.data?.rooms || []);
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const myTasks = tasks.filter((t) => isMyTask(t, user));
  const displayTasks = myTasks.length > 0 ? myTasks : tasks;

  const pending = displayTasks.filter((t) => t.status === 'Pending');
  const inProgress = displayTasks.filter((t) => t.status === 'In Progress');
  const completed = displayTasks.filter((t) => t.status === 'Completed');
  const cleaningRooms = rooms.filter((r) => r.status === 'Cleaning').length;

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.housekeeping.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Housekeeping Dashboard</h1>
          <p className="page-subtitle">
            Live tasks and room status{user?.name ? ` — ${user.name}` : ''}.
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px', background: '#ffebee', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>My / All Tasks</span>
          <h2 style={{ margin: '4px 0' }}>{displayTasks.length}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Pending</span>
          <h2 style={{ margin: '4px 0' }}>{pending.length}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>In Progress</span>
          <h2 style={{ margin: '4px 0' }}>{inProgress.length}</h2>
        </div>
        <div className="card">
          <span className="text-muted" style={{ fontSize: '12px' }}>Rooms Cleaning</span>
          <h2 style={{ margin: '4px 0' }}>{cleaningRooms}</h2>
        </div>
      </div>

      <h3 style={{ marginBottom: '16px' }}>
        {myTasks.length > 0 ? 'Your Assignments' : 'All Housekeeping Tasks'}
      </h3>
      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading tasks...</p>}
      {!loading && displayTasks.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', padding: '24px' }}>
          No tasks yet. Admin can assign tasks under Housekeeping with your name.
        </p>
      )}
      <div className="grid grid-cols-1" style={{ gap: '16px' }}>
        {displayTasks.map((task) => (
          <div key={task._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'var(--color-surface-alt)', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', display: 'block' }}>Room</span>
                <h3 style={{ margin: 0 }}>{task.roomNumber}</h3>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0 }}>{task.task}</h4>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-success' : task.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                    {task.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  <span>
                    Priority:{' '}
                    <strong style={{ color: task.priority === 'High' ? 'var(--color-danger)' : 'inherit' }}>{task.priority}</strong>
                  </span>
                  <span>•</span>
                  <span>Assigned: {task.staffName || 'Unassigned'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {task.status === 'Pending' && (
                <button type="button" className="btn btn-primary" onClick={() => handleUpdateStatus(task._id, 'In Progress')}>
                  Start
                </button>
              )}
              {task.status === 'In Progress' && (
                <button type="button" className="btn btn-primary" onClick={() => handleUpdateStatus(task._id, 'Completed')}>
                  Complete
                </button>
              )}
              {task.status === 'Completed' && <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HousekeepingDashboard;
