import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  LayoutDashboard,
  Upload,
  FileText,
  Calendar,
  Building2,
  Search,
  GitCompare,
} from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: '¡Bienvenido al Dashboard Tributario DIAN!',
    body: 'App para contadores y PYMEs colombianas. Automatiza el cálculo de IVA, Retefuente, ReteICA y ReteIVA, y genera formularios DIAN listos para presentar.',
    cta: 'Vamos a recorrer las 7 funciones principales en 30 segundos.',
    accent: '#2563eb',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard con métricas en tiempo real',
    body: 'Visualiza facturación, impuestos y tendencias por período. Filtra por mes específico o ve todo agregado. Las gráficas se actualizan al cambiar empresa o período.',
    cta: 'Tip: usa el selector arriba a la derecha para cambiar de período.',
    path: '/app',
    accent: '#2563eb',
  },
  {
    id: 'invoices',
    icon: Upload,
    title: 'Sube tus facturas en Excel',
    body: 'Arrastra un archivo .xlsx o usa la plantilla descargable. La app mapea columnas automáticamente (proveedor, base, IVA, actividad) y calcula impuestos al instante.',
    cta: 'Soporta búsqueda, filtros por mes, edición en línea y export Excel.',
    path: '/app/invoices',
    accent: '#10b981',
  },
  {
    id: 'reports',
    icon: FileText,
    title: 'Genera Formularios DIAN 300 y 350',
    body: 'PDF profesionales pre-diligenciados con desglose por tarifa, retención por actividad y ciudad. Watermark y disclaimer legal obligatorios.',
    cta: 'Selecciona período y formulario, descarga el PDF en segundos.',
    path: '/app/reports',
    accent: '#f59e0b',
  },
  {
    id: 'calendar',
    icon: Calendar,
    title: 'Calendario Tributario DIAN 2025',
    body: 'Vencimientos reales por último dígito de NIT: IVA bimestral, Retención mensual, Renta, Información Exógena, ICA Bogotá.',
    cta: 'Alertas automáticas en dashboard cuando hay obligaciones próximas.',
    path: '/app/calendar',
    accent: '#dc2626',
  },
  {
    id: 'companies',
    icon: Building2,
    title: 'Multi-empresa para contadores',
    body: 'Un contador maneja varios clientes con datos aislados. Cada empresa tiene sus facturas, calendario y reportes propios. Backup JSON exportable.',
    cta: 'Validación de NIT con dígito de verificación oficial DIAN incluida.',
    path: '/app/companies',
    accent: '#8b5cf6',
  },
  {
    id: 'compare',
    icon: GitCompare,
    title: 'Compara períodos entre sí',
    body: 'Mide crecimiento mes a mes en facturación, IVA y retenciones. Delta absoluto + porcentual con dirección visual.',
    cta: 'Disponible en el Dashboard cuando hay al menos 2 meses de datos.',
    path: '/app',
    accent: '#06b6d4',
  },
  {
    id: 'palette',
    icon: Search,
    title: 'Command Palette · Cmd + K',
    body: 'Busca cualquier comando, página, empresa o acción desde un solo lugar. Navega con flechas, ejecuta con Enter, cierra con Esc.',
    cta: 'Pruébalo ahora: presiona Ctrl+K (o ⌘K en Mac).',
    accent: '#2563eb',
  },
];

export default function OnboardingTour() {
  const navigate = useNavigate();
  const { hasOnboarded, markOnboarded, isAuthenticated } = useApp();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasOnboarded) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
    if (!isAuthenticated) setVisible(false);
  }, [isAuthenticated, hasOnboarded]);

  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    if (current?.path) {
      navigate(current.path);
    }
  }, [step, visible, navigate]);

  function finish() {
    setVisible(false);
    markOnboarded();
  }

  function skip() {
    setVisible(false);
    markOnboarded();
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-card, #ffffff)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          border: '1px solid var(--border-subtle)',
          animation: 'tourIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header banner */}
        <div
          style={{
            position: 'relative',
            padding: '32px 32px 28px',
            background: `linear-gradient(135deg, ${current.accent} 0%, ${current.accent}dd 100%)`,
            color: '#ffffff',
          }}
        >
          <button
            onClick={skip}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              padding: 6,
              cursor: 'pointer',
              color: '#ffffff',
            }}
            aria-label="Cerrar tour"
          >
            <X size={16} />
          </button>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Icon size={28} strokeWidth={2.2} />
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: 0.85,
              marginBottom: 6,
            }}
          >
            Paso {step + 1} de {STEPS.length}
          </div>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            {current.title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: 28 }}>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            {current.body}
          </p>
          {current.cta && (
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Sparkles size={14} style={{ color: current.accent, marginTop: 3, flexShrink: 0 }} />
              <span>{current.cta}</span>
            </div>
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 22 }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? current.accent : 'var(--border-default)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 250ms ease',
                  padding: 0,
                }}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 28px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={skip}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 500,
              padding: '8px 4px',
            }}
          >
            Omitir tour
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={isFirst}
              className="btn btn-secondary btn-sm"
              style={isFirst ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            {isLast ? (
              <button onClick={finish} className="btn btn-primary btn-sm">
                <Check size={14} /> Empezar a usar
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)} className="btn btn-primary btn-sm">
                Siguiente <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
