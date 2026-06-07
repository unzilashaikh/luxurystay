const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Booking', 'Maintenance', 'Payment', 'Housekeeping', 'Alert'],
      default: 'Alert'
    },
    recipientRole: {
      type: String,
      enum: ['Admin', 'Manager', 'Receptionist', 'Housekeeping Staff', 'Maintenance Staff', 'Guest', 'All'],
      default: 'All'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
