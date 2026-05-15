import { useApp } from '../contexts/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const TOAST_STYLES = {
  success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857', Icon: CheckCircle2 },
  error: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', Icon: AlertCircle },
  info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', Icon: Info },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', Icon: AlertCircle },
};

export default function Toaster() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 'calc(100vw - 40px)',
        width: 360,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        const { Icon } = style;
        return (
          <div
            key={t.id}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
              animation: 'toastIn 0.25s ease-out',
              pointerEvents: 'auto',
            }}
          >
            <Icon size={18} style={{ color: style.color, flexShrink: 0, marginTop: 1 }} />
            <span
              style={{
                flex: 1,
                color: style.color,
                fontSize: '0.88rem',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {t.message}
            </span>
            {t.action && (
              <button
                onClick={() => {
                  t.action.onClick();
                  dismissToast(t.id);
                }}
                style={{
                  background: style.color,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismissToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: style.color,
                opacity: 0.6,
                padding: 2,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Cerrar notificación"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
