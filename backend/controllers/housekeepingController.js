const Housekeeping = require('../models/Housekeeping');
const Room = require('../models/Room');
const AppError = require('../utils/customError');
const { notifyAdmin } = require('../utils/notify');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllHousekeepingTasks = async (req, res, next) => {
  try {
    const features = new APIFeatures(Housekeeping.find().populate('room').populate('staff'), req.query)
      .filter()
      .search(['roomNumber', 'staffName', 'status'])
      .sort()
      .paginate();

    const tasks = await features.query;
    const total = await Housekeeping.countDocuments();

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      total,
      data: {
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createHousekeepingTask = async (req, res, next) => {
  try {
    const { room: roomId, staff: staffId, staffName, task, priority, scheduledDate } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    const newTask = await Housekeeping.create({
      room: roomId,
      roomNumber: room.number,
      staff: staffId,
      staffName: staffName || 'Unassigned',
      task: task || 'Full Clean',
      priority: priority || 'Medium',
      scheduledDate: scheduledDate || new Date(),
      status: 'Pending'
    });

    // Optionally set room status to Cleaning
    room.status = 'Cleaning';
    await room.save();

    await notifyAdmin({
      title: 'New housekeeping task',
      message: `Room ${room.number} — ${newTask.task} (${newTask.priority}) → ${newTask.staffName}`,
      type: 'Housekeeping',
    });

    res.status(201).json({
      status: 'success',
      data: {
        task: newTask
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateHousekeepingTask = async (req, res, next) => {
  try {
    const task = await Housekeeping.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return next(new AppError('No housekeeping task found with that ID', 404));
    }

    // If status is updated to Completed, set room status to Available
    if (req.body.status === 'Completed') {
      task.completedAt = new Date();
      await task.save();

      const room = await Room.findById(task.room);
      if (room && room.status === 'Cleaning') {
        room.status = 'Available';
        await room.save();
      }

      await notifyAdmin({
        title: 'Housekeeping completed',
        message: `Room ${task.roomNumber} — ${task.task} done by ${task.staffName}`,
        type: 'Housekeeping',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHousekeepingTask = async (req, res, next) => {
  try {
    const task = await Housekeeping.findByIdAndDelete(req.params.id);
    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Housekeeping.findById(req.params.id);
    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = new Date();

      const room = await Room.findById(task.room);
      if (room) {
        room.status = 'Available';
        await room.save();
      }

      await notifyAdmin({
        title: 'Housekeeping completed',
        message: `Room ${task.roomNumber} — ${task.task} marked complete`,
        type: 'Housekeeping',
      });
    }
    await task.save();

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    next(error);
  }
};
