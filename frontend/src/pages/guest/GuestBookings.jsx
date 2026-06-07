import { useGuest } from '../../context/GuestContext';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const GuestBookings = () => {
  const { bookings, loading } = useGuest();

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Reservations linked to your account.</p>
        </div>
      </div>

      <div className="card">
        {loading && <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading bookings...</p>}
        {!loading && bookings.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No bookings found for your account. Ask reception to link your stay to this email.
          </p>
        )}
        {!loading && bookings.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{b.bookingId}</td>
                    <td>Room {b.room?.number ?? '—'} {b.room?.type ? `(${b.room.type})` : ''}</td>
                    <td>{formatDate(b.checkIn)}</td>
                    <td>{formatDate(b.checkOut)}</td>
                    <td>
                      <span className={`badge ${b.status === 'Checked In' || b.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookings;
