const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');
const AppError = require('../utils/customError');
const APIFeatures = require('../utils/apiFeatures');
const { recalcTotals, findOrCreateInvoiceForReservation, addChargeToReservation } = require('../utils/invoiceCharges');
const { notifyAdmin } = require('../utils/notify');

exports.getMyInvoices = async (req, res, next) => {
  try {
    if (req.user.role !== 'Guest') {
      return next(new AppError('This route is for guest accounts only.', 403));
    }

    const user = req.user;
    const email = user.email?.toLowerCase();

    const reservations = await Reservation.find({
      $or: [
        ...(email ? [{ guestEmail: email }] : []),
        { guest: user._id },
      ],
    }).select('_id');

    const reservationIds = reservations.map((r) => r._id);

    const invoices = await Invoice.find({
      reservation: { $in: reservationIds },
    })
      .populate({ path: 'reservation', populate: { path: 'room' } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllInvoices = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Invoice.find().populate({
        path: 'reservation',
        populate: { path: 'room' }
      }),
      req.query
    )
      .filter()
      .search(['guestName', 'invoiceNumber'])
      .sort()
      .paginate();

    const invoices = await features.query;
    const total = await Invoice.countDocuments();

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      total,
      data: {
        invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('reservation');
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const { reservationId, extraCharges, taxRate, serviceChargeRate } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    const extras = Number(extraCharges) || 0;
    const existing = await Invoice.findOne({ reservation: reservationId });

    if (existing) {
      if (extras > 0) {
        await addChargeToReservation(reservationId, {
          description: 'Manual extra charges',
          amount: extras,
          source: 'manual',
        });
      }
      const invoice = await Invoice.findById(existing._id).populate({
        path: 'reservation',
        populate: { path: 'room' },
      });
      return res.status(200).json({
        status: 'success',
        data: { invoice },
      });
    }

    const { invoice: newInvoice } = await findOrCreateInvoiceForReservation(reservationId);
    if (extras > 0) {
      await addChargeToReservation(reservationId, {
        description: 'Manual extra charges',
        amount: extras,
        source: 'manual',
      });
    }

    const invoice = await Invoice.findById(newInvoice._id).populate({
      path: 'reservation',
      populate: { path: 'room' },
    });

    await notifyAdmin({
      title: 'Invoice created',
      message: `${invoice.invoiceNumber} — ${invoice.guestName}, total $${invoice.totalAmount?.toFixed(2)}`,
      type: 'Payment',
    });

    res.status(201).json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const { extraCharges, status } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    if (extraCharges !== undefined && (!invoice.lineItems || invoice.lineItems.length === 0)) {
      invoice.extraCharges = Number(extraCharges);
      invoice.totalAmount = invoice.roomCharge + invoice.extraCharges + invoice.tax + invoice.serviceCharge;
    } else if (extraCharges !== undefined) {
      invoice.extraCharges = Number(extraCharges);
      recalcTotals(invoice);
    }

    const wasPaid = invoice.status === 'Paid';
    if (status !== undefined) {
      invoice.status = status;
    }

    await invoice.save();

    if (status === 'Paid' && !wasPaid) {
      await notifyAdmin({
        title: 'Invoice marked paid',
        message: `${invoice.invoiceNumber} — ${invoice.guestName}`,
        type: 'Payment',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, method, transactionId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    // Create payment transaction record
    const payment = await Payment.create({
      reservation: invoice.reservation,
      amount: amount || invoice.totalAmount,
      method: method || 'Credit Card',
      status: 'Completed',
      transactionId: transactionId || `TX-${Math.floor(1000000 + Math.random() * 9000000)}`
    });

    // Update invoice payment status
    invoice.status = 'Paid';
    await invoice.save();

    // Update reservation payment status
    const reservation = await Reservation.findById(invoice.reservation);
    if (reservation) {
      reservation.paymentStatus = 'Paid';
      await reservation.save();
    }

    await notifyAdmin({
      title: 'Payment received',
      message: `${invoice.invoiceNumber} — $${(payment.amount || invoice.totalAmount).toFixed(2)} via ${payment.method}`,
      type: 'Payment',
    });

    res.status(201).json({
      status: 'success',
      data: {
        payment,
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const features = new APIFeatures(Payment.find().populate('reservation'), req.query)
      .filter()
      .sort()
      .paginate();

    const payments = await features.query;

    res.status(200).json({
      status: 'success',
      results: payments.length,
      data: {
        payments
      }
    });
  } catch (error) {
    next(error);
  }
};
