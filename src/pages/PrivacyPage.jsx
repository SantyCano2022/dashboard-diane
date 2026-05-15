import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <LegalLayout title="Política de Privacidad" icon={Shield} onBack={() => navigate(-1)}>
      <p className="lead">
        Última actualización: 15 de mayo de 2026 · Cumplimiento <strong>Ley 1581 de 2012</strong> y
        Decreto 1377 de 2013 (Colombia).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos es <strong>CANO SAS DEV</strong>, autor y
        operador del Dashboard Tributario DIAN ("la Aplicación"). Para cualquier consulta sobre
        protección de datos puede contactar al correo de soporte indicado en el repositorio del
        proyecto.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <p>
        La Aplicación funciona <strong>100% en su navegador</strong>. No tenemos servidores ni bases
        de datos externas. Por lo tanto:
      </p>
      <ul>
        <li>
          <strong>No recopilamos</strong> sus facturas, NIT, datos de empresas ni información
          tributaria. Toda esa información permanece en el almacenamiento local (
          <code>localStorage</code>) de su navegador.
        </li>
        <li>
          <strong>No transmitimos</strong> sus datos a la DIAN, a CANO SAS DEV ni a terceros.
        </li>
        <li>
          <strong>No usamos cookies de seguimiento</strong> ni herramientas de analítica como Google
          Analytics, Facebook Pixel u otros.
        </li>
        <li>
          La autenticación es local (credenciales demo hardcoded). No creamos perfiles de usuario.
        </li>
      </ul>

      <h2>3. Datos del navegador</h2>
      <p>Cuando carga la Aplicación, su navegador puede registrar de forma automática:</p>
      <ul>
        <li>
          Dirección IP (procesada por el proveedor de hosting Vercel sin que la Aplicación la
          almacene)
        </li>
        <li>Tipo de navegador y dispositivo (para renderizado responsive)</li>
        <li>Idioma del sistema (es-CO por defecto)</li>
      </ul>
      <p>
        Vercel, como proveedor de hosting, puede recopilar logs anónimos por motivos de seguridad y
        rendimiento. Consulte la{' '}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          política de privacidad de Vercel
        </a>{' '}
        para más detalles.
      </p>

      <h2>4. Almacenamiento local</h2>
      <p>La Aplicación guarda los siguientes datos en el almacenamiento local de su navegador:</p>
      <ul>
        <li>
          <code>dian_dashboard_data</code> — empresas, facturas y empresa activa
        </li>
        <li>
          <code>dian_dashboard_theme</code> — preferencia de tema (claro/oscuro)
        </li>
        <li>
          <code>dian_dashboard_onboarded</code> — indicador de tour completado
        </li>
      </ul>
      <p>
        Estos datos <strong>nunca salen de su navegador</strong>. Para eliminarlos puede usar el
        botón "Cerrar sesión" o limpiar manualmente los datos del sitio en la configuración de su
        navegador.
      </p>

      <h2>5. Sus derechos (Ley 1581)</h2>
      <p>Como titular de datos personales en Colombia, usted tiene derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar sus datos</li>
        <li>Solicitar prueba de la autorización otorgada</li>
        <li>Ser informado sobre el uso dado a sus datos</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)</li>
        <li>Revocar la autorización y/o solicitar supresión de datos</li>
        <li>Acceder gratuitamente a sus datos</li>
      </ul>
      <p>
        Dado que la Aplicación no almacena datos en nuestros servidores, estos derechos los puede
        ejercer directamente desde su navegador (eliminando datos locales) en cualquier momento.
      </p>

      <h2>6. Datos sensibles</h2>
      <p>
        La Aplicación procesa información tributaria que puede considerarse sensible (NIT, facturas,
        montos). Recomendamos:
      </p>
      <ul>
        <li>No usar la Aplicación en computadores compartidos sin cerrar sesión</li>
        <li>Exportar backups JSON regularmente (botón en Empresas → Backup)</li>
        <li>No compartir capturas de pantalla con datos reales</li>
      </ul>

      <h2>7. Cambios a esta política</h2>
      <p>
        Nos reservamos el derecho a modificar esta política. Los cambios entrarán en vigor al ser
        publicados. La fecha de última actualización aparece al inicio del documento.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para ejercer sus derechos o aclarar dudas sobre el tratamiento de sus datos, contacte a CANO
        SAS DEV a través del repositorio del proyecto en GitHub.
      </p>

      <Footer />
    </LegalLayout>
  );
}

function LegalLayout({ title, icon: Icon, onBack, children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} /> Volver
        </button>

        <div className="glass-card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--accent-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={24} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{title}</h1>
          </div>

          <article className="legal-content">{children}</article>
        </div>
      </div>

      <style>{`
        .legal-content { color: var(--text-secondary); line-height: 1.7; font-size: 0.92rem; }
        .legal-content .lead { font-size: 0.85rem; color: var(--text-muted); padding: 12px 16px; background: var(--bg-subtle); border-radius: 8px; margin-bottom: 24px; }
        .legal-content h2 { font-size: 1.05rem; color: var(--text-primary); margin-top: 28px; margin-bottom: 10px; }
        .legal-content h3 { font-size: 0.95rem; color: var(--text-primary); margin-top: 20px; margin-bottom: 8px; }
        .legal-content p { margin-bottom: 12px; }
        .legal-content ul { margin-bottom: 12px; padding-left: 24px; }
        .legal-content li { margin-bottom: 6px; }
        .legal-content code { background: var(--bg-subtle); padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.85em; color: var(--accent-primary); }
        .legal-content a { color: var(--accent-primary); text-decoration: none; }
        .legal-content a:hover { text-decoration: underline; }
        .legal-content strong { color: var(--text-primary); font-weight: 600; }
      `}</style>
    </div>
  );
}

function Footer() {
  return (
    <p
      style={{
        marginTop: 32,
        paddingTop: 16,
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}
    >
      Desarrollado por <strong style={{ color: 'var(--accent-primary)' }}>CANO SAS DEV</strong> ·
      Documento informativo, no constituye asesoría legal.
    </p>
  );
}

export { LegalLayout, Footer };
