import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  Search,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  Upload,
  Download,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  Presentation,
  HelpCircle,
} from 'lucide-react';

function isMac() {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const {
    companies,
    activeCompany,
    setActiveCompany,
    invoices,
    theme,
    setTheme,
    logout,
    exportBackup,
    restoreDemoData,
    showToast,
    setPresentationActive,
    restartOnboarding,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (cmdK) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Construir lista de comandos
  const commands = useMemo(() => {
    const list = [
      // Navegación
      {
        id: 'nav-dashboard',
        section: 'Navegación',
        label: 'Ir al Dashboard',
        icon: LayoutDashboard,
        kbd: 'g d',
        action: () => navigate('/app'),
      },
      {
        id: 'nav-invoices',
        section: 'Navegación',
        label: 'Ir a Facturas',
        icon: FileSpreadsheet,
        kbd: 'g f',
        action: () => navigate('/app/invoices'),
      },
      {
        id: 'nav-reports',
        section: 'Navegación',
        label: 'Ir a Reportes PDF',
        icon: FileText,
        kbd: 'g r',
        action: () => navigate('/app/reports'),
      },
      {
        id: 'nav-calendar',
        section: 'Navegación',
        label: 'Ir al Calendario DIAN',
        icon: Calendar,
        kbd: 'g c',
        action: () => navigate('/app/calendar'),
      },
      {
        id: 'nav-companies',
        section: 'Navegación',
        label: 'Ir a Empresas',
        icon: Building2,
        kbd: 'g e',
        action: () => navigate('/app/companies'),
      },
      // Acciones
      {
        id: 'act-upload',
        section: 'Acciones',
        label: 'Subir Excel de facturas',
        icon: Upload,
        action: () => navigate('/app/invoices'),
      },
      {
        id: 'act-form-300',
        section: 'Acciones',
        label: 'Generar Formulario 300 (IVA)',
        icon: FileText,
        action: () => navigate('/app/reports'),
      },
      {
        id: 'act-form-350',
        section: 'Acciones',
        label: 'Generar Formulario 350 (Retenciones)',
        icon: FileText,
        action: () => navigate('/app/reports'),
      },
      {
        id: 'act-backup',
        section: 'Acciones',
        label: 'Exportar backup JSON',
        icon: Download,
        action: () => exportBackup(),
      },
      {
        id: 'act-restore-demo',
        section: 'Acciones',
        label: 'Restaurar datos demo',
        icon: RefreshCw,
        action: () => restoreDemoData(),
      },
      {
        id: 'act-presentation',
        section: 'Acciones',
        label: 'Iniciar modo presentación',
        icon: Presentation,
        action: () => setPresentationActive(true),
      },
      {
        id: 'act-restart-onboarding',
        section: 'Acciones',
        label: 'Reiniciar tour de bienvenida',
        icon: HelpCircle,
        action: () => restartOnboarding(),
      },
      // Apariencia
      {
        id: 'theme-toggle',
        section: 'Apariencia',
        label: theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      },
      // Sesión
      {
        id: 'session-logout',
        section: 'Sesión',
        label: 'Cerrar sesión',
        icon: LogOut,
        action: () => logout(),
      },
    ];

    // Empresas como comandos
    companies.forEach(c => {
      if (c.id === activeCompany?.id) return;
      list.push({
        id: `company-${c.id}`,
        section: 'Empresas',
        label: `Activar empresa: ${c.name}`,
        icon: Building2,
        action: () => {
          setActiveCompany(c);
          showToast(`Empresa activa: ${c.name}`, 'success');
        },
      });
    });

    // Top 5 facturas por monto como entradas búsquedables
    const topInvoices = [...invoices]
      .sort((a, b) => (b.base_amount || 0) - (a.base_amount || 0))
      .slice(0, 5);
    topInvoices.forEach(inv => {
      list.push({
        id: `invoice-${inv.id}`,
        section: 'Facturas destacadas',
        label: `${inv.invoice_number} · ${inv.vendor_name}`,
        meta: inv.concept,
        icon: FileSpreadsheet,
        action: () => navigate('/app/invoices'),
      });
    });

    return list;
  }, [
    navigate,
    companies,
    activeCompany,
    setActiveCompany,
    theme,
    setTheme,
    logout,
    exportBackup,
    restoreDemoData,
    invoices,
    showToast,
    setPresentationActive,
    restartOnboarding,
  ]);

  // Filtrado fuzzy simple
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      c =>
        c.label.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        (c.meta && c.meta.toLowerCase().includes(q))
    );
  }, [commands, query]);

  // Agrupar por sección
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(cmd => {
      if (!g[cmd.section]) g[cmd.section] = [];
      g[cmd.section].push(cmd);
    });
    return g;
  }, [filtered]);

  function executeCommand(cmd) {
    setOpen(false);
    setTimeout(() => cmd.action(), 50);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[activeIdx];
      if (cmd) executeCommand(cmd);
    }
  }

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 'min(15vh, 120px)',
        padding: '15vh 16px 16px',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--bg-card, #ffffff)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar comandos, páginas, empresas..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            ESC
          </kbd>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <div
                style={{
                  padding: '10px 18px 4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                {section}
              </div>
              {items.map(cmd => {
                flatIdx += 1;
                const isActive = flatIdx === activeIdx;
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setActiveIdx(filtered.indexOf(cmd))}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 18px',
                      background: isActive ? 'var(--accent-primary-glow)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cmd.label}
                      </div>
                      {cmd.meta && (
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cmd.meta}
                        </div>
                      )}
                    </div>
                    {cmd.kbd && (
                      <kbd
                        style={{
                          padding: '2px 6px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'ui-monospace, monospace',
                        }}
                      >
                        {cmd.kbd}
                      </kbd>
                    )}
                    {isActive && !cmd.kbd && (
                      <ArrowRight size={14} style={{ color: 'var(--accent-primary)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
              }}
            >
              No hay comandos que coincidan con "{query}"
            </div>
          )}
        </div>

        <div
          style={{
            padding: '8px 18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-subtle)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <kbd
              style={{
                padding: '1px 5px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 3,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              ↑↓
            </kbd>
            navegar
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <kbd
              style={{
                padding: '1px 5px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 3,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              ⏎
            </kbd>
            seleccionar
          </span>
          <span
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Sparkles size={11} /> {isMac() ? '⌘' : 'Ctrl'}+K
          </span>
        </div>
      </div>
    </div>
  );
}
