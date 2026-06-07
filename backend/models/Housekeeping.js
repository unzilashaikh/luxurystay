const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Housekeeping task must be associated with a room']
    },
    roomNumber: {
      type: String,
      required: true
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    staffName: {
      type: String,
      default: 'Unassigned'
    },
    task: {
      type: String,
      enum: ['Full Clean', 'Touch Up', 'Turn Down', 'Deep Clean'],
      default: 'Full Clean'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    scheduledDate: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Housekeeping = mongoose.model('Housekeeping', housekeepingSchema);
module.exports = Housekeeping;
