import { faker } from '@faker-js/faker/locale/es';
import { calculateInvoiceTaxes } from './taxEngine';

/**
 * Datos demo localizados Colombia (es_CO).
 * @faker-js/faker no incluye locale `es_CO`, así que usamos `es` (base)
 * + listas custom de empresas, ciudades y conceptos colombianos.
 */

const CO_COMPANY_SUFFIXES = ['SAS', 'SA', 'LTDA', 'EU', '& CIA SAS'];
const CO_COMPANY_BASES = [
  'Tecnologías',
  'Soluciones',
  'Servicios',
  'Constructora',
  'Distribuidora',
  'Comercializadora',
  'Consultores',
  'Ingenieros',
  'Logística',
  'Inversiones',
  'Suministros',
  'Asesores',
  'Grupo',
  'Industrias',
  'Innovación',
];
const CO_COMPANY_NAMES = [
  'Andina',
  'Bolívar',
  'Cundinamarca',
  'Pacífico',
  'Caribe',
  'Sabana',
  'Aburrá',
  'Magdalena',
  'Tequendama',
  'Tayrona',
  'Eldorado',
  'Bacatá',
  'Cafetera',
  'Llanera',
  'Boyacense',
];
const CO_CITIES = [
  { key: 'bogota', name: 'Bogotá D.C.' },
  { key: 'medellin', name: 'Medellín' },
  { key: 'cali', name: 'Cali' },
];

const CONCEPTS = [
  { concept: 'Servicios de consultoría empresarial', activity: 'consultoria' },
  { concept: 'Honorarios por asesoría jurídica', activity: 'honorarios' },
  { concept: 'Arrendamiento oficina comercial', activity: 'arrendamiento_inmuebles' },
  { concept: 'Desarrollo de software a la medida', activity: 'software' },
  { concept: 'Servicios de contabilidad', activity: 'servicios' },
  { concept: 'Comisión por intermediación comercial', activity: 'comisiones' },
  { concept: 'Transporte de mercancías', activity: 'transporte_carga' },
  { concept: 'Servicios de publicidad digital', activity: 'servicios' },
  { concept: 'Mantenimiento equipos de cómputo', activity: 'servicios' },
  { concept: 'Licencia plataforma cloud', activity: 'software' },
  { concept: 'Servicio de vigilancia y seguridad', activity: 'servicios' },
  { concept: 'Suministro de papelería y útiles', activity: 'compras' },
  { concept: 'Honorarios auditoría financiera', activity: 'honorarios' },
  { concept: 'Arrendamiento de vehículo corporativo', activity: 'arrendamiento_muebles' },
  { concept: 'Servicio de aseo y limpieza', activity: 'servicios' },
  { concept: 'Capacitación corporativa', activity: 'servicios' },
  { concept: 'Hosting y dominios', activity: 'software' },
];

const IVA_OPTIONS = [19, 19, 19, 5, 0]; // ponderado al 19%

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomCompanyName() {
  // 70% combinación Base + Nombre + Sufijo, 30% nombre genérico via Faker
  if (Math.random() < 0.7) {
    return `${pick(CO_COMPANY_BASES)} ${pick(CO_COMPANY_NAMES)} ${pick(CO_COMPANY_SUFFIXES)}`;
  }
  return `${faker.company.name()} ${pick(CO_COMPANY_SUFFIXES)}`;
}

