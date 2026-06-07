import PortalLogin from '../../components/PortalLogin';

const StaffLogin = () => (
  <PortalLogin
    portalPath="/staff"
    dashboardPath="/staff/dashboard"
    allowedRoles={['Receptionist']}
    subtitle="Receptionist portal"
    wrongPortalMessage="Only receptionists can sign in here."
  />
);

export default StaffLogin;
