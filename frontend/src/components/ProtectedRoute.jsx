import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser, getLoginPathForRole, clearAuth } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles, loginPath = '/admin' }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length) {
    const user = getUser();
    if (user && !allowedRoles.includes(user.role)) {
      const correctLogin = getLoginPathForRole(user.role);
      if (correctLogin && correctLogin !== loginPath) {
        return <Navigate to={correctLogin} replace state={{ wrongPortal: true }} />;
      }
      clearAuth();
      return <Navigate to={loginPath} replace state={{ wrongPortal: true }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
