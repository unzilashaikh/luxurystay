import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { getUser, setAuth, getToken } from '../utils/auth';

const GuestContext = createContext(null);

const pickActiveBooking = (bookings) => {
  if (!bookings?.length) return null;
  const active = bookings.find((b) =>
    ['Confirmed', 'Checked In', 'Pending'].includes(b.status)
  );
  return active || bookings[0];
};

export const GuestProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [meResult, bookingsResult, invoicesResult] = await Promise.allSettled([
        api.auth.getMe(),
        api.bookings.getMy(),
        api.billing.getMyInvoices(),
      ]);

      if (meResult.status === 'fulfilled') {
        const freshUser = meResult.value?.data?.user;
        if (freshUser) {
          setUser(freshUser);
          const token = getToken();
          if (token) setAuth(token, freshUser);
        }
      }

      if (bookingsResult.status === 'fulfilled') {
        setBookings(bookingsResult.value?.data?.bookings || []);
      } else {
        setBookings([]);
        console.error('Bookings fetch failed:', bookingsResult.reason);
        setLoadError(
          bookingsResult.reason?.message ||
            'Could not load your bookings. Restart backend and try again.'
        );
      }

      if (invoicesResult.status === 'fulfilled') {
        setInvoices(invoicesResult.value?.data?.invoices || []);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Failed to load guest session:', err);
      setLoadError(err.message || 'Failed to load guest data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeBooking = pickActiveBooking(bookings);

  return (
    <GuestContext.Provider
      value={{
        user,
        bookings,
        invoices,
        activeBooking,
        loading,
        loadError,
        refresh,
        setUser,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used within GuestProvider');
  return ctx;
};
