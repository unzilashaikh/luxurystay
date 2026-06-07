import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Utensils,
  Bell,
  Car,
  BellRing,
  Shirt,
  Waves,
  Send,
  Clock,
} from 'lucide-react';
import { useGuest } from '../../context/GuestContext';
import { api } from '../../utils/api';

const SERVICE_TYPES = [
  { id: 'Room Service', label: 'Room Service', icon: Utensils, color: '#FF7675' },
  { id: 'Housekeeping', label: 'Housekeeping', icon: Bell, color: '#74B9FF' },
  { id: 'Laundry', label: 'Laundry', icon: Shirt, color: '#A29BFE' },
  { id: 'Wake-up Call', label: 'Wake-up Call', icon: BellRing, color: '#FDCB6E' },
  { id: 'Transportation', label: 'Transportation', icon: Car, color: '#55E6C1' },
  { id: 'Spa', label: 'Spa', icon: Waves, color: '#C5A059' },
];

const statusBadge = (status) => {
  if (status === 'Completed') return 'badge-success';
  if (status === 'In Progress') return 'badge-info';
  if (status === 'Cancelled') return 'badge-danger';
  return 'badge-warning';
};

const formatWhen = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return d.toLocaleDateString();
};

const GuestServices = () => {
  const location = useLocation();
  const { user, activeBooking, loading: guestLoading } = useGuest();
  const roomNumber = activeBooking?.room?.number?.toString() || '';
  const bookingId = activeBooking?.bookingId || '';
  const reservationId = activeBooking?._id || '';

  const [serviceType, setServiceType] = useState('Room Service');
  const [details, setDetails] = useState('');
  const [requests, setRequests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [historyFilter, setHistoryFilter] = useState('All');
  const [historyError, setHistoryError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    setHistoryError('');
    try {
      const res = await api.feedback.getMyServices();
      setRequests(res?.data?.requests || []);
    } catch (err) {
      console.error(err);
      setRequests([]);
      setHistoryError(err.message || 'Could not load request history from the server.');
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) loadRequests();
  }, [loadRequests, user?.email]);

  const filteredRequests = requests.filter((req) => {
    if (historyFilter === 'Active') {
      return req.status === 'Pending' || req.status === 'In Progress';
    }
    if (historyFilter === 'Completed') {
      return req.status === 'Completed' || req.status === 'Cancelled';
    }
    return true;
  });

  const formatDateTime = (date) =>
    date
      ? new Date(date).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '—';

  useEffect(() => {
    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        const res = await api.wellness.getAll(true);
        const list = res?.data?.packages || [];
        setPackages(list.slice(0, 6));
        const fromWellness = location.state?.spaPackage;
        if (fromWellness?._id) {
          setServiceType('Spa');
          setDetails(`Spa package: ${fromWellness.name} (${fromWellness.duration})`);
        }
      } catch {
        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };
    loadPackages();
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!roomNumber) {
      setFormError('No active room on your booking. Contact reception.');
      return;
    }
    if (!details.trim()) {
      setFormError('Please describe what you need.');
      return;
    }

    setSubmitting(true);
    try {
      await api.feedback.createService({
        guestName: user?.name,
        roomNumber,
        serviceType,
        details: details.trim(),
        reservationId: reservationId || undefined,
      });
      setDetails('');
      setFormSuccess('Request sent! Our team will respond shortly.');
      loadRequests();
    } catch (err) {
      setFormError(err.message || 'Could not send request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpaBook = async (pkg) => {
    setFormError('');
    setFormSuccess('');

    if (!roomNumber) {
      setFormError('No active booking with a room. Contact reception.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.feedback.createService({
        guestName: user?.name,
        roomNumber,
        serviceType: 'Spa',
        details: `Spa package: ${pkg.name} (${pkg.duration})`,
        wellnessPackageId: pkg._id,
        reservationId: reservationId || undefined,
        chargeAmount: pkg.price,
      });
      const added = res?.data?.addedToBill;
      setFormSuccess(
        added
          ? `${pkg.name} booked — $${Number(pkg.price).toFixed(2)} added to your room bill.`
          : 'Spa request sent! Our team will confirm shortly.'
      );
      setServiceType('Spa');
      setDetails(`Spa package: ${pkg.name} (${pkg.duration})`);
      loadRequests();
    } catch (err) {
      setFormError(err.message || 'Could not book spa package.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Service & Spa</h1>
          <p className="page-subtitle">
            Order to your room or request hotel services.
            {roomNumber && (
              <>
                {' '}
                · <strong>Room {roomNumber}</strong>
                {bookingId && <> ({bookingId})</>}
              </>
            )}
          </p>
        </div>
      </div>

      {!guestLoading && !activeBooking && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            background: '#fffbf5',
            border: '1px solid #e8dcc8',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No checked-in room found. You can still browse spa packages; service requests need an active booking.
          </p>
        </div>
      )}

      <div
        className="grid grid-cols-2"
        style={{ gap: '24px', alignItems: 'stretch', marginBottom: '24px' }}
      >
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ margin: '0 0 16px' }}>New request</h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {SERVICE_TYPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceType(s.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border:
                      serviceType === s.id
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                    background: serviceType === s.id ? 'rgba(197, 160, 89, 0.08)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: serviceType === s.id ? 600 : 500,
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: `${s.color}18`,
                      color: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <s.icon size={20} />
                  </div>
                  {s.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>
                Details *
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder={
                  serviceType === 'Room Service'
                    ? 'e.g. 2 club sandwiches, mineral water, no ice'
                    : serviceType === 'Spa'
                      ? 'e.g. Deep tissue massage tomorrow 4pm'
                      : 'Describe your request...'
                }
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{ width: '100%', resize: 'vertical', marginBottom: '12px' }}
                disabled={!roomNumber}
              />

              {formError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '14px', margin: '0 0 12px' }}>{formError}</p>
              )}
              {formSuccess && (
                <p style={{ color: 'var(--color-success)', fontSize: '14px', margin: '0 0 12px' }}>{formSuccess}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !roomNumber}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                {submitting ? 'Sending...' : 'Send request'}
              </button>
            </form>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ margin: '0 0 16px' }}>Spa & wellness</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 14px' }}>
              Book a package — the price is added to your stay invoice automatically.
            </p>
            {loadingPackages && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading packages...</p>
            )}
            {!loadingPackages && packages.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                Browse our full spa menu on the wellness page.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border:
                      serviceType === 'Spa' &&
                      details.includes(pkg.name)
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background:
                      serviceType === 'Spa' && details.includes(pkg.name)
                        ? 'rgba(197, 160, 89, 0.06)'
                        : 'var(--color-surface)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{pkg.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {pkg.duration} · ${pkg.price}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flexShrink: 0, fontSize: '13px' }}
                    disabled={submitting || !roomNumber}
                    onClick={() => handleSpaBook(pkg)}
                  >
                    {submitting ? '…' : 'Book & bill'}
                  </button>
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: 'var(--color-primary)' }} />
              Request history
            </h3>
            {!loadingRequests && requests.length > 0 && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {requests.length} total
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['All', 'Active', 'Completed'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHistoryFilter(f)}
                className={historyFilter === f ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                {f}
              </button>
            ))}
          </div>

          {historyError && (
            <div
              style={{
                padding: '12px 14px',
                marginBottom: '12px',
                background: '#ffebee',
                border: '1px solid #ffcdd2',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--color-danger)',
              }}
            >
              {historyError}
              <button type="button" className="btn-text" style={{ marginLeft: '8px' }} onClick={loadRequests}>
                Retry
              </button>
            </div>
          )}

          {loadingRequests && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading your request history...</p>
          )}

          {!loadingRequests && !historyError && requests.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
              You have not submitted any service requests yet. Use the form on the left to place your first request.
            </p>
          )}

          {!loadingRequests && !historyError && requests.length > 0 && filteredRequests.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
              {historyFilter === 'Active' && 'You have no active requests at the moment.'}
              {historyFilter === 'Completed' && 'You have no completed or cancelled requests yet.'}
              {historyFilter === 'All' && 'No requests match this filter.'}
            </p>
          )}
          {!loadingRequests && filteredRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRequests.map((req) => (
                <div
                  key={req._id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-alt)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{req.serviceType}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        Room {req.roomNumber}
                      </span>
                    </div>
                    <span className={`badge ${statusBadge(req.status)}`} style={{ flexShrink: 0 }}>
                      {req.status}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '14px',
                      lineHeight: 1.55,
                      color: 'var(--color-text)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {req.details}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {formatDateTime(req.createdAt)}
                    <span style={{ margin: '0 6px' }}>·</span>
                    {formatWhen(req.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default GuestServices;
