const express = require('express');
const billingController = require('../controllers/billingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// Guest invoices — before Admin-only routes
router.get('/invoices/my', billingController.getMyInvoices);

router.get(
  '/invoices',
  restrictTo('Admin', 'Receptionist'),
  billingController.getAllInvoices
);

router.get(
  '/invoices/:id',
  restrictTo('Admin', 'Receptionist'),
  billingController.getInvoice
);

router.post(
  '/invoices',
  restrictTo('Admin', 'Receptionist'),
  billingController.createInvoice
);

router.patch(
  '/invoices/:id',
  restrictTo('Admin', 'Receptionist'),
  billingController.updateInvoice
);

router.delete(
  '/invoices/:id',
  restrictTo('Admin', 'Receptionist'),
  billingController.deleteInvoice
);

router.post(
  '/payments',
  restrictTo('Admin', 'Receptionist'),
  billingController.recordPayment
);

router.get(
  '/payments',
  restrictTo('Admin', 'Receptionist'),
  billingController.getAllPayments
);

module.exports = router;
