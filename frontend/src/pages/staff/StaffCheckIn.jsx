import { UserCheck, UserMinus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import { formatDate, isSameCalendarDay } from '../../utils/dateUtils';

const StaffCheckIn = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bRes, rRes] = await Promise.all([api.bookings.getAll(), api.rooms.getAll()]);
      if (bRes?.data?.bookings) setBookings(bRes.data.bookings);
      if (rRes?.data?.rooms) setRooms(rRes.data.rooms);
    } catch (err) {
      console.error('Failed to load check-in data:', err);
      setError(err.message || 'Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const departures = bookings.filter((b) => b.status === 'Checked In');
  const arrivals = bookings.filter((b) => ['Pending', 'Confirmed'].includes(b.status));

  const getRoomStatus = (roomId) => {
    const id = roomId?._id || roomId;
    const room = rooms.find((r) => r._id === id);
    if (!room) return 'Unknown';
    if (room.status === 'Available') return 'Ready';
    if (room.status === 'Cleaning') return 'Cleaning';
    return room.status;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-In / Check-Out</h1>
          <p className="page-subtitle">
            Pending arrivals and checked-in guests — today&apos;s dates highlighted.
          </p>
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

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading from database...</p>}

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserMinus size={20} color="var(--color-danger)" /> Guests to Check Out
            </h3>
            <span className="badge badge-danger">{departures.length} Remaining</span>
          </div>
          {departures.length === 0 && !loading && (
            <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No guests currently checked in.</p>
          )}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Guest</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {departures.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.room?.number || '—'}</strong>
                    </td>
                    <td>{item.guestName}</td>
                    <td style={{ fontSize: '13px' }}>
                      {formatDate(item.checkOut)}
                      {isSameCalendarDay(item.checkOut) && (
                        <span className="badge badge-warning" style={{ marginLeft: '6px' }}>
                          Today
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-warning">{item.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={async () => {
                          try {
                            await api.bookings.checkOut(item._id);
                            fetchData();
                          } catch (err) {
                            alert(err.message || 'Check-out failed');
                          }
                        }}
                      >
                        Check-Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--color-success)" /> Guests to Check In
            </h3>
            <span className="badge badge-success">{arrivals.length} Remaining</span>
          </div>
          {arrivals.length === 0 && !loading && (
            <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No pending or confirmed arrivals.</p>
          )}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Check-In</th>
                  <th>Room Type</th>
                  <th>Room Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map((item) => {
                  const roomStatus = getRoomStatus(item.room?._id || item.room);
                  return (
                    <tr key={item._id}>
                      <td>{item.guestName}</td>
                      <td style={{ fontSize: '13px' }}>
                        {formatDate(item.checkIn)}
                        {isSameCalendarDay(item.checkIn) && (
                          <span className="badge badge-info" style={{ marginLeft: '6px' }}>
                            Today
                          </span>
                        )}
                      </td>
                      <td>{item.room?.type || '—'}</td>
                      <td>
                        <span
                          className={`badge ${
                            roomStatus === 'Ready' || roomStatus === 'Available'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {roomStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          disabled={!['Available', 'Ready'].includes(roomStatus)}
                          onClick={async () => {
                            try {
                              await api.bookings.checkIn(item._id);
                              fetchData();
                            } catch (err) {
                              alert(err.message || 'Check-in failed');
                            }
                          }}
                        >
                          Check-In
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCheckIn;
