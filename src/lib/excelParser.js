import * as XLSX from 'xlsx';
import { calculateInvoiceTaxes } from './taxEngine';

/**
 * Parse an Excel file containing Colombian invoices
 * Supports flexible column mapping
 */

const COLUMN_MAP = {
  // Spanish column names → internal keys
  'numero': 'invoice_number',
  'numero_factura': 'invoice_number',
  'no_factura': 'invoice_number',
  'factura': 'invoice_number',
  'fecha': 'date',
  'proveedor': 'vendor_name',
  'nombre_proveedor': 'vendor_name',
  'nit_proveedor': 'vendor_nit',
  'nit': 'vendor_nit',
  'concepto': 'concept',
  'descripcion': 'concept',
  'base': 'base_amount',
  'base_gravable': 'base_amount',
  'valor_base': 'base_amount',
  'subtotal': 'base_amount',
  'iva': 'iva_rate',
  'tarifa_iva': 'iva_rate',
  '%_iva': 'iva_rate',
  'actividad': 'activity',
  'tipo_actividad': 'activity',
  'ciudad': 'city',
  'sector': 'sector',
};

function normalizeColumnName(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9_]/g, '');
}

function mapRow(row, headers) {
  const mapped = {};
  headers.forEach((header, idx) => {
    const normalized = normalizeColumnName(header);
    const internalKey = COLUMN_MAP[normalized] || normalized;
    const value = row[idx];
    if (value !== undefined && value !== null && value !== '') {
      mapped[internalKey] = value;
    }
  });
  return mapped;
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (rawData.length < 2) {
          reject(new Error('El archivo no contiene datos suficientes. Se requiere al menos una fila de encabezados y una de datos.'));
          return;
        }

        const headers = rawData[0];
        const rows = rawData.slice(1).filter(row => row.some(cell => cell != null && cell !== ''));

        const invoices = rows.map((row, index) => {
          const mapped = mapRow(row, headers);

          // Validate required fields
          if (!mapped.base_amount) {
            return null; // Skip rows without base amount
          }

          // Parse date
          let parsedDate = mapped.date;
          if (parsedDate instanceof Date) {
            parsedDate = parsedDate.toISOString().split('T')[0];
          } else if (typeof parsedDate === 'string') {
            parsedDate = parsedDate.split('T')[0];
          } else {
            parsedDate = new Date().toISOString().split('T')[0];
          }

          const invoice = {
            id: `excel-${index}-${Date.now()}`,
            invoice_number: mapped.invoice_number || `FAC-${String(index + 1).padStart(4, '0')}`,
            date: parsedDate,
            vendor_name: mapped.vendor_name || 'Sin proveedor',
            vendor_nit: mapped.vendor_nit || '',
            concept: mapped.concept || 'Sin concepto',
            base_amount: Number(mapped.base_amount) || 0,
            iva_rate: mapped.iva_rate !== undefined ? Number(mapped.iva_rate) : 19,
            activity: mapped.activity || 'servicios',
            city: mapped.city || 'bogota',
            sector: mapped.sector || 'servicios',
          };

          // Calculate taxes
          const taxes = calculateInvoiceTaxes(invoice);
          return { ...invoice, ...taxes };
        }).filter(Boolean);

        resolve({
          invoices,
          totalRows: rows.length,
          parsedRows: invoices.length,
          skippedRows: rows.length - invoices.length,
          columns: headers,
        });
      } catch (err) {
        reject(new Error(`Error al procesar el archivo Excel: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate a template Excel for download
 */
export function generateTemplateExcel() {
  const templateData = [
    ['Número Factura', 'Fecha', 'Proveedor', 'NIT Proveedor', 'Concepto', 'Base Gravable', 'Tarifa IVA', 'Actividad', 'Ciudad'],
    ['FAC-0001', '2025-01-15', 'Proveedor Demo SAS', '900123456', 'Servicios de consultoría', 5000000, 19, 'consultoria', 'bogota'],
    ['FAC-0002', '2025-01-20', 'Tech Solutions SAS', '900654321', 'Licencia de software', 3000000, 19, 'software', 'bogota'],
    ['FAC-0003', '2025-02-01', 'Inmobiliaria Central', '800111222', 'Arrendamiento oficina', 4500000, 0, 'arrendamiento_inmuebles', 'bogota'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  ws['!cols'] = [
    { width: 16 }, { width: 12 }, { width: 24 }, { width: 14 },
    { width: 28 }, { width: 16 }, { width: 12 }, { width: 20 }, { width: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
  XLSX.writeFile(wb, 'plantilla_facturas_dian.xlsx');
}
