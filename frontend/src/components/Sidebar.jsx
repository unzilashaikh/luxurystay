import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BedDouble, CalendarCheck, CreditCard, ClipboardList, BarChart3, Settings, LogOut, UserSearch, Star, Sparkles, ConciergeBell, Package, Building2 } from 'lucide-react';
import { clearAuth } from '../utils/auth';
import BrandLogo from './BrandLogo';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Room Management', path: '/admin/rooms', icon: BedDouble },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Guest Profiles', path: '/admin/guests', icon: UserSearch },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Receptionist', path: '/admin/receptionist', icon: ConciergeBell },
    { name: 'Housekeeping', path: '/admin/housekeeping', icon: ClipboardList },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Feedback & Services', path: '/admin/feedback', icon: Star },
    { name: 'Wellness Packages', path: '/admin/wellness-packages', icon: Sparkles },
    { name: 'Residences', path: '/admin/residences', icon: Building2 },
    { name: 'Billing', path: '/admin/billing', icon: CreditCard },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand admin-sidebar-brand">
        <BrandLogo size="xl" className="admin-sidebar-logo" />
        <span className="brand-subtitle admin-brand-subtitle">ADMINISTRATION</span>
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">MENU</p>
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
        <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} className="nav-icon" />
          <span>Settings</span>
        </NavLink>
        <button className="nav-item logout" onClick={() => { clearAuth(); navigate('/admin'); }}>
          <LogOut size={20} className="nav-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
