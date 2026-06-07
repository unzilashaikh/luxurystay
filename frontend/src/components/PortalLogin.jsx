import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { setAuth, isAuthenticated, getUser, getPortalKey, getLoginPathForRole } from '../utils/auth';
import BrandLogo from './BrandLogo';
import '../pages/Login.css';

/**
 * Portal-specific login (e.g. /admin, /staff).
 * @param {string} portalPath - base path e.g. '/admin'
 * @param {string} dashboardPath - after login e.g. '/admin/dashboard'
 * @param {string[]} allowedRoles - roles allowed on this portal
 * @param {string} subtitle - subheading
 */
const PortalLogin = ({
  portalPath,
  dashboardPath,
  allowedRoles,
  subtitle = 'Sign in to continue',
  wrongPortalMessage = 'This account cannot access this portal.',
  enableSignup = false,
  signupRoles = ['Admin'],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(signupRoles[0] || 'Admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!isAuthenticated() || !user) return;
    if (allowedRoles.includes(user.role)) {
      navigate(dashboardPath, { replace: true });
      return;
    }
    // Logged in as wrong role for this portal — send to their portal login
    const correctLogin = getLoginPathForRole(user.role);
    if (correctLogin !== portalPath) {
      navigate(correctLogin, { replace: true, state: { wrongPortal: true } });
    }
  }, [navigate, dashboardPath, allowedRoles, portalPath]);

  useEffect(() => {
    if (location.state?.wrongPortal) {
      setError(wrongPortalMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, wrongPortalMessage, navigate, location.pathname]);

  const switchMode = (signup) => {
    setIsSignup(signup);
    setError('');
    setSuccess('');
    if (signup) {
      setName('');
      setEmail('');
      setPassword('');
      setRole(signupRoles[0] || 'Admin');
    } else {
      setName('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isSignup) {
      if (!name.trim() || !email.trim() || !password) {
        setError('Please fill in name, email, and password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    } else if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const res = await api.auth.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        });

        const user = res.data?.user;
        if (!user) {
          throw new Error('Invalid response from server');
        }

        if (!allowedRoles.includes(user.role)) {
          setError(wrongPortalMessage);
          setLoading(false);
          return;
        }

        const registeredEmail = email.trim().toLowerCase();
        setIsSignup(false);
        setName('');
        setPassword('');
        setRole(signupRoles[0] || 'Admin');
        setEmail(registeredEmail);
        setSuccess('Successfully registered! Please sign in with your email and password.');
        setLoading(false);
        return;
      }

      const portalKey = getPortalKey(portalPath);
      const res = await api.auth.login({
        email: email.trim().toLowerCase(),
        password,
        ...(portalKey ? { portal: portalKey } : {}),
      });
      const token = res.token;
      const user = res.data?.user;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      if (!allowedRoles.includes(user.role)) {
        setError(wrongPortalMessage);
        setLoading(false);
        return;
      }

      setAuth(token, user);
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(
        err.message ||
          (isSignup ? 'Sign up failed. Please try again.' : 'Login failed. Check your email and password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <BrandLogo size="xl" className="login-form-logo" />
          <p>{isSignup ? 'Create your account' : subtitle}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {success && <div className="login-success">{success}</div>}
          {error && <div className="login-error">{error}</div>}

          {isSignup && (
            <div className="login-field">
              <label htmlFor={`name-${portalPath}`}>Full name</label>
              <input
                id={`name-${portalPath}`}
                type="text"
                className="login-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor={`email-${portalPath}`}>Email</label>
            <input
              id={`email-${portalPath}`}
              type="email"
              className="login-input"
              placeholder="you@luxurystay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor={`password-${portalPath}`}>Password</label>
            <input
              id={`password-${portalPath}`}
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              disabled={loading}
            />
          </div>

          {isSignup && (
            <div className="login-field">
              <label htmlFor={`role-${portalPath}`}>Role</label>
              <select
                id={`role-${portalPath}`}
                className="login-input login-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                {signupRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading
              ? isSignup
                ? 'Creating account...'
                : 'Signing in...'
              : isSignup
                ? 'Sign up'
                : 'Login'}
          </button>
        </form>

        {enableSignup && (
          <p className="login-toggle">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button type="button" className="login-toggle-btn" onClick={() => switchMode(false)}>
                  Login
                </button>
              </>
            ) : (
              <>
                Need an account?{' '}
                <button type="button" className="login-toggle-btn" onClick={() => switchMode(true)}>
                  Sign up
                </button>
              </>
            )}
          </p>
        )}

        <div className="login-footer">
          <Link to="/" className="login-back">← Back to website</Link>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
