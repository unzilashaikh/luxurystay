const Invoice = require('../models/Invoice');

/**
 * Next sequential invoice id: INV-01, INV-02, …
 * Ignores legacy random ids (e.g. INV-19108).
 */
async function generateInvoiceNumber() {
  const invoices = await Invoice.find({ invoiceNumber: /^INV-/i })
    .select('invoiceNumber')
    .lean();

  let maxSeq = 0;
  for (const inv of invoices) {
    const match = String(inv.invoiceNumber).match(/^INV-(\d+)$/i);
    if (!match) continue;
    const numPart = match[1];
    if (numPart.length > 4) continue;
    const n = parseInt(numPart, 10);
    if (n > 0) maxSeq = Math.max(maxSeq, n);
  }

  let seq = maxSeq + 1;
  let invoiceNumber = `INV-${String(seq).padStart(2, '0')}`;
  while (await Invoice.findOne({ invoiceNumber })) {
    seq += 1;
    invoiceNumber = `INV-${String(seq).padStart(2, '0')}`;
  }

  return invoiceNumber;
}

module.exports = generateInvoiceNumber;
