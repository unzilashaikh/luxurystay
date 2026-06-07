const Notification = require('../models/Notification');
const AppError = require('../utils/customError');

exports.getAllNotifications = async (req, res, next) => {
  try {
    const filter = {};
    // Admin sees every notification in the system
    if (req.user?.role && req.user.role !== 'Admin') {
      filter.$or = [{ recipientRole: req.user.role }, { recipientRole: 'All' }];
    }

    const notifications = await Notification.find(filter)
      .sort('-createdAt')
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      read: false
    });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      unreadCount,
      data: {
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, recipientRole } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type,
      recipientRole: recipientRole || 'All'
    });

    res.status(201).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(new AppError('No notification found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role && req.user.role !== 'Admin') {
      filter.$or = [{ recipientRole: req.user.role }, { recipientRole: 'All' }];
    }

    await Notification.updateMany({ ...filter, read: false }, { read: true });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
