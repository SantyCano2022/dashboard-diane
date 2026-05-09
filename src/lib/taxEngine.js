/**
 * Motor Tributario Colombiano
 * Cálculos IVA, Retefuente, ReteICA, ReteIVA
 * Basado en normativa DIAN vigente 2025
 * UVT 2025 = $49,799 COP
 */

export const UVT_2025 = 49799;

// ============================================
// IVA — Impuesto al Valor Agregado
// ============================================
export const IVA_RATES = {
  general: 0.19,       // 19% - Tarifa general
  reduced: 0.05,       // 5% - Bienes específicos
  exempt: 0,           // 0% - Exentos
};

export function calculateIVA(baseAmount, rate = IVA_RATES.general) {
  return Math.round(baseAmount * rate);
}

// ============================================
// RETEFUENTE — Retención en la Fuente
// ============================================
export const RETEFUENTE_ACTIVITIES = {
  honorarios: { rate: 0.11, baseUVT: 0, label: 'Honorarios (11%)' },
  honorarios_declarante: { rate: 0.10, baseUVT: 0, label: 'Honorarios declarante (10%)' },
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
    industrial: 0.00414,     // 4.14‰
    comercial: 0.00414,      // 4.14‰
    servicios: 0.00966,      // 9.66‰
    financiero: 0.01104,     // 11.04‰
    consultoria: 0.00966,    // 9.66‰
  },
  medellin: {
    industrial: 0.004,
    comercial: 0.005,
    servicios: 0.007,
    financiero: 0.010,
    consultoria: 0.007,
  },
  cali: {
    industrial: 0.004,
    comercial: 0.005,
    servicios: 0.008,
    financiero: 0.010,
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
  // 15% del IVA facturado para grandes contribuyentes
  if (!isGranContribuyente) return 0;
  return Math.round(ivaAmount * 0.15);
}

// ============================================
// CÁLCULO COMPLETO DE UNA FACTURA
// ============================================
export function calculateInvoiceTaxes(invoice) {
  const base = Number(invoice.base_amount) || 0;
  const ivaRate = invoice.iva_rate !== undefined ? Number(invoice.iva_rate) / 100 : IVA_RATES.general;

  const iva = calculateIVA(base, ivaRate);
  const retefuente = calculateRetefuente(base, invoice.activity || 'servicios');
  const reteica = calculateReteICA(base, invoice.city || 'bogota', invoice.sector || 'servicios');
  const reteiva = calculateReteIVA(iva, invoice.gran_contribuyente || false);

  const total = base + iva - retefuente - reteica - reteiva;

  return {
    base_amount: base,
    iva_rate: ivaRate * 100,
    iva_amount: iva,
    retefuente_rate: (RETEFUENTE_ACTIVITIES[invoice.activity || 'servicios']?.rate || 0) * 100,
    retefuente_amount: retefuente,
    reteica_rate: ((RETEICA_RATES[invoice.city || 'bogota']?.[invoice.sector || 'servicios'] || 0) * 1000).toFixed(2),
    reteica_amount: reteica,
    reteiva_amount: reteiva,
    total,
  };
}

// ============================================
// RESUMEN POR PERÍODO
// ============================================
export function calculatePeriodSummary(invoices) {
  return invoices.reduce((acc, inv) => {
    const taxes = inv.iva_amount !== undefined ? inv : calculateInvoiceTaxes(inv);
    return {
      total_base: acc.total_base + (Number(taxes.base_amount) || 0),
      total_iva: acc.total_iva + (Number(taxes.iva_amount) || 0),
      total_retefuente: acc.total_retefuente + (Number(taxes.retefuente_amount) || 0),
      total_reteica: acc.total_reteica + (Number(taxes.reteica_amount) || 0),
      total_reteiva: acc.total_reteiva + (Number(taxes.reteiva_amount) || 0),
      total_invoices: acc.total_invoices + 1,
    };
  }, {
    total_base: 0, total_iva: 0, total_retefuente: 0,
    total_reteica: 0, total_reteiva: 0, total_invoices: 0,
  });
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
