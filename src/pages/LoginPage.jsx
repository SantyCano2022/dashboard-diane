import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Shield, Eye, EyeOff, CheckCircle2, Copy } from 'lucide-react';

const TAGLINES = [
  'Calcula IVA, Retefuente y ReteICA en segundos.',
  'Genera formularios DIAN 300 y 350 pre-diligenciados.',
  'Multi-empresa, dashboard visual y calendario tributario.',
];

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    if (!result.success) setError(result.error);
    setLoading(false);
  }

  function fillDemo() {
    setEmail('demo@dian.co');
    setPassword('demo1234');
  }

  function copyDemo() {
    navigator.clipboard?.writeText('demo@dian.co / demo1234').catch(() => {});
  }

  return (
    <div className="login-split" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
      {/* Left — dark blue brand panel */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
        color: '#ffffff',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }} className="login-brand-panel">
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -160, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>
            <Shield size={22} style={{ color: '#2563eb' }} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>DIAN Tax Dashboard</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Dashboard Integral Tributario</div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block',
            padding: '5px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            🇨🇴 Hecho para Colombia
          </div>
          <h1 style={{
            fontSize: '2.6rem',
            lineHeight: 1.1,
            color: '#ffffff',
            fontWeight: 800,
            marginBottom: 18,
            letterSpacing: '-0.025em',
          }}>
            Automatiza tus<br/>reportes tributarios.
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.85, maxWidth: 440, marginBottom: 28 }}>
            Sube un Excel con tus facturas y recibe formularios DIAN listos para presentar.
            Sin instalaciones, sin hojas de cálculo manuales.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TAGLINES.map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', opacity: 0.92 }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#7dd3fc' }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', fontSize: '0.78rem', opacity: 0.6 }}>
          © 2025 Dashboard Tributario DIAN — Proyecto demo
        </div>
      </div>

      {/* Right — login form */}
      <div style={{
        background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Bienvenido de vuelta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 28 }}>
            Inicia sesión para acceder al dashboard.
          </p>

          {/* Demo credentials banner — visible */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: 22,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Credenciales Demo
              </span>
              <button
                type="button"
                onClick={copyDemo}
                style={{
                  background: 'none', border: 'none', color: '#2563eb',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.75rem', fontWeight: 600,
                }}
                aria-label="Copiar credenciales"
              >
                <Copy size={12} /> Copiar
              </button>
            </div>
            <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.85rem', color: '#1e3a8a' }}>
              <div><strong>Email:</strong> demo@dian.co</div>
              <div><strong>Pass:</strong> demo1234</div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '8px 12px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Autocompletar credenciales →
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="demo@dian.co"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: 4,
                  }}
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', marginBottom: 16, borderRadius: 'var(--radius-sm)',
                background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem',
                border: '1px solid #fecaca',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 20 }}>
            Al ingresar aceptas el modo demo con datos ficticios.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-brand-panel { display: none !important; }
          .login-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
