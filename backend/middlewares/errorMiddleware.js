const AppError = require('../utils/customError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = field ? err.keyValue[field] : null;

  if (field === 'email' && value) {
    return new AppError(`"${value}" is already registered. Please sign in or use another email.`, 400);
  }

  if (field && value) {
    return new AppError(`"${value}" already exists for ${field}. Please use another value.`, 400);
  }

  return new AppError('Duplicate field value. Please use another value!', 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose / MongoDB connection errors (not duplicate key)
  if (
    (err.name === 'MongoServerError' || err.name === 'MongoNetworkError' || err.message?.includes('ECONNREFUSED')) &&
    err.code !== 11000
  ) {
    err.message =
      'Database connection failed. Check MongoDB Atlas IP whitelist (Network Access) or your MONGO_URI in .env';
    err.statusCode = 503;
    err.status = 'fail';
  }

  // Normalize common Mongoose errors (dev + production)
  if (err.name === 'CastError') err = handleCastErrorDB(err);
  if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') err = handleValidationErrorDB(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
