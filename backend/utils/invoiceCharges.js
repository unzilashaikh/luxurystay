const Invoice = require('../models/Invoice');
const Reservation = require('../models/Reservation');
const generateInvoiceNumber = require('./generateInvoiceNumber');
const { notifyAdmin } = require('./notify');

const recalcTotals = (invoice) => {
  const room = Number(invoice.roomCharge) || 0;
  const extras = (invoice.lineItems || []).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  invoice.extraCharges = parseFloat(extras.toFixed(2));
  invoice.tax = parseFloat((room * 0.12).toFixed(2));
  invoice.serviceCharge = parseFloat((room * 0.05).toFixed(2));
  invoice.totalAmount = parseFloat((room + invoice.extraCharges + invoice.tax + invoice.serviceCharge).toFixed(2));
  return invoice;
};

const findOrCreateInvoiceForReservation = async (reservationId) => {
  const booking = await Reservation.findById(reservationId);
  if (!booking) {
    return { booking: null, invoice: null };
  }

  let invoice = await Invoice.findOne({ reservation: booking._id });
  if (!invoice) {
    const invoiceNumber = await generateInvoiceNumber();
    const roomCharge = Number(booking.totalPrice) || 0;
    invoice = await Invoice.create({
      invoiceNumber,
      reservation: booking._id,
      guestName: booking.guestName,
      roomCharge,
      lineItems: [],
      extraCharges: 0,
      tax: parseFloat((roomCharge * 0.12).toFixed(2)),
      serviceCharge: parseFloat((roomCharge * 0.05).toFixed(2)),
      totalAmount: 0,
      status: booking.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid',
      dueDate: booking.checkOut ? new Date(booking.checkOut) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    recalcTotals(invoice);
    await invoice.save();
  }

  return { booking, invoice };
};

/**
 * Add a line item to the guest folio (invoice) for a reservation.
 */
const addChargeToReservation = async (reservationId, { description, amount, source = 'service', sourceId }) => {
  const charge = Number(amount);
  if (!reservationId || !description || !charge || charge <= 0) {
    return null;
  }

  const { booking, invoice } = await findOrCreateInvoiceForReservation(reservationId);
  if (!booking || !invoice) return null;

  invoice.lineItems = invoice.lineItems || [];
  invoice.lineItems.push({
    description: description.trim(),
    amount: parseFloat(charge.toFixed(2)),
    source,
    sourceId: sourceId || undefined,
    addedAt: new Date(),
  });

  recalcTotals(invoice);
  await invoice.save();

  await notifyAdmin({
    title: 'Charge added to guest bill',
    message: `${booking.guestName}: ${description.trim()} — $${charge.toFixed(2)} (${invoice.invoiceNumber})`,
    type: 'Payment',
  });

  return invoice;
};

module.exports = {
  recalcTotals,
  findOrCreateInvoiceForReservation,
  addChargeToReservation,
};
