import { Link } from 'react-router-dom';
import PortalLogin from '../../components/PortalLogin';

const AdminLogin = () => (
  <>
    <PortalLogin
      portalPath="/admin"
      dashboardPath="/admin/dashboard"
      allowedRoles={['Admin']}
      subtitle="Admin portal — administrators only"
      wrongPortalMessage="Only Admin accounts can sign in here. Receptionist, Housekeeping, and Guest must use their own portal."
    />
    <p style={{ position: 'fixed', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 2, fontSize: '13px' }}>
      <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)' }}>
        Not admin? Choose another portal →
      </Link>
    </p>
  </>
);

export default AdminLogin;
