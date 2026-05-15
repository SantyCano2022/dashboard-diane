import { useState, useMemo } from 'react';
import { calculatePeriodSummary, formatCOP } from '../lib/taxEngine';
import { ArrowUpRight, ArrowDownRight, Minus, GitCompare } from 'lucide-react';

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

function formatMonth(ym) {
  if (!ym) return '—';
  const [y, m] = ym.split('-');
  return `${MONTH_LABELS[Number(m) - 1]} ${y}`;
}

function DeltaCell({ a, b, isCurrency = true, label }) {
  const delta = a - b;
  const pct = b === 0 ? null : (delta / b) * 100;
  const up = delta > 0;
  const flat = delta === 0;
  const color = flat ? '#64748b' : up ? '#047857' : '#b91c1c';
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontWeight: 700,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {isCurrency ? formatCOP(a) : a.toLocaleString('es-CO')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            vs {isCurrency ? formatCOP(b) : b.toLocaleString('es-CO')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '3px 8px',
              borderRadius: 999,
              background: flat ? '#f1f5f9' : up ? '#d1fae5' : '#fee2e2',
              color,
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            <Icon size={12} />
            {pct === null ? '—' : `${Math.abs(pct).toFixed(1)}%`}
          </span>
          <span style={{ fontSize: '0.7rem', color, fontWeight: 600 }}>
            {delta > 0 ? '+' : ''}
            {isCurrency ? formatCOP(delta) : delta.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PeriodComparator({ invoices, availablePeriods }) {
  const [periodA, setPeriodA] = useState(() => availablePeriods[0] || '');
  const [periodB, setPeriodB] = useState(() => availablePeriods[1] || '');

  const invoicesA = useMemo(
    () => invoices.filter(inv => inv.date?.startsWith(periodA)),
    [invoices, periodA]
  );
  const invoicesB = useMemo(
    () => invoices.filter(inv => inv.date?.startsWith(periodB)),
    [invoices, periodB]
  );

  const summaryA = useMemo(() => calculatePeriodSummary(invoicesA), [invoicesA]);
  const summaryB = useMemo(() => calculatePeriodSummary(invoicesB), [invoicesB]);

  if (availablePeriods.length < 2) {
    return null;
  }

  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GitCompare size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: 1 }}>Comparador de Períodos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {formatMonth(periodA)} <span style={{ color: 'var(--text-muted)' }}>vs</span>{' '}
              {formatMonth(periodB)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input"
            value={periodA}
            onChange={e => setPeriodA(e.target.value)}
            style={{ width: 'auto', minWidth: 140, padding: '7px 10px', fontSize: '0.8rem' }}
            aria-label="Período A"
          >
            {availablePeriods.map(p => (
              <option key={p} value={p}>
                {formatMonth(p)}
              </option>
            ))}
          </select>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
            vs
          </span>
          <select
            className="input"
            value={periodB}
            onChange={e => setPeriodB(e.target.value)}
            style={{ width: 'auto', minWidth: 140, padding: '7px 10px', fontSize: '0.8rem' }}
            aria-label="Período B"
          >
            {availablePeriods.map(p => (
              <option key={p} value={p}>
                {formatMonth(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        <DeltaCell label="Facturación" a={summaryA.total_base} b={summaryB.total_base} />
        <DeltaCell label="IVA" a={summaryA.total_iva} b={summaryB.total_iva} />
        <DeltaCell label="Retefuente" a={summaryA.total_retefuente} b={summaryB.total_retefuente} />
        <DeltaCell label="ReteICA" a={summaryA.total_reteica} b={summaryB.total_reteica} />
        <DeltaCell label="ReteIVA" a={summaryA.total_reteiva} b={summaryB.total_reteiva} />
        <DeltaCell
          label="# Facturas"
          a={summaryA.total_invoices}
          b={summaryB.total_invoices}
          isCurrency={false}
        />
      </div>
    </div>
  );
}
