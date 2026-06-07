const Room = require('../models/Room');
const AppError = require('../utils/customError');
const APIFeatures = require('../utils/apiFeatures');
const { notifyAdmin } = require('../utils/notify');

exports.getAllRooms = async (req, res, next) => {
  try {
    const features = new APIFeatures(Room.find(), req.query)
      .filter()
      .search(['number', 'type', 'status'])
      .sort()
      .paginate();

    const rooms = await features.query;
    const total = await Room.countDocuments();

    res.status(200).json({
      status: 'success',
      results: rooms.length,
      total,
      data: {
        rooms
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    let room;
    // Check if finding by ID or room number
    if (req.params.id.length < 10) {
      room = await Room.findOne({ number: req.params.id });
    } else {
      room = await Room.findById(req.params.id);
    }

    if (!room) {
      return next(new AppError('No room found with that ID or Number', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        room
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const newRoom = await Room.create(req.body);

    await notifyAdmin({
      title: 'New room added',
      message: `Room ${newRoom.number} — ${newRoom.type} ($${newRoom.price}/night)`,
      type: 'Alert',
    });

    res.status(201).json({
      status: 'success',
      data: {
        room: newRoom
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!room) {
      return next(new AppError('No room found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        room
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return next(new AppError('No room found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoomStatus = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!room) {
      return next(new AppError('No room found with that ID', 404));
    }

    await notifyAdmin({
      title: 'Room status changed',
      message: `Room ${room.number} is now ${room.status}`,
      type: 'Alert',
    });

    res.status(200).json({
      status: 'success',
      data: {
        room
      }
    });
  } catch (error) {
    next(error);
  }
};
