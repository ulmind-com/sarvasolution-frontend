import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  product?: { productName?: string; hsnCode?: string };
  productName?: string;
  hsnCode?: string;
  quantity?: number;
  price?: number;
  productDP?: number;
  amount?: number;
  gstAmount?: number;
  pv?: number;
}

interface InvoiceSale {
  saleNo: string;
  createdAt_IST?: string;
  saleDate: string;
  user?: {
    fullName?: string;
    memberId?: string;
    phone?: string;
    email?: string;
    address?: { country?: string; city?: string; state?: string };
  };
  memberId?: string;
  items: InvoiceItem[];
  subTotal?: number;
  gstAmount?: number;
  grandTotal: number;
  totalPV?: number;
  paymentMethod?: string;
}

export const generateInvoicePDF = (sale: InvoiceSale, franchiseName?: string) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 10; // margin
  const fName = franchiseName || 'Franchise Store';

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  // ── Title ──
  doc.rect(m, m, pw - 2 * m, 10);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GST INVOICE', pw / 2, m + 7, { align: 'center' });

  // ── Header Row (two columns) ──
  const hY = m + 10;
  const hH = 28;
  const midX = pw / 2;
  doc.rect(m, hY, midX - m, hH);
  doc.rect(midX, hY, pw - m - midX, hH);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let ly = hY + 5;
  doc.text('GST No: 19ABRCS5991B1ZQ', m + 3, ly);
  ly += 4;
  doc.text('Tax is payable on Reverse Charge: No', m + 3, ly);
  ly += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${sale.saleNo}`, m + 3, ly);
  doc.setFont('helvetica', 'normal');
  ly += 4;
  const dateStr = sale.createdAt_IST || new Date(sale.saleDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Date: ${dateStr}`, m + 3, ly);

  let ry = hY + 5;
  doc.text('Transportation Mode: N/A', midX + 3, ry);
  ry += 4;
  doc.text('Transport No: N', midX + 3, ry);
  ry += 4;
  doc.text('E-Way Bill No: N', midX + 3, ry);
  ry += 4;
  doc.text('L.R No: N', midX + 3, ry);

  // ── Parties Row ──
  const pY = hY + hH;
  const pH2 = 26;
  doc.rect(m, pY, midX - m, pH2);
  doc.rect(midX, pY, pw - m - midX, pH2);

  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', m + 3, pY + 5);
  doc.setFont('helvetica', 'normal');
  const userName = sale.user?.fullName || 'N/A';
  const userPhone = sale.user?.phone || 'N/A';
  const memberId = sale.user?.memberId || sale.memberId || 'N/A';
  const addr = [sale.user?.address?.city, sale.user?.address?.state, sale.user?.address?.country || 'India'].filter(Boolean).join(', ');
  doc.text(`Name: ${userName}`, m + 3, pY + 10);
  doc.text(`Address: ${addr}`, m + 3, pY + 14);
  doc.text(`Contact: ${userPhone}`, m + 3, pY + 18);
  doc.text(`Member ID: ${memberId}`, m + 3, pY + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Shipped To / Sold By:', midX + 3, pY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${fName}`, midX + 3, pY + 10);
  doc.text('Address: India', midX + 3, pY + 14);

  // ── Items Table ──
  const tableStartY = pY + pH2 + 2;

  const cgstTotal = (sale.gstAmount ?? 0) / 2;
  const sgstTotal = (sale.gstAmount ?? 0) / 2;
  const itemCount = sale.items.length || 1;

  const tableBody = sale.items.map((item, i) => {
    const qty = item.quantity ?? 0;
    const rate = item.price ?? 0;
    const gross = qty * rate;
    const taxable = item.amount ?? gross;
    const itemCgst = (item.gstAmount ?? (sale.gstAmount ?? 0) / itemCount) / 2;
    const itemSgst = itemCgst;
    return [
      (i + 1).toString(),
      item.product?.productName || item.productName || 'N/A',
      item.hsnCode || item.product?.hsnCode || '-',
      qty.toString(),
      '-',
      'Nos',
      `₹${rate.toLocaleString('en-IN')}`,
      `₹${(item.productDP ?? rate).toLocaleString('en-IN')}`,
      `₹${gross.toLocaleString('en-IN')}`,
      '0',
      `₹${taxable.toLocaleString('en-IN')}`,
      `₹${itemCgst.toFixed(2)}`,
      `₹${itemSgst.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['Sl', 'Description of Goods', 'HSN', 'QTY', 'Batch', 'UOM', 'Rate', 'MRP', 'Gross', 'Disc', 'Taxable', 'CGST', 'SGST']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 22, halign: 'right' },
      9: { cellWidth: 12, halign: 'center' },
      10: { cellWidth: 22, halign: 'right' },
      11: { cellWidth: 20, halign: 'right' },
      12: { cellWidth: 20, halign: 'right' },
    },
    styles: { lineWidth: 0.3, lineColor: [0, 0, 0] },
  });

  // ── Totals ──
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;
  let sy = finalY + 4;
  const labelX = pw - 90;
  const valX = pw - m;
  const lineH = 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const summaryLines: [string, string][] = [
    ['Gross Total:', `₹${(sale.subTotal ?? sale.grandTotal ?? 0).toLocaleString('en-IN')}`],
    ['CGST:', `₹${cgstTotal.toFixed(2)}`],
    ['SGST:', `₹${sgstTotal.toFixed(2)}`],
    ['IGST:', '₹0.00'],
    ['Net Amount:', `₹${(sale.grandTotal ?? 0).toLocaleString('en-IN')}`],
    ['Discount:', '₹0.00'],
    ['Transport Charge:', '₹0.00'],
  ];

  // Draw summary box
  const boxH = (summaryLines.length + 1) * lineH + 4;
  doc.rect(labelX - 3, sy - 2, pw - m - labelX + 3, boxH);

  summaryLines.forEach(([label, val]) => {
    doc.text(label, labelX, sy + 3);
    doc.text(val, valX, sy + 3, { align: 'right' });
    sy += lineH;
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Payable:', labelX, sy + 3);
  doc.text(`₹${(sale.grandTotal ?? 0).toLocaleString('en-IN')}`, valX, sy + 3, { align: 'right' });

  // ── Signature Block ──
  const sigY = Math.min(sy + 20, ph - 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.line(pw - 70, sigY, pw - m, sigY);
  doc.text('Authorised Signature', pw - m - 30, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${fName}`, pw - m - 30, sigY + 10, { align: 'center' });

  doc.save(`Invoice_${sale.saleNo}.pdf`);
};
