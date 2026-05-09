import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatCOP, calculatePeriodSummary } from '../lib/taxEngine';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, Receipt, TrendingUp, FileText, Upload, Building2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PALETTE = {
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMonth(ym) {
  if (!ym || ym === 'Sin fecha') return ym;
  const [y, m] = ym.split('-');
  return `${MONTH_LABELS[Number(m) - 1]} ${y.slice(2)}`;
}

function MetricCard({ icon: Icon, label, value, change, color = 'blue', delay = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = Number(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const duration = 900;
    const steps = 40;
    const inc = end / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= end) { setDisplay(end); clearInterval(id); }
      else setDisplay(cur);
    }, duration / steps);
    return () => clearInterval(id);
  }, [value]);

  const tint = {
    blue: { bg: '#dbeafe', fg: '#2563eb' },
    green: { bg: '#d1fae5', fg: '#047857' },
    gold: { bg: '#fef3c7', fg: '#b45309' },
    red: { bg: '#fee2e2', fg: '#b91c1c' },
  }[color];

  return (
    <div className={`glass-card stat-card ${color}`} style={{
      padding: 22,
      opacity: 0,
      animation: `fadeInUp 0.4s ease-out ${delay}s forwards`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: tint.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color: tint.fg }} />
        </div>
        {change !== undefined && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            padding: '3px 8px', borderRadius: 999,
            background: change >= 0 ? '#d1fae5' : '#fee2e2',
            color: change >= 0 ? '#047857' : '#b91c1c',
            fontSize: '0.72rem', fontWeight: 600,
          }}>
            <ArrowUpRight size={12} style={{ transform: change >= 0 ? 'none' : 'rotate(90deg)' }} />
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div className="stat-value">{formatCOP(display)}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { invoices, activeCompany } = useApp();
  const navigate = useNavigate();

  const summary = useMemo(() => calculatePeriodSummary(invoices), [invoices]);

  const monthlyData = useMemo(() => {
    const months = {};
    invoices.forEach(inv => {
      const m = inv.date?.substring(0, 7);
      if (!m) return;
      if (!months[m]) months[m] = { month: m, base: 0, iva: 0, retefuente: 0, reteica: 0 };
      months[m].base += Number(inv.base_amount) || 0;
      months[m].iva += Number(inv.iva_amount) || 0;
      months[m].retefuente += Number(inv.retefuente_amount) || 0;
      months[m].reteica += Number(inv.reteica_amount) || 0;
    });
    return Object.values(months)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(d => ({ ...d, monthLabel: formatMonth(d.month) }));
  }, [invoices]);

  const trend = useMemo(() => {
    if (monthlyData.length < 2) return undefined;
    const last = monthlyData[monthlyData.length - 1].base;
    const prev = monthlyData[monthlyData.length - 2].base;
    if (prev === 0) return undefined;
    return ((last - prev) / prev) * 100;
  }, [monthlyData]);

  const tooltipStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
    fontSize: 12,
    color: '#0f172a',
  };

  return (
    <div>
      {/* Demo banner */}
      <div className="demo-banner" style={{ borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
        Modo Demo — Datos ficticios generados para pruebas · Empresa: {activeCompany?.name || 'Demo Tech SAS'}
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Dashboard Tributario</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={14} /> {activeCompany?.name || 'Demo Tech SAS'} · {summary.total_invoices} facturas procesadas
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/invoices')}>
            <Upload size={14} /> Subir Excel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/reports')}>
            <FileText size={14} /> Generar PDF
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        <MetricCard icon={DollarSign} label="Total Facturado" value={summary.total_base} change={trend} color="blue" delay={0.0} />
        <MetricCard icon={Receipt} label="Total IVA Generado" value={summary.total_iva} color="green" delay={0.05} />
        <MetricCard icon={TrendingUp} label="Total Retefuente" value={summary.total_retefuente} color="gold" delay={0.10} />
        <MetricCard icon={FileText} label="Total ReteICA" value={summary.total_reteica} color="red" delay={0.15} />
      </div>

      {/* Main chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ marginBottom: 2 }}>Facturación por Mes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Últimos {monthlyData.length} períodos</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PALETTE.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PALETTE.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={v => formatCOP(v)} />
            <Area
              type="monotone"
              dataKey="base"
              name="Facturación"
              stroke={PALETTE.primary}
              strokeWidth={2.5}
              fill="url(#baseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tax breakdown chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 18 }}>Impuestos Recaudados por Mes</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => formatCOP(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar dataKey="iva" name="IVA" fill={PALETTE.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="retefuente" name="Retefuente" fill={PALETTE.warning} radius={[4, 4, 0, 0]} />
            <Bar dataKey="reteica" name="ReteICA" fill={PALETTE.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent invoices */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Últimas Facturas</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/invoices')}>Ver todas</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factura</th><th>Fecha</th><th>Proveedor</th><th>Concepto</th>
                <th style={{ textAlign: 'right' }}>Base</th>
                <th style={{ textAlign: 'right' }}>IVA</th>
                <th style={{ textAlign: 'right' }}>Retefuente</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 8).map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoice_number}</td>
                  <td>{inv.date}</td>
                  <td>{inv.vendor_name}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.concept}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>{formatCOP(inv.base_amount)}</td>
                  <td style={{ textAlign: 'right', color: '#047857' }}>{formatCOP(inv.iva_amount)}</td>
                  <td style={{ textAlign: 'right', color: '#b45309' }}>{formatCOP(inv.retefuente_amount)}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Sin facturas. Carga un Excel o usa los datos demo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
