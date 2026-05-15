import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  {
    section: 'General',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Abrir Command Palette' },
      { keys: ['?'], description: 'Mostrar este panel de atajos' },
      { keys: ['Esc'], description: 'Cerrar modal / palette' },
    ],
  },
  {
    section: 'Navegación',
    items: [
      { keys: ['G', 'D'], description: 'Ir al Dashboard' },
      { keys: ['G', 'F'], description: 'Ir a Facturas' },
      { keys: ['G', 'R'], description: 'Ir a Reportes PDF' },
      { keys: ['G', 'C'], description: 'Ir al Calendario' },
      { keys: ['G', 'E'], description: 'Ir a Empresas' },
    ],
  },
  {
    section: 'Acciones',
    items: [
      { keys: ['/'], description: 'Foco en buscador (Facturas)' },
      { keys: ['N'], description: 'Nueva empresa (en Empresas)' },
      { keys: ['Shift', 'D'], description: 'Toggle modo oscuro' },
    ],
  },
  {
    section: 'Modo Presentación',
    items: [
      { keys: ['Espacio'], description: 'Pausar / reanudar' },
      { keys: ['←', '→'], description: 'Cambiar escena' },
      { keys: ['Esc'], description: 'Salir' },
    ],
  },
];

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const { setTheme, theme, isAuthenticated } = useApp();
  const [open, setOpen] = useState(false);
  const gPressedRef = useRef(false);
  const gTimerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    function handler(e) {
      // No interceptar shortcuts cuando user está escribiendo en input/textarea
      const target = e.target;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // ? — abre help (con shift, debe ser shift+/) — funciona aún si está escribiendo? mejor que no
      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        setOpen(prev => !prev);
        return;
      }

      // Esc cierra help
      if (e.key === 'Escape' && open) {
        setOpen(false);
        return;
      }

      // Ignorar resto si está escribiendo
      if (isTyping) return;

      // / — foco en buscador (si existe input con type=search o id=search)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const searchInput = document.querySelector(
          'input[placeholder*="Buscar"], input[type="search"]'
        );
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select?.();
        }
        return;
      }

      // Shift+D — toggle dark mode
      if (e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      // G + letra: navegación
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        gPressedRef.current = true;
        clearTimeout(gTimerRef.current);
        gTimerRef.current = setTimeout(() => {
          gPressedRef.current = false;
        }, 800);
        return;
      }

      if (gPressedRef.current && !e.metaKey && !e.ctrlKey) {
        const map = {
          d: '/app',
          f: '/app/invoices',
          r: '/app/reports',
          c: '/app/calendar',
          e: '/app/companies',
        };
        const path = map[e.key.toLowerCase()];
        if (path) {
          e.preventDefault();
          navigate(path);
          gPressedRef.current = false;
          clearTimeout(gTimerRef.current);
        }
      }

      // N — nueva empresa (solo en /companies)
      if (e.key.toLowerCase() === 'n' && window.location.pathname === '/app/companies') {
        const newBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent?.includes('Nueva Empresa')
        );
        if (newBtn) {
          e.preventDefault();
          newBtn.click();
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(gTimerRef.current);
    };
  }, [navigate, open, setTheme, theme, isAuthenticated]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 220,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          background: 'var(--bg-card)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-subtle)',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Keyboard size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Atajos de Teclado</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
            }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 22px' }}>
          {SHORTCUTS.map(group => (
            <div key={group.section} style={{ marginBottom: 22 }}>
              <h4
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                }}
              >
                {group.section}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 8,
                      fontSize: '0.86rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {item.keys.map((k, j) => (
                        <kbd
                          key={j}
                          style={{
                            padding: '3px 8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 5,
                            fontSize: '0.72rem',
                            fontFamily: 'ui-monospace, monospace',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            minWidth: 20,
                            textAlign: 'center',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '12px 22px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Presiona{' '}
          <kbd
            style={{
              padding: '1px 5px',
              background: 'var(--bg-card)',
              borderRadius: 3,
              border: '1px solid var(--border-subtle)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            ?
          </kbd>{' '}
          en cualquier momento para abrir este panel
        </div>
      </div>
    </div>
  );
}
