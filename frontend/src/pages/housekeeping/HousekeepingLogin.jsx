import PortalLogin from '../../components/PortalLogin';

const HousekeepingLogin = () => (
  <PortalLogin
    portalPath="/housekeeping"
    dashboardPath="/housekeeping/dashboard"
    allowedRoles={['Housekeeping Staff']}
    subtitle="Housekeeping portal"
    wrongPortalMessage="Only housekeeping accounts can sign in here (not reception)."
  />
);

export default HousekeepingLogin;
