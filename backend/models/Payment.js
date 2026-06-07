const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: [true, 'Payment must be associated with a reservation']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the payment amount']
    },
    method: {
      type: String,
      required: [true, 'Please specify the payment method'],
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Stripe', 'PayPal'],
      default: 'Credit Card'
    },
    status: {
      type: String,
      required: [true, 'Please provide payment status'],
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionId: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
