const express = require('express');
const residenceController = require('../controllers/residenceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', residenceController.getAllResidences);
router.post('/inquire', residenceController.createInquiry);

router.use(protect);
router.use(restrictTo('Admin'));

router.post('/', residenceController.createResidence);

router
  .route('/:id')
  .get(residenceController.getResidence)
  .patch(residenceController.updateResidence)
  .delete(residenceController.deleteResidence);

module.exports = router;
