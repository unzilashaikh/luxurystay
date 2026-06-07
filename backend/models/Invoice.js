const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: [true, 'Invoice must belong to a reservation']
    },
    guestName: {
      type: String,
      required: true
    },
    roomCharge: {
      type: Number,
      required: true
    },
    extraCharges: {
      type: Number,
      default: 0
    },
    lineItems: [
      {
        description: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        source: {
          type: String,
          enum: ['wellness', 'service', 'manual'],
          default: 'service',
        },
        sourceId: { type: mongoose.Schema.Types.ObjectId },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    tax: {
      type: Number,
      default: 0
    },
    serviceCharge: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Partially Paid'],
      default: 'Unpaid'
    },
    dueDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
