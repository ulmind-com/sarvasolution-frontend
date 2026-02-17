import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  product?: { productName?: string; hsnCode?: string };
  productName?: string;
  quantity?: number;
  price?: number;
  amount?: number;
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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Left
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sarva Solution Vision', 14, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('www.sarvasolutionvision.com', 14, 26);

  // Header - Right
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageWidth - 14, 20, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${sale.saleNo}`, pageWidth - 14, 27, { align: 'right' });
  const dateStr = sale.createdAt_IST || new Date(sale.saleDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 33, { align: 'right' });

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 37, pageWidth - 14, 37);

  // Billed To
  let y = 44;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y += 6;
  doc.text(`Name: ${sale.user?.fullName || 'N/A'}`, 14, y);
  y += 5;
  doc.text(`Member ID: ${sale.user?.memberId || sale.memberId || 'N/A'}`, 14, y);
  y += 5;
  doc.text(`Phone: ${sale.user?.phone || 'N/A'}`, 14, y);
  y += 5;
  const country = sale.user?.address?.country || 'India';
  const city = sale.user?.address?.city || '';
  const state = sale.user?.address?.state || '';
  const addressParts = [city, state, country].filter(Boolean).join(', ');
  doc.text(`Address: ${addressParts || 'India'}`, 14, y);

  // Sold By
  const rightX = pageWidth / 2 + 10;
  let ry = 44;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sold By:', rightX, ry);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  ry += 6;
  doc.text(franchiseName || 'Franchise Store', rightX, ry);

  // Items table
  const tableStartY = Math.max(y, ry) + 12;

  const tableBody = sale.items.map((item, i) => [
    (i + 1).toString(),
    item.product?.productName || item.productName || 'N/A',
    item.product?.hsnCode || '-',
    (item.quantity ?? 0).toString(),
    `₹${(item.price ?? 0).toLocaleString('en-IN')}`,
    (item.pv ?? 0).toString(),
    `₹${(item.amount ?? 0).toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Product Name', 'HSN Code', 'Qty', 'Price', 'PV', 'Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 28, halign: 'right' },
    },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;
  let sy = finalY + 10;
  const summaryX = pageWidth - 70;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX, sy);
  doc.text(`₹${(sale.subTotal ?? sale.grandTotal ?? 0).toLocaleString('en-IN')}`, pageWidth - 14, sy, { align: 'right' });
  sy += 6;
  doc.text('GST (18%):', summaryX, sy);
  doc.text(`₹${(sale.gstAmount ?? 0).toLocaleString('en-IN')}`, pageWidth - 14, sy, { align: 'right' });
  sy += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Grand Total:', summaryX, sy);
  doc.text(`₹${(sale.grandTotal ?? 0).toLocaleString('en-IN')}`, pageWidth - 14, sy, { align: 'right' });
  sy += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Total PV:', summaryX, sy);
  doc.text(`${sale.totalPV ?? 0}`, pageWidth - 14, sy, { align: 'right' });

  // Payment method
  sy += 8;
  doc.text(`Payment Method: ${sale.paymentMethod || 'N/A'}`, summaryX, sy);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('System Generated Invoice - Sarva Solution Vision', pageWidth / 2, footerY + 5, { align: 'center' });

  doc.save(`Invoice_${sale.saleNo}.pdf`);
};
