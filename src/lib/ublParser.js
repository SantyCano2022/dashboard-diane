/**
 * Parser de Factura Electrónica DIAN — formato UBL 2.1.
 *
 * La DIAN exige el estándar UBL (Universal Business Language) 2.1 para facturación
 * electrónica. Este parser extrae los campos relevantes de un XML AttachedDocument
 * o Invoice y los convierte al esquema interno de la app.
 *
 * Soporta:
 *  - Factura de venta (Invoice)
 *  - Nota crédito (CreditNote)
 *  - Documento adjunto (AttachedDocument que envuelve un Invoice CDATA)
 *
 * Referencia: Resolución DIAN 000165/2023, anexo técnico v1.9.
 */

import { calculateInvoiceTaxes } from './taxEngine';

const NS = {
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
};

/**
 * Punto de entrada: recibe contenido XML como string.
 * Retorna { invoice, raw } o lanza error si formato inválido.
 */
export function parseUblXml(xmlString) {
  if (!xmlString || typeof xmlString !== 'string') {
    throw new Error('XML vacío o inválido');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  // Validar parseo (compatible con xmldom y browser DOMParser)
  const parserErrors = doc.getElementsByTagName('parsererror');
  if (parserErrors.length > 0) {
    throw new Error('XML mal formado: ' + parserErrors[0].textContent.slice(0, 100));
  }
  if (!doc.documentElement || doc.documentElement.nodeName === 'parsererror') {
    throw new Error('XML mal formado o vacío');
  }

  // Caso 1: AttachedDocument con CDATA del Invoice anidado
  const attached = doc.getElementsByTagNameNS('*', 'AttachedDocument')[0];
  if (attached) {
    const cdata = doc.getElementsByTagNameNS('*', 'Description')[0];
    if (cdata && cdata.textContent.includes('<Invoice')) {
      return parseUblXml(cdata.textContent);
    }
  }

  // Caso 2: Invoice o CreditNote directo
  const invoice = doc.getElementsByTagNameNS('*', 'Invoice')[0];
  const creditNote = doc.getElementsByTagNameNS('*', 'CreditNote')[0];

  const root = invoice || creditNote || doc.documentElement;
  if (!root) {
    throw new Error('No se encontró elemento Invoice o CreditNote');
  }

  const isCreditNote = creditNote != null || root.localName === 'CreditNote';

  return parseInvoiceElement(root, isCreditNote);
}

function parseInvoiceElement(root, isCreditNote) {
  const get = (ns, name, parent = root) => {
    const els = parent.getElementsByTagNameNS(ns, name);
    return els.length > 0 ? els[0].textContent.trim() : '';
  };

  // Identificadores
  const invoiceNumber = get(NS.cbc, 'ID') || `XML-${Date.now()}`;
  const issueDate = get(NS.cbc, 'IssueDate');

  // Proveedor / Emisor (AccountingSupplierParty)
  const supplier = root.getElementsByTagNameNS(NS.cac, 'AccountingSupplierParty')[0];
  let vendorName = '';
  let vendorNit = '';
  if (supplier) {
    const partyName = supplier.getElementsByTagNameNS(NS.cac, 'PartyName')[0];
    if (partyName) {
      vendorName = get(NS.cbc, 'Name', partyName);
    }
    if (!vendorName) {
      const regName = supplier.getElementsByTagNameNS(NS.cac, 'PartyLegalEntity')[0];
      if (regName) vendorName = get(NS.cbc, 'RegistrationName', regName);
    }
    const partyId = supplier.getElementsByTagNameNS(NS.cac, 'PartyIdentification')[0];
    if (partyId) vendorNit = get(NS.cbc, 'ID', partyId);
  }
  vendorName = vendorName || 'Sin proveedor';

  // Totales (LegalMonetaryTotal o RequestedMonetaryTotal en notas)
  const totalGroup =
    root.getElementsByTagNameNS(NS.cac, 'LegalMonetaryTotal')[0] ||
    root.getElementsByTagNameNS(NS.cac, 'RequestedMonetaryTotal')[0];

  let baseAmount = 0;
  let totalAmount = 0;
  if (totalGroup) {
    baseAmount = Number(get(NS.cbc, 'LineExtensionAmount', totalGroup)) || 0;
    totalAmount = Number(get(NS.cbc, 'PayableAmount', totalGroup)) || 0;
  }

  // IVA — buscar TaxTotal con TaxSubtotal
  let ivaRate = 0;
  let ivaAmount = 0;
  const taxTotals = root.getElementsByTagNameNS(NS.cac, 'TaxTotal');
  for (const tt of taxTotals) {
    const subtotals = tt.getElementsByTagNameNS(NS.cac, 'TaxSubtotal');
    for (const st of subtotals) {
      const taxCategory = st.getElementsByTagNameNS(NS.cac, 'TaxCategory')[0];
      if (!taxCategory) continue;
      const taxScheme = taxCategory.getElementsByTagNameNS(NS.cac, 'TaxScheme')[0];
      const schemeId = taxScheme ? get(NS.cbc, 'ID', taxScheme) : '';
      // 01 = IVA según código DIAN
      if (schemeId === '01' || schemeId === 'IVA') {
        ivaAmount = Number(get(NS.cbc, 'TaxAmount', st)) || ivaAmount;
        ivaRate = Number(get(NS.cbc, 'Percent', taxCategory)) || ivaRate;
      }
    }
  }

  // Concepto: primera línea de InvoiceLine o CreditNoteLine
  const lineTag = isCreditNote ? 'CreditNoteLine' : 'InvoiceLine';
  const firstLine = root.getElementsByTagNameNS(NS.cac, lineTag)[0];
  let concept = '';
  if (firstLine) {
    const item = firstLine.getElementsByTagNameNS(NS.cac, 'Item')[0];
    if (item) {
      concept = get(NS.cbc, 'Description', item) || get(NS.cbc, 'Name', item);
    }
  }
  concept = concept || 'Sin concepto';

  // Construir invoice del esquema interno
  const parsed = {
    id: `ubl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: isCreditNote ? 'credit_note' : 'sale',
    invoice_number: invoiceNumber,
    date: issueDate || new Date().toISOString().split('T')[0],
    vendor_name: vendorName,
    vendor_nit: vendorNit,
    concept,
    base_amount: baseAmount,
    iva_rate: ivaRate || (ivaAmount > 0 ? 19 : 0),
    activity: 'servicios',
    city: 'bogota',
    sector: 'servicios',
    _source: 'ubl',
    _xml_total: totalAmount,
  };

  const taxes = calculateInvoiceTaxes(parsed);
  return { ...parsed, ...taxes };
}

/**
 * Parsea archivo XML File del input.
 */
export function parseUblFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const result = parseUblXml(e.target.result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo XML'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parsea múltiples archivos XML (Promise.allSettled).
 * Retorna { invoices, errors }.
 */
export async function parseMultipleUblFiles(files) {
  const results = await Promise.allSettled(Array.from(files).map(f => parseUblFile(f)));
  const invoices = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      invoices.push(r.value);
    } else {
      errors.push({ file: files[i].name, error: r.reason.message });
    }
  });
  return { invoices, errors };
}
