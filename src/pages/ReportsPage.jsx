import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { calculatePeriodSummary, formatCOP } from '../lib/taxEngine';
import { generateForm300, generateForm350 } from '../lib/pdfGenerator';
import { FileText, Download, Loader2 } from 'lucide-react';

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

function formatPeriodLabel(ym) {
  if (!ym) return ym;
  const [y, m] = ym.split('-');
  return `${MONTH_LABELS[Number(m) - 1]} ${y}`;
}

export default function ReportsPage() {
  const { invoices, activeCompany, showToast } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedForm, setSelectedForm] = useState('300');
  const [generating, setGenerating] = useState(false);

  const periods = useMemo(() => {
    const p = new Set();
    invoices.forEach(inv => {
      if (inv.date) p.add(inv.date.substring(0, 7));
    });
    return Array.from(p).sort().reverse();
  }, [invoices]);

  const periodInvoices = useMemo(() => {
    if (!selectedPeriod) return invoices;
    return invoices.filter(inv => inv.date?.startsWith(selectedPeriod));
  }, [invoices, selectedPeriod]);

  const summary = useMemo(() => calculatePeriodSummary(periodInvoices), [periodInvoices]);

  async function handleGenerate() {
    if (periodInvoices.length === 0) {
      showToast('No hay facturas en el período seleccionado', 'warning');
      return;
    }
    setGenerating(true);
    try {
      const company = activeCompany || {
        name: 'Demo Tech SAS',
        nit: '999.999.999-0',
        tax_regime: 'common',
        city: 'Bogotá D.C.',
      };
      const period = selectedPeriod || 'Todos';
      // Diferir generación para que el spinner se vea
      await new Promise(r => setTimeout(r, 50));
      if (selectedForm === '300') generateForm300(summary, company, period, periodInvoices);
      else generateForm350(summary, company, period, periodInvoices);
      showToast(
        `Formulario ${selectedForm} generado: ${periodInvoices.length} facturas`,
        'success'
      );
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Reportes Tributarios</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        Genera formularios DIAN pre-diligenciados en PDF · {invoices.length} facturas disponibles
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="glass-card" style={{ padding: 20 }}>
          <label>Tipo de Formulario</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {[
              { v: '300', l: 'Form 300 — IVA' },
              { v: '350', l: 'Form 350 — Retención' },
            ].map(f => (
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

        <div className="glass-card" style={{ padding: 20 }}>
          <label htmlFor="period-select">Período</label>
          <select
            id="period-select"
            className="input"
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="">Todos los períodos</option>
            {periods.map(p => (
              <option key={p} value={p}>
                {formatPeriodLabel(p)} ({p})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>
          Vista Previa — Formulario {selectedForm} {selectedPeriod && `(${selectedPeriod})`}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
          }}
        >
          {[
            { label: 'Ventas', value: summary.total_base_sales, color: '#047857' },
            { label: 'Compras', value: summary.total_base_purchases, color: '#1e40af' },
            { label: 'IVA Generado', value: summary.total_iva_generado, color: '#047857' },
            { label: 'IVA Descontable', value: summary.total_iva_descontable, color: '#1e40af' },
            {
              label: 'Saldo IVA',
              value: summary.iva_balance,
              color: summary.iva_balance >= 0 ? '#047857' : '#b91c1c',
            },
            { label: 'Retefuente', value: summary.total_retefuente, color: '#b45309' },
            { label: 'ReteICA', value: summary.total_reteica, color: '#2563eb' },
            {
              label: 'Facturas',
              value: summary.total_invoices,
              color: 'var(--text-primary)',
              isCurrency: false,
            },
          ].map(item => (
            <div
              key={item.label}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: item.color,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {item.isCurrency === false ? item.value : formatCOP(item.value)}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: 'var(--accent-primary-glow)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>{summary.total_sales || 0}</strong> ventas ·{' '}
          <strong>{summary.total_purchases || 0}</strong> compras ·{' '}
          <strong>{summary.total_credit_notes || 0}</strong> notas crédito
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        style={{ padding: '14px 28px', fontSize: '0.95rem' }}
        disabled={generating || periodInvoices.length === 0}
      >
        {generating ? (
          <>
            <Loader2 size={18} className="spin" /> Generando PDF...
          </>
        ) : (
          <>
            <Download size={18} /> Generar y Descargar PDF
          </>
        )}
      </button>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 12 }}>
        El PDF incluirá watermark "DOCUMENTO DE PRUEBA" y disclaimer legal.
      </p>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
