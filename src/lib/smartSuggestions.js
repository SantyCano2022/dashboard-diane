/**
 * Sugerencias inteligentes para facturas:
 *  - Auto-detección de actividad de Retefuente desde texto (concept/vendor)
 *  - Detección de facturas duplicadas
 */

import { RETEFUENTE_ACTIVITIES } from './taxEngine';

// Mapeo keyword → activity. Orden importa: más específicos primero.
const ACTIVITY_KEYWORDS = [
  // Honorarios
  {
    activity: 'honorarios',
    patterns: [
      'honorario',
      'consultor',
      'abogad',
      'asesor jurid',
      'asesor legal',
      'auditor',
      'contador',
      'profesional independ',
    ],
  },
  // Consultoría (subset honorarios técnicos)
  {
    activity: 'consultoria',
    patterns: ['consultoria', 'consultoría', 'asesoría empresarial', 'asesoria empresarial'],
  },
  // Software
  {
    activity: 'software',
    patterns: [
      'software',
      'licencia',
      'saas',
      'subscripcion',
      'suscripción',
      'cloud',
      'hosting',
      'servidor',
      'desarrollo de programa',
      'aplicacion movil',
      'app movil',
    ],
  },
  // Comisiones
  {
    activity: 'comisiones',
    patterns: ['comision', 'comisión', 'intermediacion', 'intermediación', 'corretaje'],
  },
  // Arrendamiento inmuebles
  {
    activity: 'arrendamiento_inmuebles',
    patterns: [
      'arrendamiento de oficina',
      'arrendamiento oficina',
      'alquiler oficina',
      'arrendamiento local',
      'alquiler local',
      'arrendamiento bodega',
      'arrendamiento inmueble',
      'alquiler inmueble',
      'arriendo',
    ],
  },
  // Arrendamiento muebles (vehículos, equipos)
  {
    activity: 'arrendamiento_muebles',
    patterns: [
      'arrendamiento de vehiculo',
      'arrendamiento vehiculo',
      'alquiler vehiculo',
      'arrendamiento equipo',
      'alquiler equipo',
      'leasing',
    ],
  },
  // Transporte
  {
    activity: 'transporte_carga',
    patterns: [
      'transporte de carga',
      'transporte carga',
      'transporte mercancia',
      'transporte mercancía',
      'flete',
      'mensajería',
      'mensajeria',
      'envio',
      'envío',
      'logistica',
      'logística',
    ],
  },
  {
    activity: 'transporte_pasajeros',
    patterns: [
      'transporte pasajero',
      'taxi',
      'uber',
      'transporte ejecutivo',
      'transporte personal',
    ],
  },
  // Servicios generales (catch-all)
  {
    activity: 'servicios',
    patterns: [
      'servicio',
      'mantenimiento',
      'reparacion',
      'reparación',
      'limpieza',
      'aseo',
      'vigilancia',
      'seguridad',
      'capacitacion',
      'capacitación',
      'publicidad',
      'marketing',
      'diseño',
      'instalacion',
      'instalación',
    ],
  },
  // Compras
  {
    activity: 'compras',
    patterns: [
      'compra',
      'suministro',
      'papeleria',
      'papelería',
      'utiles',
      'útiles',
      'insumo',
      'material',
      'producto',
      'mercancia',
      'mercancía',
      'venta de',
    ],
  },
];

/**
 * Sugiere actividad de Retefuente basada en texto libre (concept).
 * Retorna { activity, confidence } donde confidence es 'high' | 'medium' | 'low' | null.
 *
 * Si current ya es válido y no es 'servicios' (default), respeta lo dado.
 */
export function suggestActivity(text, current = null) {
  if (!text) return { activity: current || 'servicios', confidence: null };

  // Si user ya puso algo no-default y válido, no override
  if (current && current !== 'servicios' && RETEFUENTE_ACTIVITIES[current]) {
    return { activity: current, confidence: null };
  }

  const normalized = String(text).toLowerCase().trim();

  for (const rule of ACTIVITY_KEYWORDS) {
    for (const pattern of rule.patterns) {
      if (normalized.includes(pattern)) {
        // Match más específico (>10 chars) = high confidence
        const confidence = pattern.length >= 10 ? 'high' : 'medium';
        return { activity: rule.activity, confidence };
      }
    }
  }

  return { activity: current || 'servicios', confidence: 'low' };
}

/**
 * Detecta facturas duplicadas comparando contra un set existente.
 * Considera duplicado si coincide: invoice_number + vendor_nit (o vendor_name) + date.
 *
 * @param {Array} newInvoices facturas a importar
 * @param {Array} existingInvoices facturas ya en el sistema
 * @returns { duplicates, unique } arrays separados
 */
export function detectDuplicates(newInvoices, existingInvoices = []) {
  // Index existentes por clave compuesta
  const existingIndex = new Set();
  existingInvoices.forEach(inv => {
    const key = duplicateKey(inv);
    if (key) existingIndex.add(key);
  });

  // También verificar duplicados DENTRO del lote nuevo
  const seenInBatch = new Set();
  const duplicates = [];
  const unique = [];

  newInvoices.forEach(inv => {
    const key = duplicateKey(inv);
    if (!key) {
      unique.push(inv);
      return;
    }
    if (existingIndex.has(key) || seenInBatch.has(key)) {
      duplicates.push(inv);
    } else {
      seenInBatch.add(key);
      unique.push(inv);
    }
  });

  return { duplicates, unique };
}

function duplicateKey(invoice) {
  const num = (invoice.invoice_number || '').trim().toLowerCase();
  const vendorIdent = (invoice.vendor_nit || invoice.vendor_name || '').trim().toLowerCase();
  const date = invoice.date || '';
  if (!num || !date) return null;
  return `${num}|${vendorIdent}|${date}`;
}

/**
 * Aplica auto-sugerencia de actividad a array de facturas.
 * Solo modifica facturas donde activity === 'servicios' (default) o vacío.
 */
export function applyActivitySuggestions(invoices) {
  return invoices.map(inv => {
    const { activity, confidence } = suggestActivity(inv.concept, inv.activity);
    if (confidence === 'high' || confidence === 'medium') {
      return { ...inv, activity, _suggested: true };
    }
    return inv;
  });
}
