const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: [
        'Room Service',
        'Housekeeping',
        'Wake-up Call',
        'Transportation',
        'Laundry',
        'Spa',
      ],
      required: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    wellnessPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WellnessPackage',
    },
    chargeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    billed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;
