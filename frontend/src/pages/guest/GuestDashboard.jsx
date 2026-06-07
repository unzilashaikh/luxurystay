import { Utensils, Bell, Waves, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGuest } from '../../context/GuestContext';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const GuestDashboard = () => {
  const { user, activeBooking, bookings, loading, loadError, refresh } = useGuest();

  const roomDisplay = activeBooking?.room?.number
    ? `Room ${activeBooking.room.number}`
    : null;
  const checkOutDisplay = activeBooking?.checkOut ? formatDate(activeBooking.checkOut) : null;
  const checkInDisplay = activeBooking?.checkIn ? formatDate(activeBooking.checkIn) : null;

  return (
    <div className="page-content">
      {loadError && (
        <div
          className="card"
          style={{
            marginBottom: '16px',
            padding: '14px 18px',
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-danger)' }}>{loadError}</p>
          <button type="button" className="btn btn-outline" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      <div
        className="welcome-hero card"
        style={{
          background: 'linear-gradient(135deg, #C5A059 0%, #D4B475 100%)',
          color: 'white',
          padding: '48px',
          border: 'none',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '8px' }}>
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
            {activeBooking
              ? `Your stay is confirmed — ${activeBooking.bookingId || 'booking active'}.`
              : loading
                ? 'Loading your stay details...'
                : `No booking linked yet to ${user?.email || 'your email'}.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginTop: '32px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Current Room
            </span>
            <h3 style={{ color: 'white', margin: '4px 0 0' }}>{loading ? '...' : roomDisplay || '—'}</h3>
            {activeBooking?.room?.type && (
              <span style={{ fontSize: '13px', opacity: 0.85 }}>{activeBooking.room.type}</span>
            )}
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '32px' }}>
            <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Check-in
            </span>
            <h3 style={{ color: 'white', margin: '4px 0 0' }}>{loading ? '...' : checkInDisplay || '—'}</h3>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '32px' }}>
            <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Check-out
            </span>
            <h3 style={{ color: 'white', margin: '4px 0 0' }}>{loading ? '...' : checkOutDisplay || '—'}</h3>
          </div>
          {activeBooking?.status && (
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '32px' }}>
              <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Status
              </span>
              <h3 style={{ color: 'white', margin: '4px 0 0' }}>{activeBooking.status}</h3>
            </div>
          )}
        </div>
      </div>

      {!loading && !activeBooking && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px', background: '#fffbf5', border: '1px solid #e8dcc8' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Booking nahi mili?</p>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Admin ko booking banate waqt <strong>dropdown se aapka guest account</strong> select karna hoga (
            <strong>{user?.email}</strong>). Purani booking ho to dubara email ke sath booking banao, phir yahan{' '}
            <button type="button" className="btn-text" onClick={refresh}>
              Refresh
            </button>{' '}
            dabao.
          </p>
        </div>
      )}

      <div className="quick-actions">
        <h3 style={{ marginBottom: '20px' }}>In-Room Services</h3>
        <div className="grid grid-cols-4" style={{ gap: '20px' }}>
          {[
            { name: 'Room Service', icon: Utensils, color: '#FF7675', path: '/guest/services' },
            { name: 'Housekeeping', icon: Bell, color: '#74B9FF', path: '/guest/services' },
            { name: 'Spa & Wellness', icon: Waves, color: '#55E6C1', path: '/wellness' },
            { name: 'Concierge', icon: Map, color: '#A29BFE', path: '/contact' },
          ].map((action) => (
            <Link
              key={action.name}
              to={action.path}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '32px',
                gap: '16px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: `${action.color}15`,
                  color: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <action.icon size={32} />
              </div>
              <span style={{ fontWeight: '600' }}>{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px', marginTop: '32px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>My Bookings</h3>
            <Link to="/guest/bookings" className="btn-text">
              View All
            </Link>
          </div>
          {loading && <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading bookings...</p>}
          {!loading && bookings.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>No bookings yet.</p>
          )}
          {!loading &&
            bookings.map((b) => (
              <div
                key={b._id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '14px',
                }}
              >
                <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{b.bookingId}</div>
                <div>Room {b.room?.number ?? '—'} · {b.room?.type}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.status}
                </div>
              </div>
            ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>My Profile</h3>
          <p style={{ fontSize: '14px', margin: '0 0 8px' }}>
            <strong>Name:</strong> {user?.name || '—'}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 8px' }}>
            <strong>Email:</strong> {user?.email || '—'}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 16px' }}>
            <strong>Phone:</strong> {user?.phone || '—'}
          </p>
          <Link to="/guest/profile" className="btn btn-outline" style={{ display: 'inline-block' }}>
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
