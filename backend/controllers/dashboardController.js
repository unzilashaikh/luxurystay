const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const AppError = require('../utils/customError');

const isSameCalendarDay = (dateA, dateB = new Date()) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

exports.getAdminStats = async (req, res, next) => {
  try {
    // 1) Total Revenue
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 2) Room Count and Occupancy Rate
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 3) New Bookings
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newBookings = await Reservation.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // 4) RevPAR (Revenue per Available Room)
    const adrAgg = await Room.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    const avgDailyRate = adrAgg.length > 0 ? adrAgg[0].avgPrice : 0;
    const revPAR = Math.round((occupancyRate / 100) * avgDailyRate);

    // 5) Room Status Statistics
    const roomStats = {
      available: await Room.countDocuments({ status: 'Available' }),
      occupied: occupiedRooms,
      reserved: await Room.countDocuments({ status: 'Reserved' }),
      cleaning: await Room.countDocuments({ status: 'Cleaning' }),
      maintenance: await Room.countDocuments({ status: 'Maintenance' })
    };

    // 6) Recent Bookings (top 5)
    let recentBookings = await Reservation.find()
      .populate('room')
      .sort('-createdAt')
      .limit(5);

    // 7) Monthly Revenue Trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAnalytics = monthlyRevenue.length > 0
      ? {
          labels: monthlyRevenue.map((m) => monthNames[m._id.month - 1]),
          values: monthlyRevenue.map((m) => m.revenue)
        }
      : { labels: [], values: [] };

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue,
        occupancyRate,
        newBookings,
        revPAR,
        roomStats,
        recentBookings,
        monthlyAnalytics
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReceptionistStats = async (req, res, next) => {
  try {
    const bookings = await Reservation.find()
      .populate('room')
      .sort({ checkIn: -1 });

    const todayArrivals = bookings.filter(
      (b) =>
        isSameCalendarDay(b.checkIn) &&
        ['Pending', 'Confirmed'].includes(b.status)
    );

    const todayDepartures = bookings.filter(
      (b) =>
        isSameCalendarDay(b.checkOut) &&
        ['Checked In', 'Confirmed'].includes(b.status)
    );

    const checkedInGuests = bookings.filter((b) => b.status === 'Checked In');
    const activeBookings = bookings.filter(
      (b) => !['Cancelled', 'Checked Out'].includes(b.status)
    );

    const pendingServices = await ServiceRequest.countDocuments({
      status: { $in: ['Pending', 'In Progress'] },
    });

    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const totalRooms = await Room.countDocuments();

    const schedule = [];
    const seen = new Set();

    const addRow = (booking, activity) => {
      const key = `${booking._id}-${activity}`;
      if (seen.has(key)) return;
      seen.add(key);
      schedule.push({ booking, activity });
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

    res.status(200).json({
      status: 'success',
      data: {
        counts: {
          arrivalsToday: todayArrivals.length,
          departuresToday: todayDepartures.length,
          checkedIn: checkedInGuests.length,
          activeBookings: activeBookings.length,
          pendingServices,
          occupiedRooms,
          totalRooms,
        },
        bookings,
        schedule: schedule.map(({ booking, activity }) => ({
          ...booking.toObject(),
          activity,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
