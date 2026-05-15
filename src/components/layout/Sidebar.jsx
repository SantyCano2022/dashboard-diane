import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
} from 'lucide-react';

function isMac() {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

function openCommandPalette() {
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    metaKey: !isMac() ? false : true,
    ctrlKey: !isMac() ? true : false,
    bubbles: true,
  });
  window.dispatchEvent(event);
}

const NAV_ITEMS = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/invoices', icon: FileSpreadsheet, label: 'Facturas' },
  { to: '/app/reports', icon: FileText, label: 'Reportes PDF' },
  { to: '/app/calendar', icon: Calendar, label: 'Calendario DIAN' },
  { to: '/app/companies', icon: Building2, label: 'Empresas' },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    function handler() {
      setIsMobile(window.innerWidth <= breakpoint);
    }
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, logout, user, activeCompany, theme, setTheme } = useApp();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Auto-close on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

  // On desktop, sidebar always visible
  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const visible = isMobile ? sidebarOpen : true;

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: 14,
            left: 14,
            zIndex: 50,
            padding: 10,
            borderRadius: 10,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
          }}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      <aside
        className="sidebar"
        style={{
          width: 260,
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Logo + close button (mobile) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                }}
              >
                DT
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-on-dark)',
                  }}
                >
                  DIAN Tax
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)' }}>
                  Dashboard Tributario
                </div>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  cursor: 'pointer',
                  color: 'var(--text-on-dark)',
                }}
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Command palette trigger */}
          <button
            onClick={openCommandPalette}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              marginBottom: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              color: 'var(--text-on-dark-muted)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              width: '100%',
              textAlign: 'left',
            }}
            aria-label="Abrir buscador de comandos"
          >
            <Search size={14} />
            <span style={{ flex: 1 }}>Buscar...</span>
            <kbd
              style={{
                padding: '1px 5px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 3,
                fontSize: '0.68rem',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {isMac() ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>

          {/* Active company */}
          {activeCompany && (
            <div
              style={{
                padding: '12px 14px',
                marginBottom: 16,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-on-dark-muted)',
                  letterSpacing: '0.06em',
                  marginBottom: 4,
                }}
              >
                Empresa activa
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeCompany.name}
              </div>
              <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.72rem' }}>
                NIT: {activeCompany.nit}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{ marginBottom: 2 }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Theme toggle + User & logout */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="sidebar-link"
              style={{ width: '100%', border: 'none', background: 'none', marginBottom: 4 }}
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-on-dark-muted)',
                marginBottom: 8,
                paddingLeft: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </div>
            <button
              onClick={logout}
              className="sidebar-link"
              style={{ width: '100%', border: 'none', background: 'none' }}
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.65rem',
                color: 'var(--text-on-dark-muted)',
                textAlign: 'center',
                letterSpacing: '0.04em',
              }}
            >
              by{' '}
              <span
                style={{
                  color: '#fde047',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                CANO SAS DEV
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
