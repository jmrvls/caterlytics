// Purchase order document: a PDF to download and a ready-made email to the supplier.
// jsPDF is only loaded when the button is clicked, so the Suppliers page stays light.
import { poTotal, formatShortDate } from './suppliers';

// The built-in PDF fonts have no peso sign, so amounts are written as "PHP 1,234.00" here.
const php = (v) => `PHP ${Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function downloadPurchaseOrderPdf({ po, supplier, business }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const left = 40;
  const right = doc.internal.pageSize.getWidth() - 40;
  let y = 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PURCHASE ORDER', left, y);
  doc.setFontSize(11);
  doc.text(po.po_number || '', right, y, { align: 'right' });
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Status: ${po.status || ''}`, right, y, { align: 'right' });
  doc.setTextColor(0);

  // From (our business) and To (supplier), side by side.
  const block = (title, lines, x) => {
    let yy = y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(title, x, yy);
    doc.setTextColor(0);
    doc.setFontSize(10);
    yy += 14;
    lines.filter(Boolean).forEach((line, i) => {
      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      const wrapped = doc.splitTextToSize(String(line), 230);
      doc.text(wrapped, x, yy);
      yy += wrapped.length * 12;
    });
    return yy;
  };
  y += 14;
  const yFrom = block('FROM', [business?.business_name || 'Our business', business?.address, business?.contact_number, business?.contact_email], left);
  const yTo = block('TO (SUPPLIER)', [
    supplier?.supplier_name || po.supplier?.supplier_name,
    supplier?.contact_person || po.supplier?.contact_person,
    supplier?.contact_number || po.supplier?.contact_number,
    supplier?.email,
    supplier?.address,
  ], 310);
  y = Math.max(yFrom, yTo) + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const meta = [
    ['Order date', formatShortDate(po.order_date) || '-'],
    ['Expected delivery', po.expected_date ? formatShortDate(po.expected_date) : '-'],
    ['Payment terms', supplier?.payment_terms || '-'],
  ];
  meta.forEach(([k, v], i) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, left + i * 175, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(v), left + i * 175 + (k.length > 11 ? 92 : 66), y);
  });
  y += 12;

  autoTable(doc, {
    startY: y + 6,
    head: [['#', 'Item', 'Qty', 'Unit', 'Unit cost', 'Line total']],
    body: (po.items || po.lines || []).map((l, i) => [
      i + 1,
      l.item_name,
      l.quantity,
      l.unit || '',
      php(l.unit_cost),
      php((Number(l.quantity) || 0) * (Number(l.unit_cost) || 0)),
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [5, 150, 105] },
    columnStyles: { 0: { cellWidth: 26 }, 2: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    margin: { left, right: 40 },
  });

  y = doc.lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total: ${php(poTotal(po))}`, right, y, { align: 'right' });

  if (po.notes) {
    y += 22;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', left, y);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(String(po.notes), right - left), left, y + 12);
  }

  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text(`Generated ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}`, left, doc.internal.pageSize.getHeight() - 30);

  doc.save(`${po.po_number || 'purchase-order'}.pdf`);
}

// A mail link with the order already written out. (A mail link cannot attach files,
// so the items are in the message itself and the PDF can be attached by hand.)
export function buildPurchaseOrderMailto({ po, supplier, business }) {
  if (!supplier?.email) return '';
  const lines = (po.items || []).map((l) => `- ${l.item_name}: ${l.quantity} ${l.unit || ''}`.trim());
  const body = [
    `Hello ${supplier.contact_person || supplier.supplier_name},`,
    '',
    `Please see our purchase order ${po.po_number}${po.expected_date ? `, needed by ${formatShortDate(po.expected_date)}` : ''}:`,
    '',
    ...lines,
    '',
    `Total: ${php(poTotal(po))}`,
    po.notes ? `Notes: ${po.notes}` : '',
    '',
    'Please confirm that you received this order. Thank you!',
    business?.business_name || '',
  ].filter((x, i, arr) => x !== '' || arr[i - 1] !== '').join('\n');
  return `mailto:${encodeURIComponent(supplier.email)}?subject=${encodeURIComponent(`Purchase Order ${po.po_number}`)}&body=${encodeURIComponent(body)}`;
}