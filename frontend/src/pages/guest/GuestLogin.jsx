import PortalLogin from '../../components/PortalLogin';

const GuestLogin = () => (
  <PortalLogin
    portalPath="/guest"
    dashboardPath="/guest/dashboard"
    allowedRoles={['Guest']}
    subtitle="Guest portal"
    wrongPortalMessage="Only guest accounts can sign in here."
  />
);

export default GuestLogin;
