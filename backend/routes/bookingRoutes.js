const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/public', bookingController.createBooking);

router.use(protect);

// Guest — must be before Admin-only middleware (no router.use restrictTo)
router.get('/my', bookingController.getMyBookings);

router.post(
  '/',
  restrictTo('Admin', 'Receptionist'),
  bookingController.createBooking
);

router.get(
  '/',
  restrictTo('Admin', 'Receptionist'),
  bookingController.getAllBookings
);

router.patch(
  '/:id/checkin',
  restrictTo('Admin', 'Receptionist'),
  bookingController.checkIn
);

router.patch(
  '/:id/checkout',
  restrictTo('Admin', 'Receptionist'),
  bookingController.checkOut
);

router.patch(
  '/:id/cancel',
  restrictTo('Admin', 'Receptionist'),
  bookingController.cancelBooking
);

router
  .route('/:id')
  .get(restrictTo('Admin', 'Receptionist'), bookingController.getBooking)
  .patch(restrictTo('Admin', 'Receptionist'), bookingController.updateBooking)
  .delete(restrictTo('Admin', 'Receptionist'), bookingController.cancelBooking);

module.exports = router;
