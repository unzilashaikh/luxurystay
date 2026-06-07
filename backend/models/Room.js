const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, 'Please provide a room number'],
      unique: true,
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Please provide a room type'],
      enum: [
        'Standard Twin',
        'Standard Queen',
        'Deluxe King',
        'Executive Room',
        'Executive Suite',
        'Presidential Suite'
      ],
      default: 'Deluxe King'
    },
    status: {
      type: String,
      required: [true, 'Please provide a room status'],
      enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'],
      default: 'Available'
    },
    floor: {
      type: String,
      required: [true, 'Please provide a floor'],
      enum: ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
      default: '1st Floor'
    },
    price: {
      type: Number,
      required: [true, 'Please provide a room price per night']
    },
    images: {
      type: [String],
      default: []
    },
    amenities: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes
roomSchema.index({ number: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ type: 1 });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
