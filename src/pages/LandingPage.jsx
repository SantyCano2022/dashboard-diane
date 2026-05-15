import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  GitCompare,
  Search,
  ArrowRight,
  Check,
  Code2,
  Sparkles,
  Lock,
  Smartphone,
  Moon,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{ minHeight: '100vh', background: '#0b1220', color: '#f1f5f9', overflow: 'hidden' }}
    >
      {/* Decorative background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37, 99, 235, 0.15), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(6, 182, 212, 0.1), transparent 60%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* NAV */}
        <nav
          style={{
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1200,
            margin: '0 auto',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
                color: '#fff',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              }}
            >
              DT
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>DIAN Tax Dashboard</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>by CANO SAS DEV</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a
              href="https://github.com/SantyCano2022/DashBoard-Diane"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#cbd5e1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                fontSize: '0.88rem',
              }}
            >
              <Code2 size={16} /> GitHub
            </a>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '9px 18px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              Probar Demo <ArrowRight size={14} />
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section
          style={{
            padding: '80px 32px 60px',
            maxWidth: 960,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(37, 99, 235, 0.18)',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#93c5fd',
              marginBottom: 24,
            }}
          >
            <Sparkles size={12} /> Hecho para contadores y PYMEs colombianas 🇨🇴
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.6rem)',
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 20,
              background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Reportes tributarios DIAN
            <br />
            en segundos, no horas.
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#94a3b8',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Sube tu Excel de facturas y obtén automáticamente IVA, Retefuente, ReteICA, ReteIVA y
            los Formularios DIAN 300 y 350 listos en PDF. Multi-empresa, calendario tributario y
            comparador de períodos incluidos.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 28px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Zap size={18} /> Probar Demo Gratis <ArrowRight size={16} />
            </button>
            <a
              href="https://github.com/SantyCano2022/DashBoard-Diane"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Code2 size={18} /> Ver Código
            </a>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Sin tarjeta · Sin instalación · Login demo:{' '}
            <code
              style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}
            >
              demo@dian.co
            </code>{' '}
            /{' '}
            <code
              style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}
            >
              demo1234
            </code>
          </p>
        </section>

        {/* FEATURES GRID */}
        <section style={{ padding: '60px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              Todo lo que un contador necesita
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
              Diseñado desde cero para automatizar el flujo de reportes tributarios colombianos.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            <FeatureCard
              icon={FileSpreadsheet}
              color="#10b981"
              title="Subida Excel inteligente"
              text="Arrastra cualquier Excel. Mapea columnas automáticamente. Detecta duplicados. Sugiere actividad de Retefuente desde el concepto."
            />
            <FeatureCard
              icon={FileText}
              color="#f59e0b"
              title="Formularios DIAN 300 y 350"
              text="Genera PDFs profesionales pre-diligenciados con desglose por tarifa, retención por actividad y ciudad. Listo para revisar."
            />
            <FeatureCard
              icon={Building2}
              color="#8b5cf6"
              title="Multi-empresa real"
              text="Maneja varios clientes con datos aislados. Cambia entre empresas con un clic. Stats por empresa."
            />
            <FeatureCard
              icon={Calendar}
              color="#dc2626"
              title="Calendario DIAN 2025"
              text="Vencimientos reales por dígito de NIT. Filtros por obligación y urgencia. Alertas automáticas en dashboard."
            />
            <FeatureCard
              icon={GitCompare}
              color="#06b6d4"
              title="Comparador de períodos"
              text="Mide crecimiento mes a mes en facturación, IVA y retenciones. Delta absoluto + porcentual con dirección visual."
            />
            <FeatureCard
              icon={Search}
              color="#2563eb"
              title="Command Palette ⌘K"
              text="Busca cualquier comando, página, empresa o acción desde un solo lugar. UX premium tipo Linear/Notion."
            />
          </div>
        </section>

        {/* DIFERENCIADOR */}
        <section
          style={{
            padding: '80px 32px',
            background: 'linear-gradient(180deg, transparent, rgba(37, 99, 235, 0.06))',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16 }}>
              ¿Qué nos diferencia?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: 36 }}>
              Siigo y Alegra hacen{' '}
              <strong style={{ color: '#fff' }}>facturación electrónica</strong>.<br />
              Nosotros hacemos <strong style={{ color: '#fff' }}>reportes tributarios</strong> a
              partir de tus facturas. Nicho diferente.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {[
                ['Distinción ventas / compras', 'Calcula saldo IVA real (generado − descontable)'],
                ['Régimen común y simplificado', 'Simplificado no cobra IVA en ventas'],
                ['Notas crédito', 'Restan correctamente del período'],
                ['Validación NIT con DV', 'Algoritmo oficial DIAN módulo 11'],
                ['Importar XML UBL DIAN', 'Factura electrónica oficial'],
                ['Compliance visible', 'Watermark + disclaimer en cada PDF'],
              ].map(([title, desc], i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Check size={16} style={{ color: '#10b981' }} />
                    <strong style={{ fontSize: '0.92rem' }}>{title}</strong>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TECH STACK */}
        <section
          style={{ padding: '60px 32px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>Bajo el capó</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32 }}>
            Stack moderno, sin compromiso de calidad.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
            }}
          >
            {[
              [Lock, 'Datos en tu navegador', 'Cero servidores, cero tracking'],
              [Smartphone, 'PWA installable', 'Funciona offline tras primera carga'],
              [Moon, 'Modo claro y oscuro', 'Respeta tu sistema'],
              [Zap, '87 tests automatizados', 'Vitest + GitHub Actions CI'],
            ].map(([Icon, title, sub], i) => (
              <div
                key={i}
                style={{
                  padding: 18,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                }}
              >
                <Icon size={20} style={{ color: '#60a5fa', marginBottom: 10 }} />
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>{title}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.76rem', lineHeight: 1.4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          style={{
            padding: '60px 32px 40px',
            textAlign: 'center',
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              padding: 40,
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              borderRadius: 24,
              boxShadow: '0 30px 60px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Shield size={36} style={{ color: '#fde047', marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 12, color: '#fff' }}>
              Pruébalo ahora · Sin registro
            </h2>
            <p style={{ color: '#dbeafe', marginBottom: 24, fontSize: '0.95rem' }}>
              50 facturas demo precargadas en empresa "Demo Tech SAS". Explora todo en menos de 2
              minutos.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 32px',
                background: '#fff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              Entrar al Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            padding: '32px 32px 48px',
            maxWidth: 1100,
            margin: '0 auto',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.82rem',
            color: '#64748b',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              Desarrollado por{' '}
              <strong style={{ color: '#fde047', letterSpacing: '0.06em' }}>CANO SAS DEV</strong> ·
              © 2026 · MIT License
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <a
                onClick={() => navigate('/privacy')}
                style={{ color: '#94a3b8', cursor: 'pointer' }}
              >
                Privacidad
              </a>
              <a onClick={() => navigate('/terms')} style={{ color: '#94a3b8', cursor: 'pointer' }}>
                Términos
              </a>
              <a
                href="https://github.com/SantyCano2022/DashBoard-Diane"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8' }}
              >
                GitHub
              </a>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.72rem', color: '#475569', maxWidth: 700 }}>
            ⚠ Documento de demostración. Los PDFs generados llevan watermark "DOCUMENTO DE PRUEBA" y
            NIT ficticio. No válidos para presentación oficial ante la DIAN. Para reportes reales,
            consulte un contador certificado.
          </p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, color, title, text }) {
  return (
    <div
      style={{
        padding: 24,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        transition: 'all 200ms ease',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 11,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{title}</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}
