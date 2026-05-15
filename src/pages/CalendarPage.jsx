import { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AlertTriangle, Clock, CheckCircle2, CalendarDays, Filter } from 'lucide-react';

const URGENCY_DAYS_SOON = 7;
const URGENCY_DAYS_UPCOMING = 30;

function classifyUrgency(daysUntil) {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= URGENCY_DAYS_SOON) return 'due-soon';
  if (daysUntil <= URGENCY_DAYS_UPCOMING) return 'upcoming';
  return 'far';
}

function urgencyBadge(urgency) {
  switch (urgency) {
    case 'overdue':
      return { className: 'badge-danger', label: 'Vencido' };
    case 'due-soon':
      return { className: 'badge-warning', label: 'Próximo' };
    case 'upcoming':
      return { className: 'badge-info', label: 'Por venir' };
    default:
      return { className: 'badge-success', label: 'Pendiente' };
  }
}

function urgencyIcon(urgency) {
  if (urgency === 'overdue') return <AlertTriangle size={16} style={{ color: '#dc2626' }} />;
  if (urgency === 'due-soon') return <Clock size={16} style={{ color: '#d97706' }} />;
  if (urgency === 'upcoming') return <CalendarDays size={16} style={{ color: '#2563eb' }} />;
  return <CheckCircle2 size={16} style={{ color: '#059669' }} />;
}

function daysLabel(days) {
  if (days < 0) return `${Math.abs(days)} días vencido`;
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return `En ${days} días`;
}

function extractNitLastDigit(nit) {
  if (!nit) return null;
  // Acepta formatos "999.999.999-0" o "9999999990"
  const clean = String(nit).replace(/[^0-9]/g, '');
  if (!clean) return null;
  // Si tiene dígito de verificación (>= 10 chars), tomar el penúltimo; si no, el último
  return Number(clean.slice(-1));
}

export default function CalendarPage() {
  const { calendar, activeCompany } = useApp();
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const companyDigit = useMemo(() => extractNitLastDigit(activeCompany?.nit), [activeCompany]);

  const [nitDigitFilter, setNitDigitFilter] = useState('all');
  const [obligationFilter, setObligationFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const obligationTypes = useMemo(() => {
    const set = new Set(calendar.map(e => e.obligation));
    return Array.from(set);
  }, [calendar]);

  const events = useMemo(() => {
    return calendar
      .map(ev => {
        const due = new Date(ev.due_date + 'T00:00:00');
        const todayMid = new Date(todayISO + 'T00:00:00');
        const daysUntil = Math.round((due - todayMid) / (1000 * 60 * 60 * 24));
        const urgency = classifyUrgency(daysUntil);
        return { ...ev, daysUntil, urgency };
      })
      .filter(ev => {
        if (nitDigitFilter !== 'all' && String(ev.nit_last_digit) !== nitDigitFilter) return false;
        if (obligationFilter !== 'all' && ev.obligation !== obligationFilter) return false;
        if (urgencyFilter !== 'all' && ev.urgency !== urgencyFilter) return false;
        return true;
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [calendar, todayISO, nitDigitFilter, obligationFilter, urgencyFilter]);

  const stats = useMemo(
    () => ({
      overdue: events.filter(e => e.urgency === 'overdue').length,
      soon: events.filter(e => e.urgency === 'due-soon').length,
      upcoming: events.filter(e => e.urgency === 'upcoming').length,
    }),
    [events]
  );

  const grouped = useMemo(() => {
    const g = {};
    events.forEach(ev => {
      const month = ev.due_date.substring(0, 7);
      if (!g[month]) g[month] = [];
      g[month].push(ev);
    });
    return g;
  }, [events]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>Calendario Tributario DIAN 2025</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Vencimientos por último dígito del NIT · Empresa: {activeCompany?.name || 'Sin empresa'}
          {companyDigit !== null && ` · NIT terminado en ${companyDigit}`}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatPill
          color="#dc2626"
          bg="#fee2e2"
          icon={<AlertTriangle size={18} />}
          label="Vencidos"
          value={stats.overdue}
        />
        <StatPill
          color="#d97706"
          bg="#fef3c7"
          icon={<Clock size={18} />}
          label="Próximos 7 días"
          value={stats.soon}
        />
        <StatPill
          color="#2563eb"
          bg="#dbeafe"
          icon={<CalendarDays size={18} />}
          label="Próximos 30 días"
          value={stats.upcoming}
        />
      </div>

      {/* Filters */}
      <div
        className="glass-card"
        style={{
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <Filter size={14} /> Filtrar:
        </span>
        <select
          className="input"
          value={nitDigitFilter}
          onChange={e => setNitDigitFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
          aria-label="Filtrar por dígito de NIT"
        >
          <option value="all">Todos los dígitos NIT</option>
          {companyDigit !== null && (
            <option value={String(companyDigit)}>Solo mi NIT (terminado en {companyDigit})</option>
          )}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <option key={d} value={String(d)}>
              NIT terminado en {d}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={obligationFilter}
          onChange={e => setObligationFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
          aria-label="Filtrar por tipo de obligación"
        >
          <option value="all">Todas las obligaciones</option>
          {obligationTypes.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={urgencyFilter}
          onChange={e => setUrgencyFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
          aria-label="Filtrar por urgencia"
        >
          <option value="all">Toda urgencia</option>
          <option value="overdue">Vencidos</option>
          <option value="due-soon">Próximos 7 días</option>
          <option value="upcoming">Próximos 30 días</option>
          <option value="far">Lejanos</option>
        </select>
        {(nitDigitFilter !== 'all' || obligationFilter !== 'all' || urgencyFilter !== 'all') && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setNitDigitFilter('all');
              setObligationFilter('all');
              setUrgencyFilter('all');
            }}
          >
            Limpiar filtros
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {events.length} resultado{events.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Events grouped by month */}
      {Object.entries(grouped).map(([month, evts]) => (
        <div key={month} style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
            }}
          >
            {new Date(month + '-01T00:00:00').toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
            })}
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {evts.map((ev, i) => {
              const { className, label } = urgencyBadge(ev.urgency);
              const isMyNit = companyDigit !== null && ev.nit_last_digit === companyDigit;
              return (
                <div
                  key={`${month}-${i}`}
                  className="glass-card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    borderLeft: `3px solid ${
                      ev.urgency === 'overdue'
                        ? '#dc2626'
                        : ev.urgency === 'due-soon'
                          ? '#d97706'
                          : ev.urgency === 'upcoming'
                            ? '#2563eb'
                            : '#059669'
                    }`,
                    ...(isMyNit
                      ? {
                          background: 'var(--accent-primary-glow)',
                          borderColor: 'var(--accent-primary)',
                        }
                      : {}),
                  }}
                >
                  {urgencyIcon(ev.urgency)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {ev.obligation}
                      {isMyNit && (
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          MI NIT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {ev.description} · NIT terminado en {ev.nit_last_digit}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      alignItems: 'flex-end',
                    }}
                  >
                    <div
                      style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                      {ev.due_date}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge ${className}`}>{label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {daysLabel(ev.daysUntil)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}
        >
          No hay obligaciones que coincidan con los filtros.
        </div>
      )}
    </div>
  );
}

function StatPill({ color, bg, icon, label, value }) {
  return (
    <div
      className="glass-card"
      style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</div>
        <div
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
