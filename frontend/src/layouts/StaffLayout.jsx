import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, CreditCard, User, LogOut, Key } from 'lucide-react';
import { clearAuth, getUser } from '../utils/auth';
import BrandLogo from '../components/BrandLogo';

const StaffLayout = () => {
  const navigate = useNavigate();
  const user = getUser();
  const navItems = [
    { name: 'Front Desk', path: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Check-In/Out', path: '/staff/checkin', icon: Key },
    { name: 'Bookings', path: '/staff/bookings', icon: Calendar },
    { name: 'Guest Records', path: '/staff/guests', icon: Users },
    { name: 'Billing', path: '/staff/billing', icon: CreditCard },
    { name: 'My Profile', path: '/staff/profile', icon: User },
  ];

  return (
    <div className="layout-container staff-portal">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandLogo size="lg" className="staff-sidebar-logo" />
          <div className="brand-text">
            <span className="brand-subtitle">RECEPTIONIST PORTAL</span>
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
          <button className="nav-item logout" onClick={() => { clearAuth(); navigate('/staff'); }}>
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="layout-content">
        <header className="topbar" style={{ justifyContent: 'space-between', padding: '0 32px' }}>
          <div>
            <h4 style={{ margin: 0 }}>Receptionist: {user?.name || '—'}</h4>
            <span className="text-muted" style={{ fontSize: '12px' }}>Front desk · Check-in & bookings</span>
          </div>
          <div className="shift-info">
            <span className="badge badge-info">Morning Shift</span>
          </div>
        </header>
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
