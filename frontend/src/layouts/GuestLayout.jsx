import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';
import { useGuest } from '../context/GuestContext';
import { Home, Calendar, Coffee, CreditCard, User, LogOut, MessageSquare } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const GuestLayout = () => {
  const navigate = useNavigate();
  const { user, activeBooking, loading } = useGuest();

  const navItems = [
    { name: 'My Dashboard', path: '/guest/dashboard', icon: Home },
    { name: 'My Bookings', path: '/guest/bookings', icon: Calendar },
    { name: 'Room Service', path: '/guest/services', icon: Coffee },
    { name: 'My Billing', path: '/guest/billing', icon: CreditCard },
    { name: 'Feedback', path: '/guest/feedback', icon: MessageSquare },
    { name: 'My Profile', path: '/guest/profile', icon: User },
  ];

  const roomLabel = loading
    ? 'Loading...'
    : activeBooking?.room?.number
      ? `Room ${activeBooking.room.number}`
      : 'No room assigned';

  return (
    <div className="layout-container guest-portal">
      <aside className="sidebar" style={{ borderRight: '1px solid var(--color-border)' }}>
        <div className="sidebar-brand guest-sidebar-brand">
          <BrandLogo size="md" />
          <div className="brand-text">
            <span className="brand-subtitle">GUEST PORTAL</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <nav className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} className="nav-icon" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="nav-item logout"
            onClick={() => {
              clearAuth();
              navigate('/guest');
            }}
          >
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="layout-content">
        <header className="topbar" style={{ justifyContent: 'space-between', padding: '0 32px' }}>
          <div className="welcome-text">
            <span className="text-muted" style={{ fontSize: '14px' }}>Welcome back,</span>
            <h4 style={{ margin: 0 }}>{loading && !user ? '...' : user?.name || 'Guest'}</h4>
          </div>
          <div className="room-info" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span className="badge badge-info">{roomLabel}</span>
            {activeBooking?.bookingId && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{activeBooking.bookingId}</span>
            )}
          </div>
        </header>
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GuestLayout;
