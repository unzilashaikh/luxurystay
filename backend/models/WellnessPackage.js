const mongoose = require('mongoose');

const wellnessPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    badge: {
      type: String,
      trim: true,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      trim: true,
      default: '#8B7355'
    },
    features: {
      type: [String],
      default: []
    },
    active: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const WellnessPackage = mongoose.model('WellnessPackage', wellnessPackageSchema);
module.exports = WellnessPackage;
