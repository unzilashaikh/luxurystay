const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const AppError = require('../utils/customError');
const APIFeatures = require('../utils/apiFeatures');
const { findOrCreateInvoiceForReservation } = require('../utils/invoiceCharges');
const { notifyEvent } = require('../utils/notify');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getMyBookings = async (req, res, next) => {
  try {
    if (req.user.role !== 'Guest') {
      return next(new AppError('This route is for guest accounts only.', 403));
    }

    const user = req.user;
    const email = user.email?.trim().toLowerCase();
    const name = user.name?.trim();

    const orConditions = [{ guest: user._id }];

    if (email) {
      orConditions.push({ guestEmail: email });
      orConditions.push({
        guestEmail: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') },
      });
    }

    if (name) {
      orConditions.push({
        guestName: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
      });
    }

    let bookings = await Reservation.find({ $or: orConditions })
      .populate('room')
      .sort({ checkIn: -1 });

    // Link older bookings (name only) to this guest account for next time
    if (email) {
      await Promise.all(
        bookings
          .filter((b) => !b.guestEmail || !b.guest)
          .map((b) =>
            Reservation.updateOne(
              { _id: b._id },
              {
                $set: {
                  guestEmail: email,
                  guest: user._id,
                  guestName: b.guestName || name,
                },
              }
            )
          )
      );
      bookings = await Reservation.find({ $or: orConditions })
        .populate('room')
        .sort({ checkIn: -1 });
    }

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Reservation.find().populate('room').populate('guest'),
      req.query
    )
      .filter()
      .search(['guestName', 'bookingId'])
      .sort()
      .paginate();

    const bookings = await features.query;
    const total = await Reservation.countDocuments();

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      total,
      data: {
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Reservation.findById(req.params.id)
      .populate('room')
      .populate('guest');

    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { guestName, guestEmail, guestPhone, room: roomId, checkIn, checkOut, status, paymentStatus, notes } = req.body;

    const normalizedEmail = guestEmail?.trim().toLowerCase();
    if (!normalizedEmail) {
      return next(new AppError('Guest email is required so the booking appears in the guest portal.', 400));
    }

    const guestUser = await User.findOne({ email: normalizedEmail, role: 'Guest' });
    const resolvedName = (guestName || guestUser?.name || '').trim();
    if (!resolvedName) {
      return next(new AppError('Guest name is required.', 400));
    }

    // 1) Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found!', 404));
    }

    // 2) Validate date conflict
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return next(new AppError('Check-out date must be after check-in date!', 400));
    }

    const overlap = await Reservation.findOne({
      room: roomId,
      status: { $in: ['Pending', 'Confirmed', 'Checked In'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (overlap) {
      return next(new AppError('Room is already booked or occupied during these dates!', 400));
    }

    // 3) Calculate total price
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = diffDays * room.price;

    // 4) Sequential booking ID: BK-01, BK-02, ...
    const count = await Reservation.countDocuments();
    let seq = count + 1;
    let bookingId = `BK-${String(seq).padStart(2, '0')}`;
    while (await Reservation.findOne({ bookingId })) {
      seq += 1;
      bookingId = `BK-${String(seq).padStart(2, '0')}`;
    }

    // 5) Create reservation (linked to guest account by email)
    const newBooking = await Reservation.create({
      bookingId,
      guest: guestUser?._id,
      guestName: resolvedName,
      guestEmail: normalizedEmail,
      guestPhone: guestPhone?.trim() || guestUser?.phone || '',
      room: roomId,
      checkIn: start,
      checkOut: end,
      status: status || 'Pending',
      paymentStatus: paymentStatus || 'Pending',
      totalPrice,
      notes
    });

    await newBooking.populate('room');
    if (guestUser) await newBooking.populate('guest');

    // 6) Update room status to Reserved if confirmed
    if (newBooking.status === 'Confirmed') {
      room.status = 'Reserved';
      await room.save();
    }

    await notifyEvent({
      title: 'New booking',
      message: `${bookingId} — ${resolvedName}, Room ${room.number}, ${newBooking.status}`,
      type: 'Booking',
      alsoNotify: ['Receptionist'],
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking: newBooking
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const prev = await Reservation.findById(req.params.id);
    const booking = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    if (req.body.status && prev && prev.status !== booking.status) {
      await notifyEvent({
        title: 'Booking updated',
        message: `${booking.bookingId} — ${booking.guestName}: status → ${booking.status}`,
        type: 'Booking',
        alsoNotify: ['Receptionist'],
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Revert room status to Available if it was occupied/reserved
    const room = await Room.findById(booking.room);
    if (room && (room.status === 'Reserved' || room.status === 'Occupied')) {
      room.status = 'Available';
      await room.save();
    }

    await notifyEvent({
      title: 'Booking cancelled',
      message: `${booking.bookingId} — ${booking.guestName} cancelled`,
      type: 'Booking',
      alsoNotify: ['Receptionist'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    booking.status = 'Checked In';
    await booking.save();

    // Mark room as occupied
    const room = await Room.findById(booking.room);
    if (room) {
      room.status = 'Occupied';
      await room.save();
    }

    await findOrCreateInvoiceForReservation(booking._id);

    const roomNum = room?.number || '?';
    await notifyEvent({
      title: 'Guest checked in',
      message: `${booking.bookingId} — ${booking.guestName}, Room ${roomNum}`,
      type: 'Booking',
      alsoNotify: ['Receptionist'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const booking = await Reservation.findById(req.params.id).populate('room');
    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    booking.status = 'Checked Out';
    await booking.save();

    // Mark room as cleaning
    const room = await Room.findById(booking.room._id);
    if (room) {
      room.status = 'Cleaning';
      await room.save();
    }

    await findOrCreateInvoiceForReservation(booking._id);

    await notifyEvent({
      title: 'Guest checked out',
      message: `${booking.bookingId} — ${booking.guestName}, Room ${booking.room?.number || '?'}`,
      type: 'Booking',
      alsoNotify: ['Receptionist'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};
