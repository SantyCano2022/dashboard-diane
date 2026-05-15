import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatCOP, calculatePeriodSummary } from '../lib/taxEngine';
import PeriodComparator from '../components/PeriodComparator';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  FileText,
  Upload,
  Building2,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Scale,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PALETTE = {
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  violet: '#8b5cf6',
};

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
  if (!ym || ym === 'Sin fecha') return ym;
  const [y, m] = ym.split('-');
  return `${MONTH_LABELS[Number(m) - 1]} ${y.slice(2)}`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color = 'blue',
  delay = 0,
  isCurrency = true,
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const duration = 900;
    const steps = 40;
    const inc = end / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= end) {
        setDisplay(end);
        clearInterval(id);
      } else setDisplay(cur);
    }, duration / steps);
    return () => clearInterval(id);
  }, [value]);

  const tint = {
    blue: { bg: '#dbeafe', fg: '#2563eb' },
    green: { bg: '#d1fae5', fg: '#047857' },
    gold: { bg: '#fef3c7', fg: '#b45309' },
    red: { bg: '#fee2e2', fg: '#b91c1c' },
    violet: { bg: '#ede9fe', fg: '#6d28d9' },
  }[color];

  return (
    <div
      className={`glass-card stat-card ${color}`}
      style={{
        padding: 22,
        opacity: 0,
        animation: `fadeInUp 0.4s ease-out ${delay}s forwards`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: tint.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} style={{ color: tint.fg }} />
        </div>
        {change !== undefined && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '3px 8px',
              borderRadius: 999,
              background: change >= 0 ? '#d1fae5' : '#fee2e2',
              color: change >= 0 ? '#047857' : '#b91c1c',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            <ArrowUpRight size={12} style={{ transform: change >= 0 ? 'none' : 'rotate(90deg)' }} />
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div className="stat-value">
        {isCurrency ? formatCOP(display) : Math.round(display).toLocaleString('es-CO')}
      </div>
    </div>
  );
}

function AlertWidget({ events, onClick }) {
  if (!events.length) return null;
  const overdue = events.filter(e => e.urgency === 'overdue');
  const soon = events.filter(e => e.urgency === 'due-soon');
  const hasUrgent = overdue.length > 0 || soon.length > 0;

  if (!hasUrgent) return null;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        marginBottom: 24,
        padding: '14px 20px',
        background:
          overdue.length > 0
            ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
            : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        border: `1px solid ${overdue.length > 0 ? '#fecaca' : '#fde68a'}`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: overdue.length > 0 ? '#dc2626' : '#d97706',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {overdue.length > 0 ? <AlertTriangle size={20} /> : <Clock size={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            color: overdue.length > 0 ? '#991b1b' : '#92400e',
            fontSize: '0.95rem',
          }}
        >
          {overdue.length > 0
            ? `${overdue.length} obligación${overdue.length > 1 ? 'es' : ''} vencida${overdue.length > 1 ? 's' : ''}`
            : `${soon.length} vencimiento${soon.length > 1 ? 's' : ''} en los próximos 7 días`}
        </div>
        <div
          style={{
            fontSize: '0.82rem',
            color: overdue.length > 0 ? '#7f1d1d' : '#78350f',
            marginTop: 2,
          }}
        >
          {events
            .slice(0, 2)
            .map(e => e.obligation)
            .join(' · ')}
          {events.length > 2 && ` · +${events.length - 2} más`}
        </div>
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: overdue.length > 0 ? '#dc2626' : '#d97706',
          flexShrink: 0,
        }}
      >
        Ver calendario →
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { invoices, activeCompany, calendar } = useApp();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('all');

  // Períodos disponibles
  const availablePeriods = useMemo(() => {
    const set = new Set();
    invoices.forEach(inv => {
      if (inv.date) set.add(inv.date.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  // Facturas filtradas por período
  const filteredInvoices = useMemo(() => {
    if (period === 'all') return invoices;
    return invoices.filter(inv => inv.date?.startsWith(period));
  }, [invoices, period]);

  const summary = useMemo(() => calculatePeriodSummary(filteredInvoices), [filteredInvoices]);

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

  // Distribución por actividad para pie chart
  const activityData = useMemo(() => {
    const groups = {};
    filteredInvoices.forEach(inv => {
      const key = inv.activity || 'servicios';
      groups[key] = (groups[key] || 0) + (Number(inv.base_amount) || 0);
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredInvoices]);

  // Alertas vencimiento próximas (≤ 30 días + vencidas)
  const urgentEvents = useMemo(() => {
    const today = new Date();
    const todayMid = new Date(today.toISOString().split('T')[0] + 'T00:00:00');
    return calendar
      .map(ev => {
        const due = new Date(ev.due_date + 'T00:00:00');
        const daysUntil = Math.round((due - todayMid) / (1000 * 60 * 60 * 24));
        let urgency = 'far';
        if (daysUntil < 0) urgency = 'overdue';
        else if (daysUntil <= 7) urgency = 'due-soon';
        else if (daysUntil <= 30) urgency = 'upcoming';
        return { ...ev, daysUntil, urgency };
      })
      .filter(e => e.urgency === 'overdue' || e.urgency === 'due-soon')
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [calendar]);

  const tooltipStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    boxShadow: 'var(--shadow-card-hover)',
    fontSize: 12,
    color: 'var(--text-primary)',
  };

  const PIE_COLORS = [
    PALETTE.primary,
    PALETTE.success,
    PALETTE.warning,
    PALETTE.violet,
    PALETTE.info,
    PALETTE.danger,
  ];

  return (
    <div>
      {/* Demo banner */}
      <div className="demo-banner" style={{ borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
        Modo Demo — Datos ficticios generados para pruebas · Empresa:{' '}
        {activeCompany?.name || 'Sin empresa'}
      </div>

      {/* Alertas urgentes */}
      <AlertWidget events={urgentEvents} onClick={() => navigate('/app/calendar')} />

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Dashboard Tributario</h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <Building2 size={14} /> {activeCompany?.name || 'Sin empresa'} ·{' '}
            {summary.total_invoices} facturas
            {period !== 'all' && ` · Período ${period}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{ width: 'auto', minWidth: 160, padding: '7px 12px', fontSize: '0.85rem' }}
            aria-label="Filtrar por período"
          >
            <option value="all">Todos los períodos</option>
            {availablePeriods.map(p => (
              <option key={p} value={p}>
                {formatMonth(p)} ({p})
              </option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/invoices')}>
            <Upload size={14} /> Subir Excel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/reports')}>
            <FileText size={14} /> Generar PDF
          </button>
        </div>
      </div>

      {/* Metric cards — fila 1: ventas/compras */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <MetricCard
          icon={DollarSign}
          label={`Ventas (${summary.total_sales})`}
          value={summary.total_base_sales}
          change={period === 'all' ? trend : undefined}
          color="blue"
          delay={0.0}
        />
        <MetricCard
          icon={ShoppingCart}
          label={`Compras (${summary.total_purchases})`}
          value={summary.total_base_purchases}
          color="violet"
          delay={0.05}
        />
        <MetricCard
          icon={Receipt}
          label="IVA Generado"
          value={summary.total_iva_generado}
          color="green"
          delay={0.1}
        />
        <MetricCard
          icon={Wallet}
          label="IVA Descontable"
          value={summary.total_iva_descontable}
          color="blue"
          delay={0.15}
        />
      </div>

      {/* Saldo IVA destacado */}
      <div
        className="glass-card"
        style={{
          padding: 22,
          marginBottom: 16,
          background:
            summary.iva_balance >= 0
              ? 'linear-gradient(135deg, var(--bg-card), var(--accent-success-glow))'
              : 'linear-gradient(135deg, var(--bg-card), var(--accent-primary-glow))',
          borderColor: summary.iva_balance >= 0 ? '#a7f3d0' : '#bfdbfe',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: summary.iva_balance >= 0 ? '#10b981' : '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scale size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 4,
              }}
            >
              Saldo IVA del Período
            </div>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {formatCOP(Math.abs(summary.iva_balance))}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {summary.iva_balance > 0
                ? '🔺 A pagar a la DIAN'
                : summary.iva_balance < 0
                  ? '🔻 Saldo a favor (recuperable)'
                  : '⚖️ Saldo neutro'}
              {' · '}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {formatCOP(summary.total_iva_generado)} generado −{' '}
                {formatCOP(summary.total_iva_descontable)} descontable
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Retenciones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <MetricCard
          icon={TrendingUp}
          label="Total Retefuente"
          value={summary.total_retefuente}
          color="gold"
          delay={0.2}
        />
        <MetricCard
          icon={FileText}
          label="Total ReteICA"
          value={summary.total_reteica}
          color="red"
          delay={0.25}
        />
        <MetricCard
          icon={FileText}
          label="Total ReteIVA"
          value={summary.total_reteiva}
          color="violet"
          delay={0.3}
        />
      </div>

      {/* Main chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div>
            <h3 style={{ marginBottom: 2 }}>Facturación por Mes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Últimos {monthlyData.length} períodos
            </p>
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.25)"
              vertical={false}
            />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
              tickLine={false}
            />
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

      {/* Period comparator */}
      <PeriodComparator invoices={invoices} availablePeriods={availablePeriods} />

      {/* Two-col: tax breakdown + activity pie */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 18 }}>Impuestos Recaudados por Mes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.25)"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={v => formatCOP(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="iva" name="IVA" fill={PALETTE.success} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="retefuente"
                name="Retefuente"
                fill={PALETTE.warning}
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="reteica" name="ReteICA" fill={PALETTE.violet} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 18 }}>Distribución por Actividad</h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {activityData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCOP(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Sin datos para este período
            </div>
          )}
        </div>
      </div>

      {/* Próximas obligaciones */}
      {urgentEvents.length > 0 && (
        <div className="glass-card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3>Próximas Obligaciones</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/calendar')}>
              Ver todas
            </button>
          </div>
          <div style={{ padding: 16, display: 'grid', gap: 8 }}>
            {urgentEvents.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: ev.urgency === 'overdue' ? '#fef2f2' : '#fffbeb',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${ev.urgency === 'overdue' ? '#dc2626' : '#d97706'}`,
                }}
              >
                {ev.urgency === 'overdue' ? (
                  <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                ) : (
                  <Clock size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}
                  >
                    {ev.obligation}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {ev.description} · NIT terminado en {ev.nit_last_digit}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ev.due_date}</div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: ev.urgency === 'overdue' ? '#dc2626' : '#d97706',
                      fontWeight: 600,
                    }}
                  >
                    {ev.daysUntil < 0
                      ? `${Math.abs(ev.daysUntil)} días vencido`
                      : ev.daysUntil === 0
                        ? 'Hoy'
                        : `En ${ev.daysUntil} días`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent invoices */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3>Últimas Facturas</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/invoices')}>
            Ver todas
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Concepto</th>
                <th style={{ textAlign: 'right' }}>Base</th>
                <th style={{ textAlign: 'right' }}>IVA</th>
                <th style={{ textAlign: 'right' }}>Retefuente</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.slice(0, 8).map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {inv.invoice_number}
                  </td>
                  <td>{inv.date}</td>
                  <td>{inv.vendor_name}</td>
                  <td
                    style={{
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.concept}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {formatCOP(inv.base_amount)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#047857' }}>
                    {formatCOP(inv.iva_amount)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#b45309' }}>
                    {formatCOP(inv.retefuente_amount)}
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}
                  >
                    Sin facturas{period !== 'all' ? ' en este período' : ''}. Carga un Excel o usa
                    los datos demo.
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
