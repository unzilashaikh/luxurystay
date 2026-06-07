import { isSameCalendarDay } from './dateUtils';

export const buildReceptionistDashboard = (bookings = [], rooms = [], serviceRequests = []) => {
  const todayArrivals = bookings.filter(
    (b) => isSameCalendarDay(b.checkIn) && ['Pending', 'Confirmed'].includes(b.status)
  );

  const todayDepartures = bookings.filter(
    (b) =>
      isSameCalendarDay(b.checkOut) && ['Checked In', 'Confirmed'].includes(b.status)
  );

  const checkedInGuests = bookings.filter((b) => b.status === 'Checked In');
  const activeBookings = bookings.filter(
    (b) => !['Cancelled', 'Checked Out'].includes(b.status)
  );

  const pendingServices = serviceRequests.filter((s) =>
    ['Pending', 'In Progress'].includes(s.status)
  ).length;

  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const totalRooms = rooms.length;

  const schedule = [];
  const seen = new Set();

  const addRow = (booking, activity) => {
    const key = `${booking._id}-${activity}`;
    if (seen.has(key)) return;
    seen.add(key);
    schedule.push({ ...booking, activity });
  };

  todayArrivals.forEach((b) => addRow(b, 'Check-In'));
  todayDepartures.forEach((b) => addRow(b, 'Check-Out'));
  checkedInGuests.forEach((b) => addRow(b, 'In House'));

  if (schedule.length === 0) {
    activeBookings.slice(0, 20).forEach((b) => {
      let activity = 'Booking';
      if (b.status === 'Checked In') activity = 'In House';
      else if (isSameCalendarDay(b.checkIn)) activity = 'Check-In';
      else if (isSameCalendarDay(b.checkOut)) activity = 'Check-Out';
      addRow(b, activity);
    });
  }

  return {
    counts: {
      arrivalsToday: todayArrivals.length,
      departuresToday: todayDepartures.length,
      checkedIn: checkedInGuests.length,
      activeBookings: activeBookings.length,
      pendingServices,
      occupiedRooms,
      totalRooms,
    },
    schedule,
  };
};
