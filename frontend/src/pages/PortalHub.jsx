import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import '../pages/Login.css';

const portals = [
  {
    title: 'Admin',
    desc: 'Hotel administration & settings',
    path: '/admin',
    letter: 'A',
  },
  {
    title: 'Receptionist',
    desc: 'Front desk — bookings & check-in',
    path: '/staff',
    letter: 'R',
  },
  {
    title: 'Housekeeping',
    desc: 'Room cleaning & tasks',
    path: '/housekeeping',
    letter: 'H',
  },
  {
    title: 'Guest',
    desc: 'Guest services & reservations',
    path: '/guest',
    letter: 'G',
  },
];

const PortalHub = () => (
  <div className="login-page">
    <div className="login-card" style={{ maxWidth: '480px' }}>
      <div className="login-brand">
        <BrandLogo size="xl" className="login-form-logo" />
        <p>Choose your portal to sign in</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {portals.map((p) => (
          <Link
            key={p.path}
            to={p.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '4px',
              textDecoration: 'none',
              color: '#fff',
              transition: 'background 0.2s',
            }}
            className="portal-hub-link"
          >
            <span
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(193, 161, 102, 0.9)',
                color: '#1a1a1a',
                fontWeight: 700,
                borderRadius: '4px',
                flexShrink: 0,
              }}
            >
              {p.letter}
            </span>
            <span style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '15px' }}>{p.title}</strong>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>{p.desc}</span>
            </span>
            <span style={{ opacity: 0.7 }}>→</span>
          </Link>
        ))}
      </div>

      <div className="login-footer">
        <Link to="/" className="login-back">
          ← Back to website
        </Link>
      </div>
    </div>
  </div>
);

export default PortalHub;
