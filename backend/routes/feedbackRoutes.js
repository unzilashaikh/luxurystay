const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/feedback', feedbackController.createFeedback);
router.get('/feedback/public', feedbackController.getAllFeedback);

router.use(protect);

router.post('/services', feedbackController.createServiceRequest);

router.get('/feedback', restrictTo('Admin', 'Receptionist'), feedbackController.getAllFeedback);
router.patch(
  '/feedback/:id/status',
  restrictTo('Admin', 'Receptionist'),
  feedbackController.updateFeedbackStatus
);
router.delete(
  '/feedback/:id',
  restrictTo('Admin', 'Receptionist'),
  feedbackController.deleteFeedback
);

router.get('/services', restrictTo('Admin', 'Receptionist'), feedbackController.getAllServiceRequests);
router.patch(
  '/services/:id/status',
  restrictTo('Admin', 'Receptionist'),
  feedbackController.updateServiceRequestStatus
);
router.delete(
  '/services/:id',
  restrictTo('Admin', 'Receptionist'),
  feedbackController.deleteServiceRequest
);

module.exports = router;
