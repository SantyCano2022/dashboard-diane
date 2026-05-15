import { describe, it, expect } from 'vitest';
import {
  UVT_2025,
  IVA_RATES,
  calculateIVA,
  calculateRetefuente,
  calculateReteICA,
  calculateReteIVA,
  calculateInvoiceTaxes,
  calculatePeriodSummary,
  formatCOP,
  RETEFUENTE_ACTIVITIES,
  RETEICA_RATES,
  INVOICE_TYPES,
  getInvoiceTypeMeta,
} from './taxEngine';

describe('UVT_2025', () => {
  it('vale 49799 según resolución DIAN 2024', () => {
    expect(UVT_2025).toBe(49799);
  });
});

describe('calculateIVA', () => {
  it('aplica 19% sobre base correctamente', () => {
    expect(calculateIVA(1_000_000, 0.19)).toBe(190_000);
  });

  it('aplica 5% tarifa reducida', () => {
    expect(calculateIVA(1_000_000, 0.05)).toBe(50_000);
  });

  it('retorna 0 para tarifa exenta', () => {
    expect(calculateIVA(1_000_000, 0)).toBe(0);
  });

  it('usa 19% por defecto si no se pasa tarifa', () => {
    expect(calculateIVA(100_000)).toBe(19_000);
  });

  it('redondea al peso más cercano', () => {
    expect(calculateIVA(1_234_567, 0.19)).toBe(Math.round(1_234_567 * 0.19));
  });

  it('IVA_RATES expone tarifas oficiales', () => {
    expect(IVA_RATES.general).toBe(0.19);
    expect(IVA_RATES.reduced).toBe(0.05);
    expect(IVA_RATES.exempt).toBe(0);
  });
});

describe('calculateRetefuente', () => {
  it('aplica 11% sobre honorarios sin umbral', () => {
    expect(calculateRetefuente(1_000_000, 'honorarios')).toBe(110_000);
  });

  it('aplica 4% sobre servicios cuando supera umbral 4 UVT', () => {
    const base = 5 * UVT_2025;
    expect(calculateRetefuente(base, 'servicios')).toBe(Math.round(base * 0.04));
  });

  it('retorna 0 si base < umbral 4 UVT para servicios', () => {
    const base = 3 * UVT_2025;
    expect(calculateRetefuente(base, 'servicios')).toBe(0);
  });

  it('aplica 2.5% sobre compras cuando supera 27 UVT', () => {
    const base = 30 * UVT_2025;
    expect(calculateRetefuente(base, 'compras')).toBe(Math.round(base * 0.025));
  });

  it('retorna 0 si compras < 27 UVT', () => {
    const base = 20 * UVT_2025;
    expect(calculateRetefuente(base, 'compras')).toBe(0);
  });

  it('retorna 0 para actividad desconocida', () => {
    expect(calculateRetefuente(1_000_000, 'inexistente')).toBe(0);
  });

  it('cubre todas las actividades definidas con tarifa positiva', () => {
    Object.keys(RETEFUENTE_ACTIVITIES).forEach(key => {
      const activity = RETEFUENTE_ACTIVITIES[key];
      const baseAlta = activity.baseUVT * UVT_2025 + 1_000_000;
      const result = calculateRetefuente(baseAlta, key);
      expect(result).toBeGreaterThanOrEqual(0);
      if (activity.rate > 0) {
        expect(result).toBe(Math.round(baseAlta * activity.rate));
      }
    });
  });
});

describe('calculateReteICA', () => {
  it('aplica tarifa Bogotá servicios (9.66 por mil)', () => {
    expect(calculateReteICA(1_000_000, 'bogota', 'servicios')).toBe(
      Math.round(1_000_000 * 0.00966)
    );
  });

  it('aplica tarifa Medellín servicios (7 por mil)', () => {
    expect(calculateReteICA(1_000_000, 'medellin', 'servicios')).toBe(7_000);
  });

  it('default ciudad bogota si no se pasa', () => {
    expect(calculateReteICA(1_000_000)).toBe(Math.round(1_000_000 * 0.00966));
  });

  it('default sector servicios si sector desconocido', () => {
    expect(calculateReteICA(1_000_000, 'bogota', 'inexistente')).toBe(
      Math.round(1_000_000 * 0.00966)
    );
  });

  it('cubre las 3 ciudades soportadas', () => {
    Object.keys(RETEICA_RATES).forEach(city => {
      expect(calculateReteICA(1_000_000, city, 'servicios')).toBeGreaterThan(0);
    });
  });
});

describe('calculateReteIVA', () => {
  it('retorna 0 si no es gran contribuyente', () => {
    expect(calculateReteIVA(100_000, false)).toBe(0);
  });

  it('aplica 15% del IVA si es gran contribuyente', () => {
    expect(calculateReteIVA(100_000, true)).toBe(15_000);
  });

  it('por defecto NO es gran contribuyente', () => {
    expect(calculateReteIVA(100_000)).toBe(0);
  });
});

