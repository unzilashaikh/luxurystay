const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Maintenance request must be associated with a room']
    },
    roomNumber: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please provide issue description']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'],
      default: 'Reported'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    staffName: {
      type: String,
      default: 'Unassigned'
    },
    reportedBy: {
      type: String,
      default: 'Staff'
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
module.exports = Maintenance;
