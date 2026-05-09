import { createContext, useContext, useState, useEffect } from 'react';
import { generateDemoInvoices, generateDemoCompany, getDIANCalendar2025 } from '../lib/seedData';

const AppContext = createContext(null);

const STORAGE_KEY = 'dian_dashboard_data';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState({ email: 'demo@dian.co', name: 'Contador Demo' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setCompanies(saved.companies || []);
      setInvoices(saved.invoices || []);
      setActiveCompany(saved.activeCompany || null);
      setIsAuthenticated(saved.isAuthenticated || false);
    }
    setCalendar(getDIANCalendar2025());
  }, []);

  useEffect(() => {
    saveToStorage({ companies, invoices, activeCompany, isAuthenticated });
  }, [companies, invoices, activeCompany, isAuthenticated]);

  function login(email, password) {
    if (email === 'demo@dian.co' && password === 'demo1234') {
      const demo = generateDemoCompany();
      const demoInvoices = generateDemoInvoices(50);
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
    localStorage.removeItem(STORAGE_KEY);
  }

  function addInvoices(newInvoices) {
    setInvoices(prev => [...newInvoices, ...prev]);
  }

  function addCompany(company) {
    const newCompany = { ...company, id: `company-${Date.now()}`, created_at: new Date().toISOString() };
    setCompanies(prev => [...prev, newCompany]);
    return newCompany;
  }

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, login, logout,
      companies, activeCompany, setActiveCompany, addCompany,
      invoices, addInvoices,
      calendar,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
