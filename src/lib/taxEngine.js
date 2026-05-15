/**
 * Motor Tributario Colombiano
 * Cálculos IVA, Retefuente, ReteICA, ReteIVA
 * Basado en normativa DIAN vigente 2025
 * UVT 2025 = $49,799 COP
 *
 * Tipos de factura:
 *  - 'sale'        → factura de venta (IVA generado)
 *  - 'purchase'    → factura de compra (IVA descontable)
 *  - 'credit_note' → nota crédito (resta de venta o compra)
 *
 * Régimen:
 *  - 'common'      → cobra IVA en ventas
 *  - 'simplified'  → NO cobra IVA en ventas (decreto 1625/2016)
 */

export const UVT_2025 = 49799;

// ============================================
// IVA — Impuesto al Valor Agregado
// ============================================
export const IVA_RATES = {
  general: 0.19, // 19% - Tarifa general
  reduced: 0.05, // 5% - Bienes específicos
  exempt: 0, // 0% - Exentos
};

export function calculateIVA(baseAmount, rate = IVA_RATES.general) {
  return Math.round(baseAmount * rate);
}

// ============================================
// RETEFUENTE — Retención en la Fuente
// ============================================
export const RETEFUENTE_ACTIVITIES = {
  honorarios: { rate: 0.11, baseUVT: 0, label: 'Honorarios (11%)' },
  honorarios_declarante: { rate: 0.1, baseUVT: 0, label: 'Honorarios declarante (10%)' },
  servicios: { rate: 0.04, baseUVT: 4, label: 'Servicios generales (4%)' },
  servicios_declarante: { rate: 0.06, baseUVT: 4, label: 'Servicios declarante (6%)' },
  compras: { rate: 0.025, baseUVT: 27, label: 'Compras generales (2.5%)' },
  arrendamiento_inmuebles: { rate: 0.035, baseUVT: 27, label: 'Arrend. inmuebles (3.5%)' },
  arrendamiento_muebles: { rate: 0.04, baseUVT: 0, label: 'Arrend. muebles (4%)' },
  comisiones: { rate: 0.11, baseUVT: 0, label: 'Comisiones (11%)' },
  consultoria: { rate: 0.11, baseUVT: 0, label: 'Consultoría (11%)' },
  transporte_carga: { rate: 0.01, baseUVT: 4, label: 'Transporte carga (1%)' },
  transporte_pasajeros: { rate: 0.035, baseUVT: 27, label: 'Transporte pasajeros (3.5%)' },
  software: { rate: 0.035, baseUVT: 0, label: 'Licencias software (3.5%)' },
};

export function calculateRetefuente(baseAmount, activityKey = 'servicios') {
  const activity = RETEFUENTE_ACTIVITIES[activityKey];
  if (!activity) return 0;

  const threshold = activity.baseUVT * UVT_2025;
  if (baseAmount < threshold) return 0;

  return Math.round(baseAmount * activity.rate);
}

// ============================================
// RETEICA — Retención de Industria y Comercio
// ============================================
export const RETEICA_RATES = {
  bogota: {
    industrial: 0.00414, // 4.14‰
    comercial: 0.00414, // 4.14‰
    servicios: 0.00966, // 9.66‰
    financiero: 0.01104, // 11.04‰
    consultoria: 0.00966, // 9.66‰
  },
  medellin: {
    industrial: 0.004,
    comercial: 0.005,
    servicios: 0.007,
    financiero: 0.01,
    consultoria: 0.007,
  },
  cali: {
    industrial: 0.004,
    comercial: 0.005,
    servicios: 0.008,
    financiero: 0.01,
    consultoria: 0.008,
  },
};

export function calculateReteICA(baseAmount, city = 'bogota', sector = 'servicios') {
  const cityRates = RETEICA_RATES[city] || RETEICA_RATES.bogota;
  const rate = cityRates[sector] || cityRates.servicios;
  return Math.round(baseAmount * rate);
}

// ============================================
// RETEIVA — Retención de IVA
// ============================================
export function calculateReteIVA(ivaAmount, isGranContribuyente = false) {
  if (!isGranContribuyente) return 0;
  return Math.round(ivaAmount * 0.15);
}

// ============================================
// CÁLCULO COMPLETO DE UNA FACTURA
// ============================================
/**
 * Calcula impuestos completos de una factura.
 *
 * @param {Object} invoice — datos de entrada
 * @param {Object} [options]
 * @param {string} [options.companyTaxRegime='common'] — régimen tributario de la empresa emisora
 *   ('common' = cobra IVA; 'simplified' = no cobra IVA en ventas)
 *
 * Las facturas de venta de empresas en régimen simplificado tienen IVA = 0
 * sin importar la tarifa. Las compras siempre tienen IVA si lo trae el proveedor
 * (ese IVA es descontable independiente del régimen del comprador).
 */
