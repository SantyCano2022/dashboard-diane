import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  LayoutDashboard, FileSpreadsheet, FileText, Calendar,
  Building2, LogOut, Menu
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileSpreadsheet, label: 'Facturas' },
  { to: '/reports', icon: FileText, label: 'Reportes PDF' },
  { to: '/calendar', icon: Calendar, label: 'Calendario DIAN' },
  { to: '/companies', icon: Building2, label: 'Empresas' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, logout, user, activeCompany } = useApp();

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden"
        style={{ background: '#ffffff', border: '1px solid var(--border-subtle)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: sidebarOpen ? 260 : 0 }}>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
            }}>
              DT
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-on-dark)' }}>
                DIAN Tax
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-muted)' }}>Dashboard Tributario</div>
            </div>
          </div>

          {/* Active company */}
          {activeCompany && (
            <div style={{
              padding: '12px 14px', marginBottom: 16,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
            }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-on-dark-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>Empresa activa</div>
              <div style={{ color: '#ffffff', fontWeight: 600 }}>{activeCompany.name}</div>
              <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.72rem' }}>NIT: {activeCompany.nit}</div>
            </div>
          )}

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{ marginBottom: 2 }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User & logout */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-on-dark-muted)', marginBottom: 8, paddingLeft: 4 }}>
              {user?.email}
            </div>
            <button onClick={logout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none' }}>
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
