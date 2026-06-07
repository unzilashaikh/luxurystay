import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Search } from 'lucide-react';
import { getUser } from '../utils/auth';
import { api } from '../utils/api';
import './Topbar.css';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
};

const Topbar = () => {
  const user = getUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const panelRef = useRef(null);

  const displayName = user?.name?.trim() || 'Admin';
  const avatarLetter =
    user?.role === 'Admin' ? 'A' : (displayName[0] || 'U').toUpperCase();

  const loadNotifications = useCallback(async () => {
    setLoadingNotif(true);
    try {
      const res = await api.notifications.getAll();
      setNotifications(res?.data?.notifications || []);
      setUnreadCount(res?.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 25000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    const onOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [showPanel]);

  const togglePanel = () => {
    const next = !showPanel;
    setShowPanel(next);
    if (next) loadNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search guests, bookings, rooms..." className="search-input" />
      </div>

      <div className="topbar-actions">
        <div className="notification-wrap" ref={panelRef}>
          <button type="button" className="icon-btn" onClick={togglePanel} aria-label="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showPanel && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button type="button" className="notif-mark-all" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {loadingNotif && (
                  <p className="notification-empty">Loading...</p>
                )}
                {!loadingNotif && notifications.length === 0 && (
                  <p className="notification-empty">No notifications yet.</p>
                )}
                {!loadingNotif &&
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      type="button"
                      className={`notification-item ${n.read ? 'read' : 'unread'}`}
                      onClick={() => !n.read && handleMarkRead(n._id)}
                    >
                      <div className="notification-item-top">
                        <span className="notification-type">{n.type || 'Alert'}</span>
                        <span className="notification-time">{formatTime(n.createdAt)}</span>
                      </div>
                      <strong className="notification-title">{n.title}</strong>
                      <p className="notification-message">{n.message}</p>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="topbar-profile">
          <span className="profile-name">{displayName}</span>
          <div className="profile-avatar" title={displayName}>
            <span className="avatar-initial">{avatarLetter}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
