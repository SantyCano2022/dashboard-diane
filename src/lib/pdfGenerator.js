import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCOP, RETEFUENTE_ACTIVITIES, RETEICA_RATES } from './taxEngine';

const WATERMARK = 'DOCUMENTO DE PRUEBA – NO VÁLIDO ANTE LA DIAN';
const DISCLAIMER =
  'Documento generado con fines educativos. Datos ficticios. Consulte a un contador certificado para presentaciones reales ante la DIAN.';
const NIT_DEMO = '999.999.999-0';
const COLOR_BRAND = [37, 99, 235]; // #2563eb
const COLOR_BRAND_DARK = [30, 58, 138]; // #1e3a8a
const COLOR_TEXT = [15, 23, 42]; // #0f172a
const COLOR_MUTED = [100, 116, 139]; // #64748b
const COLOR_SOFT = [241, 245, 249]; // #f1f5f9

function addWatermark(doc) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.saveGraphicsState?.();
  doc.setTextColor(220, 220, 220);
  doc.setFontSize(34);
  doc.setFont('helvetica', 'bold');
  doc.text(WATERMARK, w / 2, h / 2, { align: 'center', angle: 35 });
  doc.setTextColor(...COLOR_TEXT);
  doc.restoreGraphicsState?.();
}

function addHeader(doc, formNum, formTitle, period, company) {
  const w = doc.internal.pageSize.getWidth();

  // Banner top
  doc.setFillColor(...COLOR_BRAND_DARK);
  doc.rect(0, 0, w, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('REPÚBLICA DE COLOMBIA · DIRECCIÓN DE IMPUESTOS Y ADUANAS NACIONALES — DIAN', w / 2, 9, {
    align: 'center',
  });

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`FORMULARIO ${formNum}`, 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(formTitle, 14, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Período: ${period}`, w - 14, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('es-CO'), w - 14, 25, { align: 'right' });

  // Caja datos del declarante
  doc.setTextColor(...COLOR_TEXT);
  doc.setDrawColor(...COLOR_BRAND);
  doc.setFillColor(...COLOR_SOFT);
  doc.roundedRect(14, 34, w - 28, 26, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_MUTED);
  doc.text('DATOS DEL DECLARANTE', 18, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_TEXT);
  doc.text(`Razón Social:`, 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(company.name, 44, 47);

  doc.setFont('helvetica', 'bold');
  doc.text(`NIT:`, 18, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(NIT_DEMO, 28, 53);

  doc.setFont('helvetica', 'bold');
  doc.text(`Régimen:`, 80, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(company.tax_regime === 'common' ? 'Común' : 'Simplificado', 96, 53);

  doc.setFont('helvetica', 'bold');
  doc.text(`Ciudad:`, 140, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(company.city || 'Bogotá D.C.', 154, 53);

  return 68;
}

function addDisclaimer(doc) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(255, 243, 205);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, h - 32, w - 28, 22, 2, 2, 'FD');
  doc.setTextColor(120, 80, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ ADVERTENCIA — DOCUMENTO NO OFICIAL', 18, h - 24);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(DISCLAIMER, w - 36);
  doc.text(lines, 18, h - 19);
  doc.setTextColor(...COLOR_TEXT);

  // Branding sutil debajo del bloque legal
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Generado con Dashboard Tributario DIAN', 18, h - 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('CANO SAS DEV', w - 14, h - 5, { align: 'right' });
  doc.setTextColor(...COLOR_TEXT);
}

function ivaBreakdownByRate(invoices = [], typeFilter = null) {
  const groups = {};
  invoices.forEach(inv => {
    const type = inv.type || 'sale';
    if (typeFilter && type !== typeFilter) return;
    const rate = Number(inv.iva_rate) || 0;
    const key = rate.toFixed(0);
    if (!groups[key]) groups[key] = { rate, base: 0, iva: 0, count: 0 };
    groups[key].base += Math.abs(Number(inv.base_amount) || 0);
    groups[key].iva += Math.abs(Number(inv.iva_amount) || 0);
    groups[key].count += 1;
  });
  return Object.values(groups).sort((a, b) => b.rate - a.rate);
}

function retefuenteByActivity(invoices = []) {
  const groups = {};
  invoices.forEach(inv => {
    const key = inv.activity || 'servicios';
    if (!groups[key]) {
      const meta = RETEFUENTE_ACTIVITIES[key] || { rate: 0, label: key };
      groups[key] = {
        activity: key,
        label: meta.label,
        rate: meta.rate,
        base: 0,
        retencion: 0,
        count: 0,
      };
    }
    groups[key].base += Number(inv.base_amount) || 0;
    groups[key].retencion += Number(inv.retefuente_amount) || 0;
    groups[key].count += 1;
  });
  return Object.values(groups)
    .filter(g => g.retencion > 0)
    .sort((a, b) => b.retencion - a.retencion);
}

function reteicaByCity(invoices = []) {
  const groups = {};
  invoices.forEach(inv => {
    const city = inv.city || 'bogota';
    const sector = inv.sector || 'servicios';
    const key = `${city}__${sector}`;
    if (!groups[key]) {
      const rate = (RETEICA_RATES[city]?.[sector] || 0) * 1000;
      groups[key] = { city, sector, ratePermil: rate, base: 0, retencion: 0, count: 0 };
    }
    groups[key].base += Number(inv.base_amount) || 0;
    groups[key].retencion += Number(inv.reteica_amount) || 0;
    groups[key].count += 1;
  });
  return Object.values(groups)
    .filter(g => g.retencion > 0)
    .sort((a, b) => b.retencion - a.retencion);
}

function tableTheme() {
  return {
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      textColor: COLOR_TEXT,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLOR_BRAND,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  };
}

// ============================================
// FORMULARIO 300 — DECLARACIÓN DE IVA
// ============================================
export function generateForm300(summary, company, period, invoices = []) {
  const doc = new jsPDF();
  addWatermark(doc);
  let y = addHeader(doc, '300', 'Declaración del Impuesto sobre las Ventas — IVA', period, company);

  // Solo ventas + notas crédito para Form 300 (lado derecho del IVA)
  const salesInvoices = invoices.filter(
    inv => (inv.type || 'sale') === 'sale' || inv.type === 'credit_note'
  );
  const purchaseInvoices = invoices.filter(inv => inv.type === 'purchase');

  const salesBreakdown = ivaBreakdownByRate(salesInvoices);
  const purchaseBreakdown = ivaBreakdownByRate(purchaseInvoices);
  const totalBaseGravable = salesBreakdown.filter(b => b.rate > 0).reduce((s, b) => s + b.base, 0);
  const totalBaseExenta = salesBreakdown.filter(b => b.rate === 0).reduce((s, b) => s + b.base, 0);

  // I. IVA generado (ventas)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('I. IVA GENERADO POR VENTAS', 14, y);
  y += 4;

  autoTable(doc, {
    ...tableTheme(),
    startY: y,
    head: [['Tarifa', 'Facturas', 'Base Gravable', 'IVA Generado']],
    body: salesBreakdown.length
      ? salesBreakdown.map(b => [
          `${b.rate}%`,
          String(b.count),
          formatCOP(b.base),
          formatCOP(b.iva),
        ])
      : [['—', '0', formatCOP(0), formatCOP(0)]],
    foot: [
      [
        { content: 'TOTAL VENTAS', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
        {
          content: formatCOP(summary.total_base_sales || summary.total_base),
          styles: { fontStyle: 'bold' },
        },
        {
          content: formatCOP(summary.total_iva_generado || summary.total_iva),
          styles: { fontStyle: 'bold' },
        },
      ],
    ],
    footStyles: { fillColor: COLOR_SOFT, textColor: COLOR_TEXT },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // II. IVA descontable (compras)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('II. IVA DESCONTABLE POR COMPRAS', 14, y);
  y += 4;

  autoTable(doc, {
    ...tableTheme(),
    startY: y,
    head: [['Tarifa', 'Facturas', 'Base', 'IVA Descontable']],
    body: purchaseBreakdown.length
      ? purchaseBreakdown.map(b => [
          `${b.rate}%`,
          String(b.count),
          formatCOP(b.base),
          formatCOP(b.iva),
        ])
      : [['Sin compras', '0', formatCOP(0), formatCOP(0)]],
    foot: [
      [
        { content: 'TOTAL COMPRAS', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatCOP(summary.total_base_purchases || 0), styles: { fontStyle: 'bold' } },
        { content: formatCOP(summary.total_iva_descontable || 0), styles: { fontStyle: 'bold' } },
      ],
    ],
    footStyles: { fillColor: COLOR_SOFT, textColor: COLOR_TEXT },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('III. RENGLONES DEL FORMULARIO 300', 14, y);
  y += 4;

  const ivaGenerado = summary.total_iva_generado || summary.total_iva || 0;
  const ivaDescontable = summary.total_iva_descontable || 0;
  const reteiva = summary.total_reteiva || 0;
  const saldo = ivaGenerado - ivaDescontable - reteiva;

  autoTable(doc, {
    ...tableTheme(),
    startY: y,
    head: [['Renglón', 'Concepto', 'Valor']],
    body: [
      ['27', 'Ingresos brutos por operaciones gravadas', formatCOP(totalBaseGravable)],
      ['29', 'Ingresos por operaciones exentas / no gravadas', formatCOP(totalBaseExenta)],
      ['32', 'Total base gravable (ventas)', formatCOP(totalBaseGravable)],
      ['41', 'Total IVA generado', formatCOP(ivaGenerado)],
      ['54', 'Total IVA descontable (por compras)', formatCOP(ivaDescontable)],
      ['60', 'Retenciones de IVA practicadas', formatCOP(reteiva)],
      [
        { content: '67', styles: { fontStyle: 'bold' } },
        { content: saldo >= 0 ? 'Saldo a pagar' : 'Saldo a favor', styles: { fontStyle: 'bold' } },
        { content: formatCOP(Math.abs(saldo)), styles: { fontStyle: 'bold' } },
      ],
    ],
    columnStyles: { 0: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 50, halign: 'right' } },
  });

  y = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  doc.text(
    `Facturas procesadas: ${summary.total_invoices} (${summary.total_sales || 0} ventas · ${summary.total_purchases || 0} compras · ${summary.total_credit_notes || 0} notas crédito)`,
    14,
    y
  );
  doc.setTextColor(...COLOR_TEXT);

  addDisclaimer(doc);
  doc.save(`Formulario_300_IVA_${period}.pdf`);
}

// ============================================
// FORMULARIO 350 — RETENCIONES EN LA FUENTE
// ============================================
export function generateForm350(summary, company, period, invoices = []) {
  const doc = new jsPDF();
  addWatermark(doc);
  let y = addHeader(doc, '350', 'Declaración Mensual de Retenciones en la Fuente', period, company);

  const refByActivity = retefuenteByActivity(invoices);
  const reteicaCities = reteicaByCity(invoices);

  // Sección Retefuente por actividad
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RETENCIÓN EN LA FUENTE POR ACTIVIDAD', 14, y);
  y += 4;

  autoTable(doc, {
    ...tableTheme(),
    startY: y,
    head: [['Actividad', 'Tarifa', 'Facturas', 'Base', 'Retención']],
    body: refByActivity.length
      ? refByActivity.map(g => [
          g.label,
          `${(g.rate * 100).toFixed(2)}%`,
          String(g.count),
          formatCOP(g.base),
          formatCOP(g.retencion),
        ])
      : [['Sin retenciones', '—', '0', formatCOP(0), formatCOP(0)]],
    foot: [
      [
        { content: 'TOTAL RETEFUENTE', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatCOP(summary.total_retefuente), styles: { fontStyle: 'bold' } },
      ],
    ],
    footStyles: { fillColor: COLOR_SOFT, textColor: COLOR_TEXT },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Sección ReteICA por ciudad
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('II. RETEICA POR CIUDAD', 14, y);
  y += 4;

  autoTable(doc, {
    ...tableTheme(),
    startY: y,
    head: [['Ciudad', 'Sector', 'Tarifa (‰)', 'Base', 'Retención']],
    body: reteicaCities.length
      ? reteicaCities.map(g => [
          g.city.charAt(0).toUpperCase() + g.city.slice(1),
          g.sector,
          g.ratePermil.toFixed(2),
          formatCOP(g.base),
          formatCOP(g.retencion),
        ])
      : [['Sin retenciones', '—', '—', formatCOP(0), formatCOP(0)]],
    foot: [
      [
        { content: 'TOTAL RETEICA', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatCOP(summary.total_reteica), styles: { fontStyle: 'bold' } },
      ],
    ],
    footStyles: { fillColor: COLOR_SOFT, textColor: COLOR_TEXT },
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Renglones consolidados
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('III. RENGLONES DEL FORMULARIO 350', 14, y);
  y += 4;

  const totalRet = summary.total_retefuente + summary.total_reteica + summary.total_reteiva;
  autoTable(doc, {
    ...tableTheme(),
    startY: y,
    head: [['Renglón', 'Concepto', 'Valor']],
    body: [
      ['45', 'Total retenciones en la fuente — Renta', formatCOP(summary.total_retefuente)],
      ['54', 'Total ReteICA practicada', formatCOP(summary.total_reteica)],
      ['59', 'Total ReteIVA practicada', formatCOP(summary.total_reteiva)],
      [
        { content: '67', styles: { fontStyle: 'bold' } },
        { content: 'TOTAL RETENCIONES A PAGAR', styles: { fontStyle: 'bold' } },
        { content: formatCOP(totalRet), styles: { fontStyle: 'bold' } },
      ],
    ],
    columnStyles: { 0: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 50, halign: 'right' } },
  });

  y = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  doc.text(`Total facturas procesadas: ${summary.total_invoices}`, 14, y);
  doc.setTextColor(...COLOR_TEXT);

  addDisclaimer(doc);
  doc.save(`Formulario_350_Retenciones_${period}.pdf`);
}
