const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', restrictTo('Admin'), dashboardController.getAdminStats);
router.get(
  '/receptionist',
  restrictTo('Admin', 'Receptionist'),
  dashboardController.getReceptionistStats
);

module.exports = router;
