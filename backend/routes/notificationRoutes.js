const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getAllNotifications);
router.post('/', restrictTo('Admin'), notificationController.createNotification);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