describe('calculateInvoiceTaxes — facturas de venta', () => {
  it('calcula impuestos completos para venta típica (régimen común)', () => {
    const invoice = {
      type: 'sale',
      base_amount: 1_000_000,
      iva_rate: 19,
      activity: 'honorarios',
      city: 'bogota',
      sector: 'servicios',
    };
    const result = calculateInvoiceTaxes(invoice);
    expect(result.type).toBe('sale');
    expect(result.base_amount).toBe(1_000_000);
    expect(result.iva_amount).toBe(190_000);
    expect(result.retefuente_amount).toBe(110_000);
    expect(result.is_iva_descontable).toBe(false);
  });

  it('venta default type=sale si no se especifica', () => {
    const result = calculateInvoiceTaxes({ base_amount: 100_000, iva_rate: 19 });
    expect(result.type).toBe('sale');
    expect(result.iva_amount).toBe(19_000);
  });

  it('régimen simplificado NO cobra IVA en ventas', () => {
    const invoice = { type: 'sale', base_amount: 1_000_000, iva_rate: 19 };
    const result = calculateInvoiceTaxes(invoice, { companyTaxRegime: 'simplified' });
    expect(result.iva_amount).toBe(0);
    expect(result.iva_rate).toBe(0);
  });

  it('régimen común SÍ cobra IVA en ventas', () => {
    const invoice = { type: 'sale', base_amount: 1_000_000, iva_rate: 19 };
    const result = calculateInvoiceTaxes(invoice, { companyTaxRegime: 'common' });
    expect(result.iva_amount).toBe(190_000);
  });
});

describe('calculateInvoiceTaxes — facturas de compra', () => {
  it('marca IVA como descontable', () => {
    const invoice = { type: 'purchase', base_amount: 1_000_000, iva_rate: 19 };
    const result = calculateInvoiceTaxes(invoice);
    expect(result.type).toBe('purchase');
    expect(result.is_iva_descontable).toBe(true);
    expect(result.iva_amount).toBe(190_000);
  });

  it('régimen simplificado SÍ acepta IVA en compras (descontable)', () => {
    const invoice = { type: 'purchase', base_amount: 1_000_000, iva_rate: 19 };
    const result = calculateInvoiceTaxes(invoice, { companyTaxRegime: 'simplified' });
    expect(result.iva_amount).toBe(190_000);
  });
});

describe('calculateInvoiceTaxes — notas crédito', () => {
  it('invierte signo de base e impuestos', () => {
    const invoice = {
      type: 'credit_note',
      base_amount: 1_000_000,
      iva_rate: 19,
      activity: 'honorarios',
    };
    const result = calculateInvoiceTaxes(invoice);
    expect(result.base_amount).toBe(-1_000_000);
    expect(result.iva_amount).toBe(-190_000);
    expect(result.retefuente_amount).toBe(-110_000);
    expect(result.total).toBeLessThan(0);
  });

  it('no marca IVA descontable en nota crédito', () => {
    const invoice = { type: 'credit_note', base_amount: 1_000_000, iva_rate: 19 };
    const result = calculateInvoiceTaxes(invoice);
    expect(result.is_iva_descontable).toBe(false);
  });
});

