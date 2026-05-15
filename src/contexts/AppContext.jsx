import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { generateDemoInvoices, generateDemoCompany, getDIANCalendar2025 } from '../lib/seedData';
import { calculateInvoiceTaxes } from '../lib/taxEngine';

const AppContext = createContext(null);

const STORAGE_KEY = 'dian_dashboard_data';
const THEME_KEY = 'dian_dashboard_theme';
const ONBOARDING_KEY = 'dian_dashboard_onboarded';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
}

function loadOnboarded() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState({ email: 'demo@dian.co', name: 'Contador Demo' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(loadTheme);
  const [hasOnboarded, setHasOnboarded] = useState(loadOnboarded);
  const [presentationActive, setPresentationActive] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setCompanies(saved.companies || []);
      setInvoices(saved.invoices || []);
      setActiveCompany(saved.activeCompany || null);
      setIsAuthenticated(saved.isAuthenticated || false);
    }
    setCalendar(getDIANCalendar2025());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage({ companies, invoices, activeCompany, isAuthenticated });
  }, [companies, invoices, activeCompany, isAuthenticated, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const showToast = useCallback((message, type = 'info', duration = 3500, action = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, action }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  function login(email, password) {
    if (email === 'demo@dian.co' && password === 'demo1234') {
      const demo = generateDemoCompany();
      const demoInvoices = generateDemoInvoices(50, demo.id);
      setUser({ email, name: 'Contador Demo' });
      setCompanies([demo]);
      setActiveCompany(demo);
      setInvoices(demoInvoices);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas' };
  }

  function logout() {
    setIsAuthenticated(false);
    setUser(null);
    setCompanies([]);
    setInvoices([]);
    setActiveCompany(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function addInvoices(newInvoices) {
    const companyId = activeCompany?.id;
    if (!companyId) {
      showToast('No hay empresa activa. Selecciona una empresa primero.', 'error');
      return;
    }
    // Forzar company_id de empresa activa + recalcular impuestos con régimen
    const regime = activeCompany?.tax_regime || 'common';
    const stamped = newInvoices.map(inv => {
      const withCompany = { ...inv, company_id: companyId };
      const taxes = calculateInvoiceTaxes(withCompany, { companyTaxRegime: regime });
      return { ...withCompany, ...taxes };
    });
    setInvoices(prev => [...stamped, ...prev]);
    showToast(
      `${stamped.length} factura${stamped.length > 1 ? 's' : ''} importada${stamped.length > 1 ? 's' : ''}`,
      'success'
    );
  }

  function deleteInvoice(invoiceId) {
    const removed = invoices.find(inv => inv.id === invoiceId);
    if (!removed) return;
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    showToast('Factura eliminada', 'success', 6000, {
      label: 'Deshacer',
      onClick: () => setInvoices(prev => [removed, ...prev]),
    });
  }

  function deleteInvoices(ids) {
    const idSet = new Set(ids);
    const removed = invoices.filter(inv => idSet.has(inv.id));
    if (removed.length === 0) return;
    setInvoices(prev => prev.filter(inv => !idSet.has(inv.id)));
    showToast(
      `${removed.length} factura${removed.length > 1 ? 's' : ''} eliminada${removed.length > 1 ? 's' : ''}`,
      'success',
      6000,
      {
        label: 'Deshacer',
        onClick: () => setInvoices(prev => [...removed, ...prev]),
      }
    );
  }

  function updateInvoice(invoiceId, patch) {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== invoiceId) return inv;
        const merged = { ...inv, ...patch };
        // Recalcular impuestos con régimen de empresa actual
        const company = companies.find(c => c.id === merged.company_id) || activeCompany;
        const regime = company?.tax_regime || 'common';
        const taxes = calculateInvoiceTaxes(merged, { companyTaxRegime: regime });
        return { ...merged, ...taxes };
      })
    );
  }

  function addCompany(company, { withDemoData = false } = {}) {
    const newCompany = {
      ...company,
      id: `company-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCompanies(prev => [...prev, newCompany]);
    if (withDemoData) {
      const seeded = generateDemoInvoices(20, newCompany.id);
      setInvoices(prev => [...seeded, ...prev]);
    }
    showToast(`Empresa "${newCompany.name}" creada`, 'success');
    return newCompany;
  }

  function deleteCompany(companyId) {
    const target = companies.find(c => c.id === companyId);
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    setInvoices(prev => prev.filter(inv => inv.company_id !== companyId));
    if (activeCompany?.id === companyId) {
      const remaining = companies.filter(c => c.id !== companyId);
      setActiveCompany(remaining[0] || null);
    }
    if (target) showToast(`Empresa "${target.name}" eliminada`, 'success');
  }

  function restoreDemoData() {
    const demo = generateDemoCompany();
    const demoInvoices = generateDemoInvoices(50, demo.id);
    setCompanies([demo]);
    setActiveCompany(demo);
    setInvoices(demoInvoices);
    showToast('Datos demo restaurados: 50 facturas en Demo Tech SAS', 'success');
  }

  function markOnboarded() {
    setHasOnboarded(true);
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function restartOnboarding() {
    setHasOnboarded(false);
    try {
      localStorage.removeItem(ONBOARDING_KEY);
    } catch {
      /* ignore */
    }
  }

  function exportBackup() {
    const payload = {
      version: 1,
      exported_at: new Date().toISOString(),
      companies,
      invoices,
      activeCompanyId: activeCompany?.id || null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `dian_dashboard_backup_${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(
      `Backup exportado: ${companies.length} empresas · ${invoices.length} facturas`,
      'success'
    );
  }

  function importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.companies || !Array.isArray(data.companies)) {
            throw new Error('Formato inválido: falta companies[]');
          }
          if (!data.invoices || !Array.isArray(data.invoices)) {
            throw new Error('Formato inválido: falta invoices[]');
          }
          setCompanies(data.companies);
          setInvoices(data.invoices);
          if (data.activeCompanyId) {
            const found = data.companies.find(c => c.id === data.activeCompanyId);
            setActiveCompany(found || data.companies[0] || null);
          } else {
            setActiveCompany(data.companies[0] || null);
          }
          showToast(
            `Backup importado: ${data.companies.length} empresas · ${data.invoices.length} facturas`,
            'success'
          );
          resolve(data);
        } catch (err) {
          showToast(`Error importando backup: ${err.message}`, 'error');
          reject(err);
        }
      };
      reader.onerror = () => {
        const err = new Error('No se pudo leer el archivo');
        showToast(err.message, 'error');
        reject(err);
      };
      reader.readAsText(file);
    });
  }

  const companyInvoices = useMemo(() => {
    if (!activeCompany) return [];
    return invoices.filter(inv => inv.company_id === activeCompany.id);
  }, [invoices, activeCompany]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        companies,
        activeCompany,
        setActiveCompany,
        addCompany,
        deleteCompany,
        invoices: companyInvoices,
        allInvoices: invoices,
        addInvoices,
        deleteInvoice,
        deleteInvoices,
        updateInvoice,
        calendar,
        sidebarOpen,
        setSidebarOpen,
        toasts,
        showToast,
        dismissToast,
        theme,
        setTheme,
        restoreDemoData,
        exportBackup,
        importBackup,
        hasOnboarded,
        markOnboarded,
        restartOnboarding,
        presentationActive,
        setPresentationActive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
