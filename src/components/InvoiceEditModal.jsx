import { useState } from 'react';
import {
  calculateInvoiceTaxes,
  formatCOP,
  RETEFUENTE_ACTIVITIES,
  RETEICA_RATES,
  INVOICE_TYPES,
} from '../lib/taxEngine';
import { useApp } from '../contexts/AppContext';
import { X, Save } from 'lucide-react';

const ACTIVITIES = Object.entries(RETEFUENTE_ACTIVITIES).map(([key, v]) => ({
  key,
  label: v.label,
}));
const CITIES = Object.keys(RETEICA_RATES);
const SECTORS = ['servicios', 'comercial', 'industrial', 'financiero', 'consultoria'];
const IVA_RATES = [0, 5, 19];

export default function InvoiceEditModal({ invoice, onSave, onClose }) {
  const { activeCompany } = useApp();
  const regime = activeCompany?.tax_regime || 'common';

  const [form, setForm] = useState({
    type: invoice.type || 'sale',
    invoice_number: invoice.invoice_number || '',
    date: invoice.date || '',
    vendor_name: invoice.vendor_name || '',
    vendor_nit: invoice.vendor_nit || '',
    concept: invoice.concept || '',
    base_amount: Math.abs(invoice.base_amount) || 0,
    iva_rate: invoice.iva_rate ?? 19,
    activity: invoice.activity || 'servicios',
    city: invoice.city || 'bogota',
    sector: invoice.sector || 'servicios',
    gran_contribuyente: invoice.gran_contribuyente || false,
  });

  // Preview de impuestos recalculados en tiempo real con régimen empresa
  const preview = calculateInvoiceTaxes(form, { companyTaxRegime: regime });

  function handleSubmit(e) {
    e.preventDefault();
    const taxes = calculateInvoiceTaxes(form, { companyTaxRegime: regime });
    onSave({
      ...form,
      base_amount: Number(form.base_amount) || 0,
      ...taxes,
    });
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
        overflow: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ padding: 0, maxWidth: 720, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-card)',
            zIndex: 1,
          }}
        >
          <h3>Editar Factura</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
            }}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {/* Type selector - prominente al inicio */}
          <div style={{ marginBottom: 18 }}>
            <label>Tipo de Documento</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {Object.entries(INVOICE_TYPES).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, type: key })}
                  style={{
                    flex: 1,
                    minWidth: 110,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border:
                      form.type === key
                        ? `1.5px solid ${meta.color}`
                        : '1px solid var(--border-default)',
                    background: form.type === key ? meta.bg : 'var(--bg-card)',
                    color: form.type === key ? meta.color : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
            {form.type === 'sale' && regime === 'simplified' && (
              <p style={{ marginTop: 6, fontSize: '0.75rem', color: '#b45309' }}>
                ⚠ Régimen simplificado: esta venta no genera IVA cobrable (rate forzado a 0).
              </p>
            )}
            {form.type === 'credit_note' && (
              <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Nota crédito: los montos se restarán del total facturado del período.
              </p>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            <div>
              <label>Número Factura</label>
              <input
                className="input"
                value={form.invoice_number}
                onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Fecha</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Proveedor</label>
              <input
                className="input"
                value={form.vendor_name}
                onChange={e => setForm({ ...form, vendor_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>NIT Proveedor</label>
              <input
                className="input"
                value={form.vendor_nit}
                onChange={e => setForm({ ...form, vendor_nit: e.target.value })}
              />
            </div>
            <div>
              <label>Base Gravable (COP)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className="input"
                value={form.base_amount}
                onChange={e => setForm({ ...form, base_amount: Number(e.target.value) })}
                required
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Concepto</label>
              <input
                className="input"
                value={form.concept}
                onChange={e => setForm({ ...form, concept: e.target.value })}
              />
            </div>
            <div>
              <label>Tarifa IVA (%)</label>
              <select
                className="input"
                value={form.iva_rate}
                onChange={e => setForm({ ...form, iva_rate: Number(e.target.value) })}
              >
                {IVA_RATES.map(r => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Actividad (Retefuente)</label>
              <select
                className="input"
                value={form.activity}
                onChange={e => setForm({ ...form, activity: e.target.value })}
              >
                {ACTIVITIES.map(a => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Ciudad (ReteICA)</label>
              <select
                className="input"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Sector (ReteICA)</label>
              <select
                className="input"
                value={form.sector}
                onChange={e => setForm({ ...form, sector: e.target.value })}
              >
                {SECTORS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={form.gran_contribuyente}
                  onChange={e => setForm({ ...form, gran_contribuyente: e.target.checked })}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Gran contribuyente (aplica ReteIVA 15%)
                </span>
              </label>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Cálculo en tiempo real
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 10,
                fontSize: '0.82rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>IVA</div>
                <strong style={{ color: '#047857' }}>{formatCOP(preview.iva_amount)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Retefuente</div>
                <strong style={{ color: '#b45309' }}>{formatCOP(preview.retefuente_amount)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ReteICA</div>
                <strong style={{ color: '#2563eb' }}>{formatCOP(preview.reteica_amount)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ReteIVA</div>
                <strong style={{ color: '#b91c1c' }}>{formatCOP(preview.reteiva_amount)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total</div>
                <strong style={{ color: 'var(--text-primary)' }}>{formatCOP(preview.total)}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
