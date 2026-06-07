const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, 'Please provide guest name'],
      trim: true
    },
    guestEmail: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback comment'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Rooms', 'Service', 'Dining', 'Wellness', 'Overall'],
      default: 'Overall'
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Featured'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
