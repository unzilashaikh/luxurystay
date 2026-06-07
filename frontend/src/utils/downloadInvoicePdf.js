import { jsPDF } from 'jspdf';
import logoUrl from '../assets/logo.png';

const GOLD = [193, 161, 102];
const GOLD_LIGHT = [250, 247, 242];
const DARK = [44, 62, 80];
const MUTED = [120, 120, 120];
const BORDER = [230, 225, 218];
const WHITE = [255, 255, 255];

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

let logoDataUrlPromise = null;

const loadLogoDataUrl = () => {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxW = 400;
        const scale = Math.min(1, maxW / img.naturalWidth);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // Faint watermark variant (drawn behind invoice content)
        const wmSize = 520;
        const wmScale = wmSize / Math.max(img.naturalWidth, img.naturalHeight);
        const wmW = Math.round(img.naturalWidth * wmScale);
        const wmH = Math.round(img.naturalHeight * wmScale);
        const wmCanvas = document.createElement('canvas');
        wmCanvas.width = wmW;
        wmCanvas.height = wmH;
        const wmCtx = wmCanvas.getContext('2d');
        wmCtx.globalAlpha = 0.07;
        wmCtx.drawImage(img, 0, 0, wmW, wmH);

        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          w,
          h,
          watermarkDataUrl: wmCanvas.toDataURL('image/png'),
          aspect: w / h,
        });
      };
      img.onerror = () => reject(new Error('Could not load hotel logo'));
      img.src = logoUrl;
    });
  }
  return logoDataUrlPromise;
};

const drawMetaBox = (doc, x, y, w, h, title) => {
  doc.setFillColor(...GOLD_LIGHT);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(title.toUpperCase(), x + 4, y + 6);
};

