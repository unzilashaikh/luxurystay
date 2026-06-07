const express = require('express');
const housekeepingController = require('../controllers/housekeepingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// Allow Housekeeping Staff, Receptionist, Manager, and Admin to view tasks or update task status
router.use(restrictTo('Admin', 'Receptionist', 'Housekeeping Staff'));

router.get('/', housekeepingController.getAllHousekeepingTasks);
router.patch('/:id/status', housekeepingController.updateTaskStatus);

// Restrict mutating actions (scheduling, assigning, deleting tasks) to Admin, Manager, and Receptionist
router.use(restrictTo('Admin', 'Receptionist'));

router.post('/', housekeepingController.createHousekeepingTask);
router
  .route('/:id')
  .patch(housekeepingController.updateHousekeepingTask)
  .delete(housekeepingController.deleteHousekeepingTask);

module.exports = router;
