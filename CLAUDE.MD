# Dashboard Integral Tributario DIAN 🇨🇴

## Qué es este proyecto
App web para contadores y PYMEs colombianas que automatiza reportes tributarios:
- Sube un Excel con facturas del período
- Calcula automáticamente IVA, Retefuente, Reteica, ReteIVA
- Genera formularios PDF listos para presentar a la DIAN (300, 350)
- Dashboard visual con gráficas por período y comparativos
- Multi-empresa: un contador maneja varios clientes
- Calendario tributario con alertas de vencimientos DIAN 2025

---

## Stack tecnológico
- **Frontend:** React + Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy frontend:** Vercel (gratuito)
- **Deploy DB:** Supabase free tier (permanente, nunca hiberna)
- **Generación PDF:** reportlab o fpdf2 (Python) o jsPDF (JS)
- **Parseo Excel:** pandas + openpyxl / SheetJS
- **Datos demo:** Faker con locale='es_CO'

---

## Arquitectura
- Modelo **multi-tenant**: TODAS las tablas de negocio llevan `company_id` para aislar datos entre empresas
- Auth: Supabase Auth con email/password
- Storage: Supabase Storage para Excel subidos y PDFs generados
- Edge Functions: motor de cálculo tributario

---

## Base de datos (Supabase PostgreSQL)
Tablas principales, todas con `company_id`:
- `users` — contadores autenticados
- `companies` — empresas del contador (multi-tenant)
- `invoices` — facturas del período con company_id
- `tax_reports` — reportes generados por período
- `tax_calendar` — fechas y vencimientos DIAN 2025

---

## Compliance y datos de prueba
- **NIT demo:** 999.999.999-0 (supera rango válido colombiano, imposible que coincida con contribuyente real)
- **PDF:** watermark visible "DOCUMENTO DE PRUEBA – NO VÁLIDO ANTE LA DIAN"
- **Nota al pie PDF:** "Consulte a un contador certificado..."
- **Bloque WARNING** en PDF que explica que ningún dato es real
- **UI:** Banner visible "Modo Demo – Datos ficticios generados para pruebas"
- **Empresa demo:** "Demo Tech SAS" (nunca empresas reales)
- **Datos demo:** generados con Faker(locale='es_CO') — nombres, ciudades y empresas colombianas reales

---

## Los 5 entregables concretos (con criterio verificable)

| # | Entregable | Criterio de éxito |
|---|---|---|
| 1 | URL pública | Login funcional con demo@dian.co / demo1234 |
| 2 | GitHub README | Badges + screenshots + instrucciones en 3 comandos |
| 3 | PDF tributario | NIT ficticio, IVA calculado, watermark, diseño profesional |
| 4 | Datos demo | 50 facturas, 6 meses de historia, gráficas nunca vacías |
| 5 | Video LinkedIn | Script de 3 min, flujo completo grabado |

---

## Plan por fases (6 días)

### Fase 1 — Backend Core
- Configurar Supabase: tablas, RLS, Auth
- Motor tributario: cálculo IVA, Retefuente, Reteica, ReteIVA
- Parseo de Excel con facturas
- API endpoints base

### Fase 2 — Generación de PDF
- Formularios 300 y 350 pre-diligenciados
- Watermark y disclaimers legales
- Diseño profesional con NIT ficticio

### Fase 3 — Frontend Dashboard
- Login / Auth con Supabase
- Subida de Excel
- Dashboard con gráficas (Chart.js o Recharts)
- Vista multi-empresa

### Fase 4 — Calendario tributario + Alertas
- Fechas DIAN 2025 hardcodeadas
- Sistema de alertas por vencimiento
- Notificaciones según NIT y tipo de empresa

### Fase 5 — Datos demo + Deploy
- Seed de 50 facturas con Faker(locale='es_CO')
- Deploy en Vercel + Supabase
- URL pública con credenciales demo

### Fase 6 — Pulido final
- README con badges y screenshots
- Video LinkedIn 3 minutos
- Revisión compliance DIAN

---

## Contexto de negocio
- **Mercado objetivo:** contadores independientes y PYMEs en Colombia
- **Competidores:** Siigo, Alegra (facturación electrónica — nosotros NO competimos ahí)
- **Diferenciador:** automatización de reportes tributarios para independientes, accesible y gratuito para MVP
- **Monetización futura:** freemium por número de empresas o facturas procesadas

---

## Fase actual
> Actualiza esta línea cada vez que termines una fase:
**FASE ACTUAL: Fase 1 — Backend Core**

---

## Cómo continuar en nueva sesión
Lee este archivo y di: "Entendido, continuamos en [Fase X]"

