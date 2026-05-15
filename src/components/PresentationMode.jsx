import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Play, Pause, X, ChevronRight, ChevronLeft, Presentation } from 'lucide-react';

const SCENES = [
  {
    path: '/app',
    title: 'Dashboard Tributario',
    body: 'Métricas en tiempo real: facturación, IVA, retenciones. Filtra por período, ve alertas y comparativos.',
    duration: 8000,
  },
  {
    path: '/app/invoices',
    title: 'Facturas',
    body: 'Sube Excel, edita en línea, paginación, búsqueda, filtros por mes y export. Cada factura calcula impuestos automáticamente.',
    duration: 8000,
  },
  {
    path: '/app/reports',
    title: 'Reportes DIAN',
    body: 'Genera Formularios 300 (IVA) y 350 (Retenciones) en PDF profesional. Watermark y disclaimer legal incluidos.',
    duration: 8000,
  },
  {
    path: '/app/calendar',
    title: 'Calendario Tributario 2025',
    body: 'Fechas reales por dígito de NIT. Filtros por obligación y urgencia. Alertas automáticas de vencimiento.',
    duration: 8000,
  },
  {
    path: '/app/companies',
    title: 'Multi-Empresa',
    body: 'Un contador maneja varios clientes con datos aislados. Backup JSON, validación NIT oficial DIAN.',
    duration: 8000,
  },
  {
    path: '/app',
    title: 'Cmd+K · Command Palette',
    body: 'Búsqueda global de comandos, empresas, acciones. Modo oscuro, atajos de teclado, UX SaaS premium.',
    duration: 8000,
  },
];

export default function PresentationMode({ active, onClose }) {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setStep(0);
      setElapsed(0);
      setPaused(false);
      return;
    }
    showToast('Modo presentación activo — Esc para salir', 'info', 3000);
  }, [active, showToast]);

  useEffect(() => {
    if (!active) return;
    navigate(SCENES[step].path);
    setElapsed(0);
  }, [step, active, navigate]);

  useEffect(() => {
    if (!active || paused) return;
    const tick = 100;
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + tick;
        if (next >= SCENES[step].duration) {
          if (step < SCENES.length - 1) {
            setStep(s => s + 1);
            return 0;
          }
          // Fin del tour
          clearInterval(intervalRef.current);
          setTimeout(() => {
            onClose();
            showToast('Presentación completada', 'success');
          }, 200);
          return SCENES[step].duration;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(intervalRef.current);
  }, [active, paused, step, onClose, showToast]);

  useEffect(() => {
    if (!active) return;
    function handler(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === ' ') {
        e.preventDefault();
        setPaused(p => !p);
      } else if (e.key === 'ArrowRight') setStep(s => Math.min(s + 1, SCENES.length - 1));
      else if (e.key === 'ArrowLeft') setStep(s => Math.max(s - 1, 0));
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onClose]);

  if (!active) return null;

  const scene = SCENES[step];
  const progress = (elapsed / scene.duration) * 100;
  const isLast = step === SCENES.length - 1;

  return (
    <>
      {/* Spotlight border */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          boxShadow: 'inset 0 0 0 4px rgba(37, 99, 235, 0.4)',
          pointerEvents: 'none',
          zIndex: 80,
          borderRadius: 0,
        }}
      />

      {/* Banner inferior */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 250,
          width: 'calc(100% - 48px)',
          maxWidth: 720,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          padding: '18px 22px',
          color: '#ffffff',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.08)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
              transition: paused ? 'none' : 'width 100ms linear',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(37, 99, 235, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Presentation size={18} style={{ color: '#60a5fa' }} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: 3,
              }}
            >
              Demo · Escena {step + 1} / {SCENES.length}
            </div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                marginBottom: 4,
                letterSpacing: '-0.01em',
              }}
            >
              {scene.title}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              {scene.body}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setStep(s => Math.max(s - 1, 0))}
              disabled={step === 0}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                width: 34,
                height: 34,
                borderRadius: 8,
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                opacity: step === 0 ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Escena anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPaused(p => !p)}
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(37, 99, 235, 0.5)',
                color: '#ffffff',
                width: 34,
                height: 34,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={paused ? 'Reanudar' : 'Pausar'}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={() => (isLast ? onClose() : setStep(s => s + 1))}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                width: 34,
                height: 34,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={isLast ? 'Finalizar' : 'Siguiente'}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                width: 34,
                height: 34,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Salir de presentación"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            display: 'flex',
            gap: 14,
            fontSize: '0.66rem',
            color: '#94a3b8',
          }}
        >
          <span>
            <kbd style={kbdStyle}>Espacio</kbd> pausar
          </span>
          <span>
            <kbd style={kbdStyle}>←</kbd>
            <kbd style={{ ...kbdStyle, marginLeft: 2 }}>→</kbd> navegar
          </span>
          <span>
            <kbd style={kbdStyle}>Esc</kbd> salir
          </span>
        </div>
      </div>
    </>
  );
}

const kbdStyle = {
  padding: '1px 5px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 3,
  fontFamily: 'ui-monospace, monospace',
  fontSize: '0.7rem',
  color: '#cbd5e1',
};
