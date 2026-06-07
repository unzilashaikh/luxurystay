const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// Allow Maintenance Staff, Receptionist, Manager, and Admin to view tasks or resolve issues
router.use(restrictTo('Admin', 'Receptionist', 'Housekeeping Staff'));

router.get('/', maintenanceController.getAllMaintenanceRequests);
router.patch('/:id/resolve', maintenanceController.resolveRequest);
router.patch('/:id/status', maintenanceController.updateMaintenanceRequest);

router.post(
  '/',
  restrictTo('Admin', 'Receptionist', 'Housekeeping Staff'),
  maintenanceController.createMaintenanceRequest
);

router.use(restrictTo('Admin', 'Receptionist'));
router.delete('/:id', maintenanceController.deleteMaintenanceRequest);

module.exports = router;
