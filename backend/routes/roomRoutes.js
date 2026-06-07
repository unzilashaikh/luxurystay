const express = require('express');
const roomController = require('../controllers/roomController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes (anyone can see rooms list or specific room details)
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoom);

// Protected routes below
router.use(protect);

// Admin, Manager and Receptionist can create, edit, delete, or update statuses
router.use(restrictTo('Admin', 'Receptionist'));

router.post('/', roomController.createRoom);
router.patch('/:id/status', roomController.updateRoomStatus);

router
  .route('/:id')
  .patch(roomController.updateRoom)
  .delete(roomController.deleteRoom);

module.exports = router;
