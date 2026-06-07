import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';
import { ClipboardList, CheckSquare, AlertTriangle, User, LogOut, Package } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const HousekeepingLayout = () => {
  const navigate = useNavigate();
  const user = getUser();
  const navItems = [
    { name: 'Dashboard', path: '/housekeeping/dashboard', icon: ClipboardList },
    { name: 'My Tasks', path: '/housekeeping/tasks', icon: CheckSquare },
    { name: 'Inventory', path: '/housekeeping/inventory', icon: Package },
    { name: 'Maintenance', path: '/housekeeping/maintenance', icon: AlertTriangle },
    { name: 'My Profile', path: '/housekeeping/profile', icon: User },
  ];

  return (
    <div className="layout-container housekeeping-portal">
      <aside className="sidebar">
        <div className="sidebar-brand hk-sidebar-brand">
          <BrandLogo size="lg" className="hk-sidebar-logo" />
          <span className="brand-subtitle hk-brand-subtitle">HOUSEKEEPING</span>
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
          <button className="nav-item logout" onClick={() => { clearAuth(); navigate('/housekeeping'); }}>
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="layout-content">
        <header className="topbar" style={{ justifyContent: 'space-between', padding: '0 32px' }}>
          <div>
            <h4 style={{ margin: 0 }}>Housekeeping: {user?.name || 'Staff'}</h4>
            <span className="text-muted" style={{ fontSize: '12px' }}>{user?.email || 'Housekeeping portal'}</span>
          </div>
          <div className="status-badge">
            <span className="badge badge-success">On Duty</span>
          </div>
        </header>
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HousekeepingLayout;
