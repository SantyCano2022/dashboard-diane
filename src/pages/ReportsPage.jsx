import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { calculatePeriodSummary, formatCOP } from '../lib/taxEngine';
import { generateForm300, generateForm350 } from '../lib/pdfGenerator';
import { FileText, Download } from 'lucide-react';

export default function ReportsPage() {
  const { invoices, activeCompany } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedForm, setSelectedForm] = useState('300');

  const periods = useMemo(() => {
    const p = new Set();
    invoices.forEach(inv => { if (inv.date) p.add(inv.date.substring(0, 7)); });
    return Array.from(p).sort().reverse();
  }, [invoices]);

  const periodInvoices = useMemo(() => {
    if (!selectedPeriod) return invoices;
    return invoices.filter(inv => inv.date?.startsWith(selectedPeriod));
  }, [invoices, selectedPeriod]);

  const summary = useMemo(() => calculatePeriodSummary(periodInvoices), [periodInvoices]);

  function handleGenerate() {
    const company = activeCompany || { name: 'Demo Tech SAS', nit: '999.999.999-0', tax_regime: 'common', city: 'Bogotá D.C.' };
    const period = selectedPeriod || 'Todos';
    if (selectedForm === '300') generateForm300(summary, company, period, periodInvoices);
    else generateForm350(summary, company, period, periodInvoices);
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Reportes Tributarios</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Genera formularios DIAN pre-diligenciados en PDF</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Form selector */}
        <div className="glass-card" style={{ padding: 20 }}>
          <label>Tipo de Formulario</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {[{ v: '300', l: 'Form 300 — IVA' }, { v: '350', l: 'Form 350 — Retención' }].map(f => (
              <button
                key={f.v}
                className={`btn ${selectedForm === f.v ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedForm(f.v)}
                style={{ flex: 1 }}
              >
                <FileText size={14} /> {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Period selector */}
        <div className="glass-card" style={{ padding: 20 }}>
          <label htmlFor="period-select">Período</label>
          <select id="period-select" className="input" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} style={{ marginTop: 4 }}>
            <option value="">Todos los períodos</option>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Summary preview */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>
          Vista Previa — Formulario {selectedForm} {selectedPeriod && `(${selectedPeriod})`}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Base Gravable', value: summary.total_base, color: '#0f172a' },
            { label: 'Total IVA', value: summary.total_iva, color: '#047857' },
            { label: 'Retefuente', value: summary.total_retefuente, color: '#b45309' },
            { label: 'ReteICA', value: summary.total_reteica, color: '#2563eb' },
            { label: 'ReteIVA', value: summary.total_reteiva, color: '#b91c1c' },
            { label: 'Facturas', value: summary.total_invoices, color: '#0f172a', isCurrency: false },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color, fontFamily: 'var(--font-display)' }}>
                {item.isCurrency === false ? item.value : formatCOP(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button className="btn btn-primary" onClick={handleGenerate} style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
        <Download size={18} /> Generar y Descargar PDF
      </button>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 12 }}>
        El PDF incluirá watermark "DOCUMENTO DE PRUEBA" y disclaimer legal.
      </p>
    </div>
  );
}
