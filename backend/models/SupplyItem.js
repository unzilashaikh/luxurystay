const mongoose = require('mongoose');

const supplyItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supply item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Cleaning', 'Linens', 'Amenities', 'Other'],
      default: 'Cleaning',
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: 'units',
    },
    minLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    restockRequested: {
      type: Boolean,
      default: false,
    },
    restockNote: {
      type: String,
      default: '',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedByName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

supplyItemSchema.virtual('stockStatus').get(function stockStatus() {
  if (this.quantity <= 0) return 'Critical';
  if (this.quantity <= this.minLevel) return 'Low';
  return 'OK';
});

supplyItemSchema.set('toJSON', { virtuals: true });
supplyItemSchema.set('toObject', { virtuals: true });

const SupplyItem = mongoose.model('SupplyItem', supplyItemSchema);
module.exports = SupplyItem;
