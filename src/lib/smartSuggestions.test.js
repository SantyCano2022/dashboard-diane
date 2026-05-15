import { describe, it, expect } from 'vitest';
import { suggestActivity, detectDuplicates, applyActivitySuggestions } from './smartSuggestions';

describe('suggestActivity', () => {
  it('detecta honorarios desde "Honorarios contables"', () => {
    const r = suggestActivity('Honorarios contables del mes');
    expect(r.activity).toBe('honorarios');
    expect(r.confidence).not.toBe(null);
  });

  it('detecta software desde "Licencia SaaS Cloud"', () => {
    const r = suggestActivity('Licencia SaaS Cloud anual');
    expect(r.activity).toBe('software');
  });

  it('detecta arrendamiento_inmuebles desde "Arrendamiento oficina"', () => {
    const r = suggestActivity('Arrendamiento oficina principal');
    expect(r.activity).toBe('arrendamiento_inmuebles');
  });

  it('detecta arrendamiento_muebles desde "Alquiler vehiculo corporativo"', () => {
    const r = suggestActivity('Alquiler vehiculo corporativo enero');
    expect(r.activity).toBe('arrendamiento_muebles');
  });

  it('detecta transporte_carga desde "Flete Bogota Medellin"', () => {
    const r = suggestActivity('Flete Bogota Medellin');
    expect(r.activity).toBe('transporte_carga');
  });

  it('detecta comisiones desde "Comisión por intermediación"', () => {
    const r = suggestActivity('Comisión por intermediación comercial');
    expect(r.activity).toBe('comisiones');
  });

  it('default servicios para texto genérico', () => {
    const r = suggestActivity('Servicio mensual');
    expect(r.activity).toBe('servicios');
  });

  it('retorna current si user ya puso actividad no-default válida', () => {
    const r = suggestActivity('Honorarios contables', 'consultoria');
    expect(r.activity).toBe('consultoria');
    expect(r.confidence).toBe(null);
  });

  it('texto vacío retorna default', () => {
    expect(suggestActivity('').activity).toBe('servicios');
    expect(suggestActivity(null).activity).toBe('servicios');
  });
});

describe('detectDuplicates', () => {
  const existing = [
    { invoice_number: 'FV-001', vendor_nit: '900123456', date: '2025-01-15' },
    { invoice_number: 'FV-002', vendor_nit: '900654321', date: '2025-01-20' },
  ];

  it('detecta duplicado contra existentes', () => {
    const { duplicates, unique } = detectDuplicates(
      [{ invoice_number: 'FV-001', vendor_nit: '900123456', date: '2025-01-15', concept: 'X' }],
      existing
    );
    expect(duplicates.length).toBe(1);
    expect(unique.length).toBe(0);
  });

  it('detecta duplicados dentro del mismo batch', () => {
    const { duplicates, unique } = detectDuplicates(
      [
        { invoice_number: 'FV-100', vendor_nit: '900', date: '2025-02-01' },
        { invoice_number: 'FV-100', vendor_nit: '900', date: '2025-02-01' },
      ],
      []
    );
    expect(duplicates.length).toBe(1);
    expect(unique.length).toBe(1);
  });

  it('NIT diferente, mismo número → NO duplicado', () => {
    const { duplicates, unique } = detectDuplicates(
      [{ invoice_number: 'FV-001', vendor_nit: '999999999', date: '2025-01-15' }],
      existing
    );
    expect(duplicates.length).toBe(0);
    expect(unique.length).toBe(1);
  });

  it('fecha diferente, mismo número y NIT → NO duplicado', () => {
    const { duplicates, unique } = detectDuplicates(
      [{ invoice_number: 'FV-001', vendor_nit: '900123456', date: '2025-02-15' }],
      existing
    );
    expect(duplicates.length).toBe(0);
    expect(unique.length).toBe(1);
  });

  it('factura sin invoice_number o date → no se considera duplicada', () => {
    const { unique } = detectDuplicates(
      [{ vendor_nit: '900', concept: 'sin numero ni fecha' }],
      existing
    );
    expect(unique.length).toBe(1);
  });

  it('fallback a vendor_name si no hay vendor_nit', () => {
    const existingWithName = [
      { invoice_number: 'X-1', vendor_name: 'ACME SAS', date: '2025-03-01' },
    ];
    const { duplicates } = detectDuplicates(
      [{ invoice_number: 'X-1', vendor_name: 'ACME SAS', date: '2025-03-01' }],
      existingWithName
    );
    expect(duplicates.length).toBe(1);
  });
});

describe('applyActivitySuggestions', () => {
  it('aplica sugerencia con _suggested flag', () => {
    const invoices = [{ concept: 'Honorarios contables', activity: 'servicios' }];
    const r = applyActivitySuggestions(invoices);
    expect(r[0].activity).toBe('honorarios');
    expect(r[0]._suggested).toBe(true);
  });

  it('no modifica si activity ya está bien asignada', () => {
    const invoices = [{ concept: 'Honorarios contables', activity: 'consultoria' }];
    const r = applyActivitySuggestions(invoices);
    expect(r[0].activity).toBe('consultoria');
    expect(r[0]._suggested).toBeUndefined();
  });

  it('no modifica si confidence es low', () => {
    const invoices = [{ concept: 'Pago varios', activity: 'servicios' }];
    const r = applyActivitySuggestions(invoices);
    expect(r[0]._suggested).toBeUndefined();
  });
});
