import { UserCheck, UserMinus, Calendar, Search, Bell } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import { buildReceptionistDashboard } from '../../utils/receptionistStats';

const StaffDashboard = () => {
  const [counts, setCounts] = useState({
    arrivalsToday: 0,
    departuresToday: 0,
    checkedIn: 0,
    activeBookings: 0,
    pendingServices: 0,
    occupiedRooms: 0,
    totalRooms: 0,
  });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.dashboard.getReceptionistStats();
      const data = res?.data;
      if (data?.counts) setCounts(data.counts);
      if (data?.schedule) setSchedule(data.schedule);
    } catch (err) {
      console.error('Failed to load receptionist dashboard:', err);
      try {
        const [bRes, rRes, sRes] = await Promise.all([
          api.bookings.getAll(),
          api.rooms.getAll(),
          api.feedback.getServices(),
        ]);
        const { counts: c, schedule: s } = buildReceptionistDashboard(
          bRes?.data?.bookings || [],
          rRes?.data?.rooms || [],
          sRes?.data?.requests || []
        );
        setCounts(c);
        setSchedule(s);
        setError('');
      } catch (fallbackErr) {
        console.error('Dashboard fallback failed:', fallbackErr);
        setError(fallbackErr.message || err.message || 'Could not load dashboard data.');
        setSchedule([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = schedule.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.guestName || '').toLowerCase().includes(q) ||
      (b.guestEmail || '').toLowerCase().includes(q) ||
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.room?.number || '').toString().includes(q)
    );
  });

  const occupancyPct =
    counts.totalRooms > 0 ? Math.round((counts.occupiedRooms / counts.totalRooms) * 100) : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Front Desk Dashboard</h1>
          <p className="page-subtitle">Live data from bookings, rooms, and guest services.</p>
        </div>
        <div className="search-bar" style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search guest, room, booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 10px 10px 40px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                width: '280px',
              }}
            />
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            color: 'var(--color-danger)',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-4" style={{ gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#E3F2FD', color: '#1976D2', padding: '12px', borderRadius: '12px' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Expected Arrivals</span>
            <h2 style={{ margin: 0 }}>{counts.arrivalsToday}</h2>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#FBE9E7', color: '#D84315', padding: '12px', borderRadius: '12px' }}>
            <UserMinus size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Expected Departures</span>
            <h2 style={{ margin: 0 }}>{counts.departuresToday}</h2>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px', borderRadius: '12px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Checked In</span>
            <h2 style={{ margin: 0 }}>{counts.checkedIn}</h2>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFF8E1', color: '#F9A825', padding: '12px', borderRadius: '12px' }}>
            <Bell size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '12px' }}>Service Requests</span>
            <h2 style={{ margin: 0 }}>{counts.pendingServices}</h2>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '-16px 0 20px' }}>
        Room occupancy: {counts.occupiedRooms} / {counts.totalRooms} ({occupancyPct}%) · Active bookings:{' '}
        {counts.activeBookings}
      </p>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Today&apos;s Schedule</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Guest</th>
                <th>Email</th>
                <th>Room</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading from database...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No bookings found. Add bookings from Manage Bookings or check dates.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((item) => (
                  <tr key={`${item._id}-${item.activity}`}>
                    <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{item.bookingId || '—'}</td>
                    <td style={{ fontWeight: '600' }}>{item.guestName || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{item.guestEmail || '—'}</td>
                    <td>{item.room?.number ? `Room ${item.room.number}` : '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.activity === 'Check-In'
                            ? 'badge-info'
                            : item.activity === 'Check-Out'
                              ? 'badge-warning'
                              : 'badge-success'
                        }`}
                      >
                        {item.activity}
                      </span>
                    </td>
                    <td>{item.status}</td>
                    <td>
                      {(item.activity === 'Check-In' || item.activity === 'Check-Out') && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                          onClick={async () => {
                            try {
                              if (item.activity === 'Check-In') await api.bookings.checkIn(item._id);
                              else await api.bookings.checkOut(item._id);
                              loadData();
                            } catch (err) {
                              alert(err.message || 'Action failed');
                            }
                          }}
                        >
                          {item.activity === 'Check-In' ? 'Check In' : 'Check Out'}
                        </button>
                      )}
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

export default StaffDashboard;
