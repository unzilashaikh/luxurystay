export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => Boolean(getToken());

export const getHomeRouteForRole = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Receptionist':
      return '/staff/dashboard';
    case 'Housekeeping Staff':
      return '/housekeeping/dashboard';
    case 'Guest':
      return '/guest/dashboard';
    default:
      return '/login';
  }
};

export const getLoginPathForRole = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin';
    case 'Receptionist':
      return '/staff';
    case 'Housekeeping Staff':
      return '/housekeeping';
    case 'Guest':
      return '/guest';
    default:
      return '/login';
  }
};

/** Map portal route prefix to API portal key */
export const getPortalKey = (portalPath) => {
  if (portalPath === '/admin') return 'admin';
  if (portalPath === '/staff') return 'staff';
  if (portalPath === '/housekeeping') return 'housekeeping';
  if (portalPath === '/guest') return 'guest';
  return null;
};
