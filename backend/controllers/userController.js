const User = require('../models/User');
const AppError = require('../utils/customError');
const { notifyAdmin } = require('../utils/notify');
const APIFeatures = require('../utils/apiFeatures');

// Admin & Staff utilities
exports.getAllStaff = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      User.find({ role: { $ne: 'Guest' } }),
      req.query
    )
      .filter()
      .search(['name', 'email', 'role'])
      .sort()
      .paginate();

    const staff = await features.query;
    const total = await User.countDocuments({ role: { $ne: 'Guest' } });

    res.status(200).json({
      status: 'success',
      results: staff.length,
      total,
      data: {
        staff
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllGuests = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find({ role: 'Guest' }), req.query)
      .filter()
      .search(['name', 'email', 'phone'])
      .sort()
      .paginate();

    const guests = await features.query;
    const total = await User.countDocuments({ role: 'Guest' });

    res.status(200).json({
      status: 'success',
      results: guests.length,
      total,
      data: {
        guests
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .search(['name', 'email', 'role'])
      .sort()
      .paginate();

    const users = await features.query;
    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createGuest = async (req, res, next) => {
  req.body.role = 'Guest';
  if (!req.body.status) req.body.status = 'Active';
  return exports.createUser(req, res, next);
};

exports.createUser = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || 'password123', // default initial password
      role: req.body.role || 'Guest',
      phone: req.body.phone,
      avatar: req.body.avatar
    });

    newUser.password = undefined;

    await notifyAdmin({
      title: 'New user account',
      message: `${newUser.name} (${newUser.email}) — role: ${newUser.role}`,
      type: 'Alert',
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updatePassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields that are not allowed to be updated directly
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'phone', 'avatar'];
    allowedFields.forEach(el => {
      if (req.body[el] !== undefined) filteredBody[el] = req.body[el];
    });

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};