---

# Guía técnica para Claude Code

> Esta sección describe el estado **actual** del código (no el plan). Lee antes de editar.

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor Vite en http://localhost:5173
npm run build        # tsc + vite build → dist/
npm run preview      # servir dist/ localmente
```

No hay tests, lint, ni pipeline CI configurado. `npm run build` corre `tsc --noEmit` (ver [tsconfig.json](tsconfig.json)) — útil como verificación de tipos antes de commit.

## Stack real vs. plan

El plan en este archivo describe Supabase + Edge Functions. **El código actual no tiene backend**: es una SPA client-only que persiste todo en `localStorage`. Cuando trabajes:
- No asumas que existen tablas, RLS, Auth de Supabase, ni Edge Functions.
- El "login" es comparación hardcoded (`demo@dian.co` / `demo1234`) en [src/contexts/AppContext.jsx:46-58](src/contexts/AppContext.jsx#L46-L58).
- Toda la persistencia pasa por `localStorage` con clave `dian_dashboard_data`.
- Faker, parseo Excel y generación PDF corren en el browser.

Stack en uso: React 19 + Vite 8 + Tailwind 4 (plugin Vite, no archivo de config) + react-router-dom v7 + jsPDF + xlsx + recharts + framer-motion + lucide-react + @faker-js/faker (locale `es`).

TypeScript está configurado pero el código fuente es `.jsx`. Quedan dos archivos legacy `.ts` (`counter.ts`, `main.ts`) sin uso — ignorar al editar.

## Arquitectura actual

```
src/
├── main.jsx                 entry — monta <App/>
├── App.jsx                  router + ProtectedRoute/PublicRoute
├── contexts/AppContext.jsx  estado global (auth, companies, invoices, calendar) + persistencia localStorage
├── components/layout/Sidebar.jsx
├── pages/                   Login, Dashboard, Invoices, Reports, Calendar, Companies
└── lib/
    ├── taxEngine.js         IVA / Retefuente / ReteICA / ReteIVA + UVT 2025
    ├── excelParser.js       carga .xlsx → mapea columnas ES → invoices con impuestos calculados
    ├── pdfGenerator.js      Formularios DIAN 300 (IVA) y 350 (Retenciones) con watermark
    └── seedData.js          generador 50 facturas demo + empresa "Demo Tech SAS" + calendario DIAN 2025 hardcoded
```

Flujo de datos: **toda factura pasa por `calculateInvoiceTaxes()` antes de guardarse** — tanto las generadas por seed como las parseadas de Excel. El objeto resultante mezcla campos de entrada (`base_amount`, `iva_rate`, `activity`, `city`, `sector`) con los calculados (`iva_amount`, `retefuente_amount`, `reteica_amount`, `reteiva_amount`, `total`). Si añades un nuevo origen de facturas, mantén esa convención.

## Reglas tributarias clave (no inventar)

- `UVT_2025 = 49799` COP. Umbrales de retefuente se expresan en UVT y se multiplican aquí ([src/lib/taxEngine.js:8](src/lib/taxEngine.js#L8)).
- Tarifas IVA: 19% / 5% / 0%.
- Retefuente por actividad: tabla en `RETEFUENTE_ACTIVITIES`. Si la base < `baseUVT * UVT_2025`, retención = 0.
- ReteICA por ciudad+sector: solo Bogotá / Medellín / Cali están definidas. Default `bogota`.
- ReteIVA = 15% del IVA, **solo** si `gran_contribuyente: true`.
- NIT demo `999.999.999-0` (inválido a propósito) — nunca uses NITs reales.

## Cumplimiento en PDFs

`pdfGenerator.js` aplica obligatoriamente:
1. Watermark diagonal "DOCUMENTO DE PRUEBA – NO VÁLIDO ANTE LA DIAN".
2. Bloque amarillo de advertencia al pie con disclaimer.
3. NIT hardcoded a `999.999.999-0` (ignora el de la empresa).

No remuevas ni debilites estos elementos sin instrucción explícita — son requisito de compliance.

## Credenciales demo

```
email:    demo@dian.co
password: demo1234
```

Login con cualquier otro valor falla. Al loguearse, AppContext genera 50 facturas con Faker y la empresa demo. `logout()` limpia `localStorage`.

## Convenciones al editar

- Componentes y páginas usan estilos inline + clases Tailwind mezclados — sigue el estilo del archivo que tocas.
- Strings de UI en español (es-CO). Formato de moneda vía `formatCOP()` en `taxEngine.js`.
- Fechas como ISO `YYYY-MM-DD`.
- IDs generados con `${prefix}-${index}-${Date.now()}`.