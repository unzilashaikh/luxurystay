import { Clock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import { getUser } from '../../utils/auth';
import { isMyTask } from '../../utils/housekeepingUtils';

const HousekeepingTasks = () => {
  const user = getUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.housekeeping.getTasks();
      setTasks(res?.data?.tasks || []);
    } catch (err) {
      setError(err.message || 'Could not load tasks.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const myTasks = tasks.filter((t) => isMyTask(t, user));
  const visibleTasks = showAll ? tasks : myTasks.length > 0 ? myTasks : tasks;

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.housekeeping.updateStatus(id, status);
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            Cleaning tasks assigned to you{user?.name ? ` (${user.name})` : ''}.
          </p>
        </div>
        <button type="button" className={`btn ${showAll ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show My Tasks' : 'Show All Tasks'}
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px', background: '#ffebee', color: 'var(--color-danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Task Type</th>
                <th>Priority</th>
                <th>Scheduled</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && visibleTasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No tasks yet. Ask admin: Admin → Housekeeping → New Task → assign to &quot;{user?.name || 'you'}&quot;. Or click Show All Tasks.
                  </td>
                </tr>
              )}
              {visibleTasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <span style={{ fontWeight: '600' }}>Room {task.roomNumber}</span>
                  </td>
                  <td>{task.task}</td>
                  <td>
                    <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-warning' : 'badge-info'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {task.scheduledDate ? new Date(task.scheduledDate).toLocaleString() : '—'}
                    </span>
                  </td>
                  <td>{task.staffName || 'Unassigned'}</td>
                  <td>
                    <span className={`badge ${task.status === 'In Progress' ? 'badge-info' : task.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {task.status === 'Pending' && (
                        <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleUpdateStatus(task._id, 'In Progress')}>
                          Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button type="button" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleUpdateStatus(task._id, 'Completed')}>
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingTasks;
