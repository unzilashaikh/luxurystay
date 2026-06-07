const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.patch('/updateMe', userController.updateMe);

// Admin + Receptionist — guest records
router.get('/guests', restrictTo('Admin', 'Receptionist'), userController.getAllGuests);
router.post('/guests', restrictTo('Admin', 'Receptionist'), userController.createGuest);

// Admin access only below
router.use(restrictTo('Admin'));

router.get('/staff', userController.getAllStaff);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
