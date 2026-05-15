import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { LegalLayout, Footer } from './PrivacyPage';

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <LegalLayout title="Términos y Condiciones de Uso" icon={FileText} onBack={() => navigate(-1)}>
      <p className="lead">
        Última actualización: 15 de mayo de 2026 · Aceptación implícita al usar la Aplicación.
      </p>

      <h2>1. Aceptación</h2>
      <p>
        Al acceder y usar el Dashboard Tributario DIAN ("la Aplicación") usted acepta estos Términos
        y Condiciones en su totalidad. Si no está de acuerdo, no use la Aplicación.
      </p>

      <h2>2. Naturaleza de la Aplicación</h2>
      <p>
        La Aplicación es una <strong>herramienta de demostración técnica y educativa</strong>{' '}
        desarrollada por <strong>CANO SAS DEV</strong>. Permite calcular impuestos colombianos (IVA,
        Retefuente, ReteICA, ReteIVA) y generar formularios DIAN 300 y 350 en formato PDF.
      </p>
      <p>
        <strong style={{ color: '#dc2626' }}>
          ⚠ IMPORTANTE: Los documentos PDF generados por la Aplicación NO son válidos para
          presentación oficial ante la DIAN.
        </strong>{' '}
        Llevan watermark visible que los identifica como "DOCUMENTO DE PRUEBA — NO VÁLIDO ANTE LA
        DIAN" y NIT ficticio (999.999.999-0).
      </p>

      <h2>3. Uso permitido</h2>
      <ul>
        <li>Demostración técnica del funcionamiento del motor tributario colombiano</li>
        <li>Aprendizaje sobre cálculos de IVA, Retefuente, ReteICA y ReteIVA</li>
        <li>
          Uso interno por contadores como herramienta de apoyo (NO sustituye contador certificado)
        </li>
        <li>Pruebas, evaluación y formación</li>
      </ul>

      <h2>4. Uso prohibido</h2>
      <p>Está prohibido usar la Aplicación para:</p>
      <ul>
        <li>Presentar reportes oficiales ante la DIAN o cualquier autoridad tributaria</li>
        <li>Sustituir asesoría profesional de un contador certificado</li>
        <li>Suplantar identidad o usar NIT de terceros sin autorización</li>
        <li>Manipular los watermarks, disclaimers o NIT ficticio de los PDFs generados</li>
        <li>Actividades fraudulentas, ilegales o que vulneren derechos de terceros</li>
        <li>Atacar, sobrecargar o intentar comprometer la infraestructura</li>
      </ul>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        La Aplicación se proporciona <strong>"TAL CUAL"</strong>, sin garantía de ningún tipo. CANO
        SAS DEV no será responsable por:
      </p>
      <ul>
        <li>Errores en cálculos tributarios o normativa desactualizada</li>
        <li>Pérdida de datos almacenados localmente (use la función Backup regularmente)</li>
        <li>Multas, sanciones o consecuencias derivadas del uso incorrecto</li>
        <li>Daños directos, indirectos, incidentales o consecuentes</li>
        <li>Interrupciones del servicio o disponibilidad de la URL pública</li>
      </ul>
      <p>
        El usuario asume toda la responsabilidad por verificar la corrección de los cálculos antes
        de usarlos para cualquier fin.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        El código fuente de la Aplicación está disponible bajo licencia MIT. La marca{' '}
        <strong>CANO SAS DEV</strong>, su identidad gráfica y nombre del producto son propiedad del
        autor.
      </p>
      <p>
        Está permitido bifurcar (fork), modificar y redistribuir el código siempre que se mantengan
        los avisos de derechos de autor y atribución correspondientes.
      </p>

      <h2>7. Datos del usuario</h2>
      <p>
        El tratamiento de datos personales está descrito en la{' '}
        <a href="/privacy">Política de Privacidad</a>. Toda información tributaria ingresada
        permanece en el navegador del usuario; la Aplicación no la transmite ni almacena
        externamente.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        CANO SAS DEV se reserva el derecho a modificar la Aplicación, sus funcionalidades, estos
        Términos y la disponibilidad del servicio en cualquier momento, sin previo aviso.
      </p>

      <h2>9. Cumplimiento normativo</h2>
      <p>
        El uso de esta herramienta no exime al usuario de cumplir con sus obligaciones tributarias
        ante la DIAN, incluyendo pero no limitado a:
      </p>
      <ul>
        <li>Estatuto Tributario Nacional (Decreto 624 de 1989)</li>
        <li>Decreto 2229 de 2023 (vencimientos 2025)</li>
        <li>Resolución DIAN UVT 2025</li>
        <li>Normativa de facturación electrónica</li>
      </ul>
      <p>
        Para presentación oficial de declaraciones, use los canales autorizados por la DIAN (MUISCA)
        y/o consulte a un contador público titulado.
      </p>

      <h2>10. Jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia
        será resuelta ante los jueces competentes de Colombia.
      </p>

      <Footer />
    </LegalLayout>
  );
}
