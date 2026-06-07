const Maintenance = require('../models/Maintenance');
const Room = require('../models/Room');
const AppError = require('../utils/customError');
const APIFeatures = require('../utils/apiFeatures');
const { notifyAdmin } = require('../utils/notify');

exports.getAllMaintenanceRequests = async (req, res, next) => {
  try {
    const features = new APIFeatures(Maintenance.find().populate('room').populate('assignedTo'), req.query)
      .filter()
      .search(['roomNumber', 'staffName', 'status'])
      .sort()
      .paginate();

    const requests = await features.query;
    const total = await Maintenance.countDocuments();

    res.status(200).json({
      status: 'success',
      results: requests.length,
      total,
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createMaintenanceRequest = async (req, res, next) => {
  try {
    const { room: roomId, description, priority, reportedBy } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    const newRequest = await Maintenance.create({
      room: roomId,
      roomNumber: room.number,
      description,
      priority: priority || 'Medium',
      status: 'Reported',
      reportedBy: reportedBy || 'Staff'
    });

    // Mark room as maintenance
    room.status = 'Maintenance';
    await room.save();

    await notifyAdmin({
      title: 'Maintenance reported',
      message: `Room ${room.number} — ${(description || '').slice(0, 80)} (${priority || 'Medium'})`,
      type: 'Maintenance',
    });

    res.status(201).json({
      status: 'success',
      data: {
        request: newRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMaintenanceRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!request) {
      return next(new AppError('No maintenance request found with that ID', 404));
    }

    if (req.body.status === 'Resolved') {
      request.resolvedAt = new Date();
      await request.save();

      const room = await Room.findById(request.room);
      if (room && room.status === 'Maintenance') {
        room.status = 'Available';
        await room.save();
      }

      await notifyAdmin({
        title: 'Maintenance resolved',
        message: `Room ${request.roomNumber} — issue closed`,
        type: 'Maintenance',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMaintenanceRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findByIdAndDelete(req.params.id);
    if (!request) {
      return next(new AppError('No request found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.resolveRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return next(new AppError('No request found with that ID', 404));
    }

    request.status = 'Resolved';
    request.resolvedAt = new Date();
    await request.save();

    const room = await Room.findById(request.room);
    if (room && room.status === 'Maintenance') {
      room.status = 'Available';
      await room.save();
    }

    await notifyAdmin({
      title: 'Maintenance resolved',
      message: `Room ${request.roomNumber} — marked resolved`,
      type: 'Maintenance',
    });

    res.status(200).json({
      status: 'success',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};
