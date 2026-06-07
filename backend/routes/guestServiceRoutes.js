const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', feedbackController.getMyServiceRequests);

module.exports = router;