export function calculateInvoiceTaxes(invoice, options = {}) {
  const { companyTaxRegime = 'common' } = options;
  const type = invoice.type || 'sale';
  const isCreditNote = type === 'credit_note';
  const isPurchase = type === 'purchase';
  const isSale = type === 'sale';

  const base = Number(invoice.base_amount) || 0;
  const ivaRate =
    invoice.iva_rate !== undefined ? Number(invoice.iva_rate) / 100 : IVA_RATES.general;

  // Régimen simplificado no cobra IVA en sus ventas
  const effectiveIvaRate = isSale && companyTaxRegime === 'simplified' ? 0 : ivaRate;

  const iva = calculateIVA(base, effectiveIvaRate);
  const retefuente = calculateRetefuente(base, invoice.activity || 'servicios');
  const reteica = calculateReteICA(base, invoice.city || 'bogota', invoice.sector || 'servicios');
  const reteiva = calculateReteIVA(iva, invoice.gran_contribuyente || false);

  const total = base + iva - retefuente - reteica - reteiva;

  // Multiplicador por tipo: nota crédito invierte signos
  const sign = isCreditNote ? -1 : 1;

  return {
    type,
    base_amount: base * sign,
    iva_rate: effectiveIvaRate * 100,
    iva_amount: iva * sign,
    retefuente_rate: (RETEFUENTE_ACTIVITIES[invoice.activity || 'servicios']?.rate || 0) * 100,
    retefuente_amount: retefuente * sign,
    reteica_rate: (
      (RETEICA_RATES[invoice.city || 'bogota']?.[invoice.sector || 'servicios'] || 0) * 1000
    ).toFixed(2),
    reteica_amount: reteica * sign,
    reteiva_amount: reteiva * sign,
    total: total * sign,
    // Para compras, el IVA es descontable (no generado)
    is_iva_descontable: isPurchase && !isCreditNote,
  };
}

// ============================================
// RESUMEN POR PERÍODO (con distinción ventas/compras)
// ============================================
/**
 * Calcula resumen agregado de un conjunto de facturas.
 *
 * Distingue ventas (IVA generado) de compras (IVA descontable).
 * El saldo IVA real = IVA generado − IVA descontable.
 */
export function calculatePeriodSummary(invoices) {
  const acc = {
    total_base_sales: 0,
    total_base_purchases: 0,
    total_base: 0, // compatibilidad: solo ventas para no romper UI antigua
    total_iva_generado: 0,
    total_iva_descontable: 0,
    total_iva: 0, // compatibilidad: IVA generado
    iva_balance: 0, // saldo: generado − descontable
    total_retefuente: 0,
    total_reteica: 0,
    total_reteiva: 0,
    total_invoices: 0,
    total_sales: 0,
    total_purchases: 0,
    total_credit_notes: 0,
  };

  invoices.forEach(inv => {
    const type = inv.type || 'sale';
    const taxes = inv.iva_amount !== undefined ? inv : calculateInvoiceTaxes(inv);
    const base = Number(taxes.base_amount) || 0;
    const iva = Number(taxes.iva_amount) || 0;
    const retefuente = Number(taxes.retefuente_amount) || 0;
    const reteica = Number(taxes.reteica_amount) || 0;
    const reteiva = Number(taxes.reteiva_amount) || 0;

    if (type === 'purchase') {
      acc.total_base_purchases += Math.abs(base);
      acc.total_iva_descontable += Math.abs(iva);
      acc.total_purchases += 1;
    } else if (type === 'credit_note') {
      // Nota crédito: ya tiene signo negativo en base/iva
      acc.total_base_sales += base; // negativo
      acc.total_iva_generado += iva; // negativo
      acc.total_credit_notes += 1;
    } else {
      // Venta normal
      acc.total_base_sales += base;
      acc.total_iva_generado += iva;
      acc.total_sales += 1;
    }

    // Retenciones aplican siempre (con signo)
    acc.total_retefuente += retefuente;
    acc.total_reteica += reteica;
    acc.total_reteiva += reteiva;
    acc.total_invoices += 1;
  });

  // Compatibilidad con UI antigua
  acc.total_base = acc.total_base_sales;
  acc.total_iva = acc.total_iva_generado;
  acc.iva_balance = acc.total_iva_generado - acc.total_iva_descontable;

  return acc;
}

// ============================================
// FORMATEO MONEDA COLOMBIANA
// ============================================
export function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// LABELS / METADATA TIPOS
// ============================================
export const INVOICE_TYPES = {
  sale: { label: 'Venta', short: 'V', color: '#047857', bg: '#d1fae5' },
  purchase: { label: 'Compra', short: 'C', color: '#1e40af', bg: '#dbeafe' },
  credit_note: { label: 'Nota Crédito', short: 'NC', color: '#b45309', bg: '#fef3c7' },
};

export function getInvoiceTypeMeta(type) {
  return INVOICE_TYPES[type] || INVOICE_TYPES.sale;
}
