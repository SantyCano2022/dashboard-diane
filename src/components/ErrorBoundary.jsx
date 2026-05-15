import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (typeof window !== 'undefined' && window.console) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleClearStorage = () => {
    try {
      localStorage.removeItem('dian_dashboard_data');
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'var(--bg-primary, #f8fafc)',
          }}
        >
          <div
            style={{
              maxWidth: 560,
              width: '100%',
              background: '#ffffff',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12)',
              border: '1px solid #fecaca',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              <AlertTriangle size={28} style={{ color: '#dc2626' }} />
            </div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              Algo salió mal
            </h2>
            <p style={{ color: '#475569', fontSize: '0.92rem', marginBottom: 20, lineHeight: 1.5 }}>
              La aplicación encontró un error inesperado. Tus datos siguen guardados en
              localStorage. Puedes intentar recuperarte o limpiar todo y empezar de cero.
            </p>
            {this.state.error && (
              <details
                style={{
                  background: '#f8fafc',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  color: '#64748b',
                  marginBottom: 20,
                  border: '1px solid #e2e8f0',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                  Detalles técnicos
                </summary>
                <pre
                  style={{
                    marginTop: 8,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.72rem',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack &&
                    '\n' + this.state.errorInfo.componentStack.slice(0, 500)}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} /> Reintentar
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Home size={14} /> Ir al inicio
              </button>
              <button
                onClick={this.handleClearStorage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Limpiar datos y reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
