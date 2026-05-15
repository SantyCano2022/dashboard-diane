import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/layout/Sidebar';
import Toaster from './components/Toaster';
import CommandPalette from './components/CommandPalette';
import OnboardingTour from './components/OnboardingTour';
import PresentationMode from './components/PresentationMode';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { DashboardSkeleton } from './components/Skeleton';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

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

function RouteFallback() {
  return <DashboardSkeleton />;
}

function ProtectedRoute() {
  const {
    isAuthenticated,
    sidebarOpen,
    setSidebarOpen,
    presentationActive,
    setPresentationActive,
  } = useApp();
  const isMobile = useIsMobile();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const sidebarVisible = isMobile ? sidebarOpen : true;
  const mainMarginLeft = isMobile ? 0 : 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      {isMobile && sidebarVisible && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.5)',
            zIndex: 35,
            backdropFilter: 'blur(2px)',
          }}
          aria-hidden="true"
        />
      )}
      <main
        style={{
          flex: 1,
          marginLeft: mainMarginLeft,
          padding: isMobile ? '20px 16px' : '28px 36px',
          maxWidth: isMobile ? '100vw' : `calc(100vw - ${mainMarginLeft}px)`,
          transition: 'margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <CommandPalette />
      <OnboardingTour />
      <KeyboardShortcuts />
      <PresentationMode active={presentationActive} onClose={() => setPresentationActive(false)} />
    </div>
  );
}

function PublicRoute() {
  return <Outlet />;
}

function AuthGate() {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            {/* Públicas (sin auth) */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>
            <Route element={<AuthGate />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            {/* App protegida (requiere login) */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route index element={<DashboardPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="companies" element={<CompaniesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}