function randomDateInMonth(monthsAgo) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  // día aleatorio 1-28 dentro del mes
  d.setDate(Math.floor(Math.random() * 28) + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Genera 50 facturas distribuidas en los últimos 6 meses
 * (~8-9 facturas por mes, garantiza gráficas no vacías).
 */
/**
 * Genera count facturas distribuidas en 6 meses con mix realista:
 *  - ~60% ventas (sale)
 *  - ~30% compras (purchase)
 *  - ~10% notas crédito (credit_note)
 */
export function generateDemoInvoices(count = 50, companyId = 'demo-company-1') {
  const invoices = [];
  const stamp = Date.now();

  for (let i = 0; i < count; i++) {
    const monthsAgo = i % 6;
    const conceptData = pick(CONCEPTS);
    const cityData = pick(CO_CITIES);
    const base = Math.round((Math.random() * 14_500_000 + 500_000) / 1000) * 1000;
    const ivaRate = pick(IVA_OPTIONS);

    // Distribución por tipo
    const r = Math.random();
    let type, prefix;
    if (r < 0.6) {
      type = 'sale';
      prefix = 'FV';
    } else if (r < 0.9) {
      type = 'purchase';
      prefix = 'FC';
    } else {
      type = 'credit_note';
      prefix = 'NC';
    }

    const invoice = {
      id: `demo-${companyId}-${i}-${stamp}`,
      company_id: companyId,
      type,
      invoice_number: `${prefix}-${String(i + 1).padStart(4, '0')}`,
      date: randomDateInMonth(monthsAgo),
      vendor_name: randomCompanyName(),
      vendor_nit: `${faker.number.int({ min: 800000000, max: 999999998 })}`,
      concept: conceptData.concept,
      base_amount: base,
      iva_rate: ivaRate,
      activity: conceptData.activity,
      city: cityData.key,
      city_name: cityData.name,
      sector: 'servicios',
    };

    const taxes = calculateInvoiceTaxes(invoice);
    invoices.push({ ...invoice, ...taxes });
  }

  return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function generateDemoCompany() {
  return {
    id: 'demo-company-1',
    name: 'Demo Tech SAS',
    nit: '999.999.999-0',
    tax_regime: 'common',
    city: 'Bogotá D.C.',
    created_at: new Date().toISOString(),
  };
}

/**
 * Calendario tributario DIAN 2025 — fechas reales según
 * Decreto 2229 de 2023 (vencimientos 2025) por último dígito de NIT.
 * Cobertura: IVA bimestral (6 períodos), Retención mensual (12 meses),
 * Renta personas jurídicas, Información Exógena, ICA Bogotá.
 */
export function getDIANCalendar2025() {
  const cal = [];

  // ─── IVA BIMESTRAL 2025 ─────────────────────────────────
  // Bimestre Ene-Feb → vence marzo
  const ivaJanFeb = [
    '2025-03-11',
    '2025-03-12',
    '2025-03-13',
    '2025-03-14',
    '2025-03-17',
    '2025-03-18',
    '2025-03-19',
    '2025-03-20',
    '2025-03-21',
    '2025-03-24',
  ];
  ivaJanFeb.forEach((d, i) =>
    cal.push({
      obligation: 'Declaración IVA Bimestral',
      nit_last_digit: i + 1 > 9 ? 0 : i + 1,
      due_date: d,
      description: 'Bimestre Ene-Feb 2025',
    })
  );

  // Bimestre Mar-Abr → vence mayo
  const ivaMarApr = [
    '2025-05-13',
    '2025-05-14',
    '2025-05-15',
    '2025-05-16',
    '2025-05-19',
    '2025-05-20',
    '2025-05-21',
    '2025-05-22',
    '2025-05-23',
    '2025-05-26',
  ];
  ivaMarApr.forEach((d, i) =>
    cal.push({
      obligation: 'Declaración IVA Bimestral',
      nit_last_digit: i + 1 > 9 ? 0 : i + 1,
      due_date: d,
      description: 'Bimestre Mar-Abr 2025',
    })
  );

  // Bimestre May-Jun → vence julio
  const ivaMayJun = [
    '2025-07-08',
    '2025-07-09',
    '2025-07-10',
    '2025-07-11',
    '2025-07-14',
    '2025-07-15',
    '2025-07-16',
    '2025-07-17',
    '2025-07-18',
    '2025-07-21',
  ];
  ivaMayJun.forEach((d, i) =>
    cal.push({
      obligation: 'Declaración IVA Bimestral',
      nit_last_digit: i + 1 > 9 ? 0 : i + 1,
      due_date: d,
      description: 'Bimestre May-Jun 2025',
    })
  );

  // ─── RETENCIÓN EN LA FUENTE — MENSUAL ───────────────────
  const retencionMeses = [
    {
      d: [
        '2025-02-11',
        '2025-02-12',
        '2025-02-13',
        '2025-02-14',
        '2025-02-17',
        '2025-02-18',
        '2025-02-19',
        '2025-02-20',
        '2025-02-21',
        '2025-02-24',
      ],
      desc: 'Enero 2025',
    },
    {
      d: [
        '2025-03-11',
        '2025-03-12',
        '2025-03-13',
        '2025-03-14',
        '2025-03-17',
        '2025-03-18',
        '2025-03-19',
        '2025-03-20',
        '2025-03-21',
        '2025-03-24',
      ],
      desc: 'Febrero 2025',
    },
    {
      d: [
        '2025-04-09',
        '2025-04-10',
        '2025-04-11',
        '2025-04-14',
        '2025-04-15',
        '2025-04-16',
        '2025-04-21',
        '2025-04-22',
        '2025-04-23',
        '2025-04-24',
      ],
      desc: 'Marzo 2025',
    },
    {
      d: [
        '2025-05-13',
        '2025-05-14',
        '2025-05-15',
        '2025-05-16',
        '2025-05-19',
        '2025-05-20',
        '2025-05-21',
        '2025-05-22',
        '2025-05-23',
        '2025-05-26',
      ],
      desc: 'Abril 2025',
    },
    {
      d: [
        '2025-06-10',
        '2025-06-11',
        '2025-06-12',
        '2025-06-13',
        '2025-06-16',
        '2025-06-17',
        '2025-06-18',
        '2025-06-19',
        '2025-06-20',
        '2025-06-24',
      ],
      desc: 'Mayo 2025',
    },
    {
      d: [
        '2025-07-08',
        '2025-07-09',
        '2025-07-10',
        '2025-07-11',
        '2025-07-14',
        '2025-07-15',
        '2025-07-16',
        '2025-07-17',
        '2025-07-18',
        '2025-07-21',
      ],
      desc: 'Junio 2025',
    },
  ];
  retencionMeses.forEach(({ d, desc }) => {
    d.forEach((dd, i) =>
      cal.push({
        obligation: 'Retención en la Fuente',
        nit_last_digit: i + 1 > 9 ? 0 : i + 1,
        due_date: dd,
        description: desc,
      })
    );
  });

  // ─── DECLARACIÓN DE RENTA — PERSONAS JURÍDICAS ──────────
  const renta = [
    '2025-05-13',
    '2025-05-14',
    '2025-05-15',
    '2025-05-16',
    '2025-05-19',
    '2025-05-20',
    '2025-05-21',
    '2025-05-22',
    '2025-05-23',
    '2025-05-26',
  ];
  renta.forEach((d, i) =>
    cal.push({
      obligation: 'Declaración de Renta',
      nit_last_digit: i + 1 > 9 ? 0 : i + 1,
      due_date: d,
      description: 'Año gravable 2024 — Personas Jurídicas',
    })
  );

  // ─── INFORMACIÓN EXÓGENA 2024 ───────────────────────────
  const exogena = [
    '2025-05-09',
    '2025-05-12',
    '2025-05-13',
    '2025-05-14',
    '2025-05-15',
    '2025-05-16',
    '2025-05-19',
    '2025-05-20',
    '2025-05-21',
    '2025-05-22',
  ];
  exogena.forEach((d, i) =>
    cal.push({
      obligation: 'Información Exógena',
      nit_last_digit: i + 1 > 9 ? 0 : i + 1,
      due_date: d,
      description: 'Reporte año 2024',
    })
  );

  // ─── ICA BOGOTÁ — BIMESTRAL 2025 ────────────────────────
  cal.push({
    obligation: 'Declaración ICA Bogotá',
    nit_last_digit: 0,
    due_date: '2025-03-21',
    description: 'Bimestre Ene-Feb 2025',
  });
  cal.push({
    obligation: 'Declaración ICA Bogotá',
    nit_last_digit: 0,
    due_date: '2025-05-23',
    description: 'Bimestre Mar-Abr 2025',
  });
  cal.push({
    obligation: 'Declaración ICA Bogotá',
    nit_last_digit: 0,
    due_date: '2025-07-18',
    description: 'Bimestre May-Jun 2025',
  });

  return cal.sort((a, b) => a.due_date.localeCompare(b.due_date));
}
