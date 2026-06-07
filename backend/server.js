require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { getDbMode } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./utils/seedDatabase');
const AppError = require('./utils/customError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const billingRoutes = require('./routes/billingRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const guestServiceRoutes = require('./routes/guestServiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const residenceRoutes = require('./routes/residenceRoutes');

const app = express();

// 1) Global Middlewares
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Limit requests from same API (Rate limiting)
const limiter = rateLimit({
  max: 1000, // Limit each IP to 1000 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// CORS configuration (allow requests from our Vite React frontend)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  })
);

// Body parser, reading data from body into req.body, limit size to 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Health — DB status for debugging fetch issues
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbMode: getDbMode(),
    dbName: mongoose.connection.name,
  });
});

// 2) API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/guest/service-requests', guestServiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/residences', residenceRoutes);

// 3) Fallback route handler (404 for unhandled API endpoints)
// We use a pathless app.use middleware to catch all unhandled requests,
// which is 100% compatible with Express 5's new path matching system.
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) Centralized Global Error Handler Middleware
app.use(globalErrorHandler);

// Start server only after database is connected
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty(getDbMode());
  } catch (err) {
    console.error('Could not start server — database unavailable.');
    console.error(err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    const dbName = require('mongoose').connection.name;
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    console.log(`Active database: ${dbName}`);
    console.log(`DB mode: ${getDbMode()}`);
    if (getDbMode() !== 'atlas') {
      console.log('⚠️  Not on Atlas — old cloud data will not show until Atlas connects.');
    }
  });

  process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
};

startServer();