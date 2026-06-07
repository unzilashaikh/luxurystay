const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    guestName: {
      type: String,
      required: [true, 'Please provide the guest name'],
      trim: true
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    guestPhone: {
      type: String,
      trim: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Reservation must belong to a room']
    },
    checkIn: {
      type: Date,
      required: [true, 'Please provide the check-in date']
    },
    checkOut: {
      type: Date,
      required: [true, 'Please provide the check-out date']
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'Waitlisted'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Unpaid', 'Refunded'],
      default: 'Pending'
    },
    totalPrice: {
      type: Number,
      required: [true, 'Please specify total price']
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
reservationSchema.index({ bookingId: 1 });
reservationSchema.index({ checkIn: 1, checkOut: 1 });
reservationSchema.index({ guestName: 'text' });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