const drawTableHeader = (doc, margin, y, pageW) => {
  const colAmount = pageW - margin - 28;
  doc.setFillColor(...DARK);
  doc.rect(margin, y, pageW - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text('DESCRIPTION', margin + 4, y + 5.5);
  doc.text('AMOUNT', colAmount, y + 5.5, { align: 'right' });
  return y + 8;
};

const drawTableRow = (doc, margin, y, pageW, label, amount, shaded) => {
  const rowH = 8;
  const colAmount = pageW - margin - 28;
  if (shaded) {
    doc.setFillColor(252, 251, 249);
    doc.rect(margin, y, pageW - margin * 2, rowH, 'F');
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(label, margin + 4, y + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.text(amount, colAmount, y + 5.5, { align: 'right' });
  return y + rowH;
};

/**
 * Generate and download a LuxuryStay invoice PDF (with brand logo).
 */
export const downloadInvoicePdf = async (inv) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = margin;

  let logo = null;
  try {
    logo = await loadLogoDataUrl();
  } catch {
    logo = null;
  }

  // Background watermark (light logo, centered)
  if (logo?.watermarkDataUrl) {
    const wmW = 95;
    const wmH = wmW / (logo.aspect || 1);
    doc.addImage(
      logo.watermarkDataUrl,
      'PNG',
      (pageW - wmW) / 2,
      (pageH - wmH) / 2,
      wmW,
      wmH
    );
  }

  // Top accent stripe
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, pageW, 3, 'F');

  // Header band
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, pageW - margin * 2, 32, 'S');

  const headerY = y + 6;
  if (logo?.dataUrl) {
    const logoH = 14;
    const logoW = (logo.aspect || logo.w / logo.h) * logoH;
    doc.addImage(logo.dataUrl, 'PNG', margin + 5, headerY, logoW, logoH);
  }

  const textX = logo?.dataUrl ? margin + 5 + (logo.w / logo.h) * 14 + 6 : margin + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text('Luxury Stay', textX, headerY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Premium Hotel & Resort', textX, headerY + 10);
  doc.text('billing@luxurystay.com  ·  +1 (800) 555-0199', textX, headerY + 15);

  // Invoice badge (top right)
  const badgeW = 42;
  const badgeX = pageW - margin - badgeW - 5;
  doc.setFillColor(...GOLD);
  doc.roundedRect(badgeX, headerY, badgeW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text('INVOICE', badgeX + badgeW / 2, headerY + 9, { align: 'center' });

  y += 38;

  // Invoice meta row
  const boxW = (pageW - margin * 2 - 8) / 2;
  const boxH = 28;
  drawMetaBox(doc, margin, y, boxW, boxH, 'Bill to');
  drawMetaBox(doc, margin + boxW + 8, y, boxW, boxH, 'Invoice info');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(inv.guestName || 'Guest', margin + 4, y + 12);

  const roomLabel =
    inv.reservation?.room?.number != null
      ? `Room ${inv.reservation.room.number}`
      : inv.reservation?.bookingId
        ? `Booking ${inv.reservation.bookingId}`
        : '';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  if (roomLabel) doc.text(roomLabel, margin + 4, y + 18);
  doc.text(`Status: ${inv.status || 'Unpaid'}`, margin + 4, y + 24);

  const rightX = margin + boxW + 8 + 4;
  const metaRight = [
    ['Invoice #', inv.invoiceNumber || '—'],
    ['Issue date', formatDate(inv.createdAt || inv.dueDate)],
    ['Due date', formatDate(inv.dueDate)],
  ];
  let metaY = y + 12;
  metaRight.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label, rightX, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(String(value), rightX + boxW - 8, metaY, { align: 'right' });
    metaY += 6;
  });

  y += boxH + 12;

  // Charges table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('Statement of charges', margin, y);
  y += 6;

  y = drawTableHeader(doc, margin, y, pageW);

  let rowShade = false;
  y = drawTableRow(doc, margin, y, pageW, 'Room charge', formatMoney(inv.roomCharge), rowShade);
  rowShade = !rowShade;

  const lineItems = inv.lineItems || [];
  if (lineItems.length > 0) {
    lineItems.forEach((line) => {
      const label = (line.description || 'Additional charge').slice(0, 48);
      y = drawTableRow(doc, margin, y, pageW, label, formatMoney(line.amount), rowShade);
      rowShade = !rowShade;
    });
  } else if (Number(inv.extraCharges) > 0) {
    y = drawTableRow(doc, margin, y, pageW, 'Extra charges', formatMoney(inv.extraCharges), rowShade);
    rowShade = !rowShade;
  }

  y = drawTableRow(doc, margin, y, pageW, 'Tax (12%)', formatMoney(inv.tax), rowShade);
  rowShade = !rowShade;
  y = drawTableRow(doc, margin, y, pageW, 'Service charge (5%)', formatMoney(inv.serviceCharge), rowShade);

  // Table bottom border
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Totals block (right-aligned)
  const totalsW = 72;
  const totalsX = pageW - margin - totalsW;
  const subExtras =
    lineItems.length > 0
      ? lineItems.reduce((s, l) => s + (Number(l.amount) || 0), 0)
      : Number(inv.extraCharges) || 0;

  const totals = [
    ['Room subtotal', formatMoney(inv.roomCharge)],
    ...(subExtras > 0 ? [['Extras subtotal', formatMoney(subExtras)]] : []),
    ['Tax & fees', formatMoney((Number(inv.tax) || 0) + (Number(inv.serviceCharge) || 0))],
  ];

  totals.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label, totalsX, y);
    doc.setTextColor(...DARK);
    doc.text(value, pageW - margin, y, { align: 'right' });
    y += 6;
  });

  y += 4;
  doc.setFillColor(...GOLD);
  doc.roundedRect(totalsX - 4, y - 5, totalsW + 8, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text('Amount due', totalsX, y + 4);
  doc.text(formatMoney(inv.totalAmount), pageW - margin, y + 4, { align: 'right' });

  // Footer
  const footerY = pageH - 22;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY, pageW - margin, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Thank you for choosing Luxury Stay.', pageW / 2, footerY + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'This is a computer-generated invoice. For billing queries, contact reception or billing@luxurystay.com',
    pageW / 2,
    footerY + 13,
    { align: 'center' }
  );

  // Bottom accent
  doc.setFillColor(...GOLD);
  doc.rect(0, pageH - 3, pageW, 3, 'F');

  const fileName = `Invoice_${inv.invoiceNumber || inv._id || 'receipt'}.pdf`;
  doc.save(fileName);
};