describe('calculateInvoiceTaxes — varios', () => {
  it('aplica ReteIVA si gran_contribuyente true', () => {
    const invoice = {
      type: 'sale',
      base_amount: 1_000_000,
      iva_rate: 19,
      activity: 'honorarios',
      gran_contribuyente: true,
    };
    const result = calculateInvoiceTaxes(invoice);
    expect(result.reteiva_amount).toBe(Math.round(190_000 * 0.15));
  });

  it('factura exenta IVA produce iva_amount=0', () => {
    const invoice = { type: 'sale', base_amount: 500_000, iva_rate: 0, activity: 'servicios' };
    const result = calculateInvoiceTaxes(invoice);
    expect(result.iva_amount).toBe(0);
  });

  it('base 0 produce todos los impuestos en 0', () => {
    const result = calculateInvoiceTaxes({ base_amount: 0 });
    expect(result.iva_amount).toBe(0);
    expect(result.retefuente_amount).toBe(0);
    expect(result.reteica_amount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('total = base + iva - retefuente - reteica - reteiva (venta común)', () => {
    const invoice = {
      type: 'sale',
      base_amount: 10_000_000,
      iva_rate: 19,
      activity: 'consultoria',
      gran_contribuyente: true,
    };
    const r = calculateInvoiceTaxes(invoice);
    expect(r.total).toBe(
      r.base_amount + r.iva_amount - r.retefuente_amount - r.reteica_amount - r.reteiva_amount
    );
  });

  it('strings numéricos se convierten correctamente', () => {
    const result = calculateInvoiceTaxes({ base_amount: '1000000', iva_rate: '19' });
    expect(result.iva_amount).toBe(190_000);
  });
});

describe('calculatePeriodSummary — distinción ventas/compras', () => {
  it('separa IVA generado (ventas) de IVA descontable (compras)', () => {
    const invoices = [
      {
        type: 'sale',
        base_amount: 2_000_000,
        iva_amount: 380_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
      {
        type: 'purchase',
        base_amount: 1_000_000,
        iva_amount: 190_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
    ];
    const summary = calculatePeriodSummary(invoices);
    expect(summary.total_iva_generado).toBe(380_000);
    expect(summary.total_iva_descontable).toBe(190_000);
    expect(summary.iva_balance).toBe(190_000); // saldo a pagar
  });

  it('saldo IVA negativo si compras > ventas', () => {
    const invoices = [
      {
        type: 'sale',
        base_amount: 1_000_000,
        iva_amount: 190_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
      {
        type: 'purchase',
        base_amount: 5_000_000,
        iva_amount: 950_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
    ];
    const summary = calculatePeriodSummary(invoices);
    expect(summary.iva_balance).toBe(190_000 - 950_000); // saldo a favor
  });

  it('cuenta ventas, compras, y notas crédito por separado', () => {
    const invoices = [
      {
        type: 'sale',
        base_amount: 1_000_000,
        iva_amount: 190_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
      {
        type: 'sale',
        base_amount: 1_000_000,
        iva_amount: 190_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
      {
        type: 'purchase',
        base_amount: 500_000,
        iva_amount: 95_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
      {
        type: 'credit_note',
        base_amount: -200_000,
        iva_amount: -38_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
    ];
    const summary = calculatePeriodSummary(invoices);
    expect(summary.total_sales).toBe(2);
    expect(summary.total_purchases).toBe(1);
    expect(summary.total_credit_notes).toBe(1);
    expect(summary.total_invoices).toBe(4);
  });

  it('nota crédito reduce IVA generado neto', () => {
    const invoices = [
      {
        type: 'sale',
        base_amount: 1_000_000,
        iva_amount: 190_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
      {
        type: 'credit_note',
        base_amount: -200_000,
        iva_amount: -38_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
    ];
    const summary = calculatePeriodSummary(invoices);
    expect(summary.total_iva_generado).toBe(190_000 - 38_000);
  });

  it('retorna ceros si lista vacía', () => {
    const summary = calculatePeriodSummary([]);
    expect(summary.total_base).toBe(0);
    expect(summary.iva_balance).toBe(0);
    expect(summary.total_invoices).toBe(0);
  });

  it('mantiene compatibilidad: total_base = total_base_sales', () => {
    const invoices = [
      {
        type: 'sale',
        base_amount: 1_000_000,
        iva_amount: 190_000,
        retefuente_amount: 0,
        reteica_amount: 0,
        reteiva_amount: 0,
      },
    ];
    const summary = calculatePeriodSummary(invoices);
    expect(summary.total_base).toBe(summary.total_base_sales);
    expect(summary.total_iva).toBe(summary.total_iva_generado);
  });

  it('recalcula impuestos si factura no los tiene precalculados', () => {
    const invoices = [
      { type: 'sale', base_amount: 1_000_000, iva_rate: 19, activity: 'honorarios' },
    ];
    const summary = calculatePeriodSummary(invoices);
    expect(summary.total_iva_generado).toBe(190_000);
    expect(summary.total_retefuente).toBe(110_000);
  });
});

describe('INVOICE_TYPES y getInvoiceTypeMeta', () => {
  it('expone metadata para los 3 tipos', () => {
    expect(INVOICE_TYPES.sale.label).toBe('Venta');
    expect(INVOICE_TYPES.purchase.label).toBe('Compra');
    expect(INVOICE_TYPES.credit_note.label).toBe('Nota Crédito');
  });

  it('getInvoiceTypeMeta retorna meta del tipo', () => {
    expect(getInvoiceTypeMeta('purchase').short).toBe('C');
    expect(getInvoiceTypeMeta('sale').short).toBe('V');
  });

  it('default a sale si tipo desconocido', () => {
    expect(getInvoiceTypeMeta('inexistente').label).toBe('Venta');
  });
});

describe('formatCOP', () => {
  it('formatea pesos colombianos sin decimales', () => {
    const result = formatCOP(1_000_000);
    expect(result).toMatch(/1\D000\D000/);
    expect(result).toContain('$');
  });

  it('formatea cero correctamente', () => {
    expect(formatCOP(0)).toContain('0');
  });

  it('redondea decimales', () => {
    const result = formatCOP(1234.7);
    expect(result).toContain('1.235');
  });
});
