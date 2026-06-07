const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('Admin', 'Housekeeping Staff'));

router.get('/', inventoryController.getAllItems);

router.post('/items', restrictTo('Admin'), inventoryController.createItem);
router.patch('/items/:id', restrictTo('Admin'), inventoryController.updateItem);
router.delete('/items/:id', restrictTo('Admin'), inventoryController.deleteItem);
router.patch('/items/:id/clear-request', restrictTo('Admin'), inventoryController.clearRestockRequest);
router.patch('/items/:id/request', inventoryController.requestRestock);

module.exports = router;
