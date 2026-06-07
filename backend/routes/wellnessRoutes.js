const express = require('express');
const wellnessController = require('../controllers/wellnessController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public — active packages for /wellness page
router.get('/', wellnessController.getAllPackages);

router.use(protect);
router.use(restrictTo('Admin'));

router.post('/', wellnessController.createPackage);

router
  .route('/:id')
  .get(wellnessController.getPackage)
  .patch(wellnessController.updatePackage)
  .delete(wellnessController.deletePackage);

module.exports = router;
