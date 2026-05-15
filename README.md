# Dashboard Integral Tributario DIAN

> Desarrollado por **[CANO SAS DEV](#-autor)** · App tributaria para contadores y PYMEs colombianas

[![CI](https://github.com/SantyCano2022/dashboard-diane/actions/workflows/ci.yml/badge.svg)](https://github.com/SantyCano2022/dashboard-diane/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-94%20passing-success?logo=vitest)](src/lib/taxEngine.test.js)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8)](public/manifest.webmanifest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> App web para contadores y PYMEs colombianas que automatiza el cálculo de impuestos DIAN (IVA, Retefuente, ReteICA, ReteIVA) y genera formularios PDF listos para presentar. **Distingue ventas, compras y notas crédito** para calcular el saldo IVA real (generado − descontable). Importa Excel y XML UBL 2.1 (factura electrónica DIAN).

---

## ¿Qué hace?

- **Sube un Excel o XML UBL 2.1** con tus facturas del período (ventas, compras, notas crédito)
- **Calcula automáticamente** IVA, Retefuente, ReteICA y ReteIVA según normativa DIAN 2025 (UVT $49,799)
- **Distingue ventas vs compras** → calcula saldo IVA real (generado − descontable)
- **Soporta régimen común y simplificado** (simplificado no cobra IVA en ventas)
- **Genera PDF** de los Formularios 300 (IVA) y 350 (Retenciones) pre-diligenciados
- **Detecta duplicados** al importar y **auto-sugiere actividad** desde el concepto
- **Dashboard visual** con métricas, gráficas mensuales, distribución por actividad y comparador período-vs-período
- **Multi-empresa**: un contador maneja varios clientes con datos aislados
- **Calendario tributario DIAN 2025** con alertas de vencimientos por último dígito de NIT
- **PWA installable** + funciona offline tras primera carga
- **Landing pública** + páginas legales (Política privacidad Ley 1581 + Términos uso)

---

## Quick start

```bash
npm install --legacy-peer-deps
npm run dev
# abre http://localhost:5173
```

### Credenciales demo

```
email:    demo@dian.co
password: demo1234
```

Al ingresar se generan automáticamente 50 facturas ficticias distribuidas en 6 meses para la empresa "Demo Tech SAS".

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Estilos | Tailwind CSS 4 (plugin Vite) |
| Routing | react-router-dom v7 |
| Gráficas | Recharts |
| PDFs | jsPDF + jspdf-autotable |
| Excel | SheetJS (xlsx) |
| XML DIAN | UBL 2.1 parser custom (DOMParser) |
| Datos demo | @faker-js/faker (locale `es`) |
| Persistencia | localStorage (SPA client-only) |
| Iconos | lucide-react |
| Animaciones | framer-motion |
| Tests | Vitest + @xmldom/xmldom |
| Code quality | ESLint flat config + Prettier + Husky + lint-staged |
| CI/CD | GitHub Actions (Node 20 + 22 matrix) |

---

## Características

### Motor tributario colombiano
Cálculos basados en normativa DIAN 2025 (UVT = $49,799 COP):

- **IVA**: tarifas 19% / 5% / 0%, distinción ventas/compras/notas crédito
- **Retefuente**: 12 actividades configuradas (honorarios, servicios, compras, arrendamiento, transporte, etc.) con umbrales en UVT
- **ReteICA**: tarifas por ciudad (Bogotá / Medellín / Cali) y sector
- **ReteIVA**: 15% del IVA para grandes contribuyentes
- **Régimen simplificado**: ajusta cálculos automáticamente

### Multi-tenant real
Cada factura lleva `company_id`. Cambia de empresa en la sidebar y todos los datos se filtran automáticamente. Eliminar una empresa elimina sus facturas en cascada.

### Generación de PDFs DIAN
- Formulario **300** (Declaración IVA): desglose por tarifa, renglones del formulario, totales
- Formulario **350** (Retenciones): retefuente por actividad, ReteICA por ciudad, renglones consolidados
- **Compliance obligatorio**: watermark "DOCUMENTO DE PRUEBA – NO VÁLIDO ANTE LA DIAN", bloque amarillo de advertencia legal, NIT ficticio `999.999.999-0`

### Calendario tributario DIAN 2025
Fechas reales según Decreto 2229 de 2023:
- IVA bimestral
- Retención en la fuente mensual
- Declaración de Renta personas jurídicas
- Información Exógena 2024
- ICA Bogotá bimestral

Filtros por dígito de NIT, tipo de obligación y urgencia.

### Importación inteligente
- **Excel**: drag & drop, mapeo flexible de columnas, plantilla descargable
- **XML UBL 2.1 DIAN**: parser oficial estándar facturación electrónica (Invoice, CreditNote, AttachedDocument)
- **Detección automática de duplicados** por número de factura + NIT
- **Auto-sugerencia de actividad** desde el concepto (12 reglas de keywords)

### UX pulido
- **Command Palette** (`Ctrl/Cmd+K`) — navegación, acciones, empresas
- **Atajos de teclado globales** (`?` ayuda, `g+letter` navegación, `/` foco buscador)
- **Onboarding tour** interactivo primera vez
- **Modo presentación** automatizado para video demo
- **Undo toast** al eliminar facturas
- **Skeleton loaders + empty states** ilustrados SVG
- **Modo oscuro persistente**
- **Responsive mobile**

---

## Comandos disponibles

```bash
npm install --legacy-peer-deps   # instalar dependencias
npm run dev                      # servidor Vite en http://localhost:5173
npm run build                    # tsc + vite build → dist/
npm run preview                  # servir dist/ localmente
npm test                         # corre tests Vitest (94 tests)
npm run test:watch               # tests en modo watch
npm run lint                     # ESLint sobre src/
npm run lint:fix                 # ESLint auto-fix
npm run format                   # Prettier escribe formato sobre src/
npm run format:check             # Prettier verifica formato sin escribir
```

**Tests:** 94 tests pasando, cobertura del motor tributario, validador NIT (algoritmo módulo 11 oficial DIAN), parser UBL 2.1 y motor de sugerencias inteligentes.

---

## Compliance y datos de prueba

> **⚠ Importante**: Esta aplicación genera PDFs **NO VÁLIDOS** ante la DIAN. Es un proyecto demo con fines educativos.

- **NIT demo**: `999.999.999-0` (inválido a propósito, supera rango colombiano válido)
- **Empresa demo**: "Demo Tech SAS" (jamás usar empresas reales)
- **Datos generados** con Faker (locale `es`) + listas custom de empresas, ciudades y actividades colombianas
- **Todos los PDFs incluyen** watermark visible, disclaimer legal y advertencia
- **No se transmite información** a la DIAN ni a ningún servicio externo — todo corre en el navegador
- **Habeas Data**: política de privacidad pública en `/privacy` conforme a Ley 1581 de 2012

---

## Arquitectura

```
src/
├── main.jsx                 entry
├── App.jsx                  router + rutas públicas/protegidas + responsive layout
├── contexts/AppContext.jsx  estado global (auth, companies, invoices, theme) + persistencia localStorage
├── components/
│   ├── layout/Sidebar.jsx
│   ├── CommandPalette.jsx
│   ├── KeyboardShortcuts.jsx
│   ├── OnboardingTour.jsx
│   ├── PresentationMode.jsx
│   ├── PeriodComparator.jsx
│   ├── InvoiceEditModal.jsx
│   ├── ErrorBoundary.jsx
│   ├── EmptyState.jsx
│   ├── Skeleton.jsx
│   └── Toaster.jsx
├── pages/
│   ├── LandingPage.jsx       público — hero + features
│   ├── PrivacyPage.jsx       público — Ley 1581
│   ├── TermsPage.jsx         público — términos uso
│   ├── LoginPage.jsx         público — auth demo
│   ├── DashboardPage.jsx     /app
│   ├── InvoicesPage.jsx      /app/invoices
│   ├── ReportsPage.jsx       /app/reports
│   ├── CalendarPage.jsx      /app/calendar
│   └── CompaniesPage.jsx     /app/companies
└── lib/
    ├── taxEngine.js          motor tributario (IVA / Retefuente / ReteICA / ReteIVA)
    ├── excelParser.js        parseo + export Excel
    ├── ublParser.js          parser XML UBL 2.1 DIAN (factura electrónica)
    ├── pdfGenerator.js       Formularios DIAN 300 y 350
    ├── nitValidator.js       validación NIT módulo 11 oficial
    ├── smartSuggestions.js   auto-sugerir actividad + detectar duplicados
    └── seedData.js           datos demo + calendario DIAN 2025
```

### Rutas

| Path | Tipo | Componente |
|------|------|-----------|
| `/` | Pública | LandingPage |
| `/privacy` | Pública | PrivacyPage |
| `/terms` | Pública | TermsPage |
| `/login` | Pública | LoginPage |
| `/app` | Protegida | DashboardPage |
| `/app/invoices` | Protegida | InvoicesPage |
| `/app/reports` | Protegida | ReportsPage |
| `/app/calendar` | Protegida | CalendarPage |
| `/app/companies` | Protegida | CompaniesPage |

**Sin backend.** SPA client-only. Toda la lógica de impuestos, parseo Excel/XML y generación PDF corre en el navegador. Persistencia en `localStorage` con clave `dian_dashboard_data`.

---

## Roadmap

- [x] Motor tributario completo (IVA, Retefuente, ReteICA, ReteIVA)
- [x] Distinción ventas / compras / notas crédito + saldo IVA real
- [x] Régimen simplificado (no cobra IVA en ventas)
- [x] Generación Formularios 300 y 350 PDF (con IVA descontable)
- [x] Dashboard con gráficas + filtro período + alertas vencimiento
- [x] Comparador período-vs-período (delta absoluto + %)
- [x] Multi-empresa real con aislamiento de datos
- [x] Calendario DIAN 2025 con filtros (NIT, obligación, urgencia)
- [x] Subida + export Excel + edición de facturas
- [x] **Importación XML UBL 2.1 DIAN** (factura electrónica oficial)
- [x] **Detección duplicados al importar**
- [x] **Auto-sugerencia de actividad** desde concepto
- [x] Responsive mobile + modo oscuro persistente
- [x] Validación NIT colombiano con DV oficial + auto-sugerencia
- [x] Command Palette `Cmd+K` + atajos teclado globales
- [x] Undo toast al eliminar facturas
- [x] Skeleton loaders + empty states ilustrados SVG
- [x] Onboarding tour interactivo + modo presentación
- [x] Backup/Restore JSON del estado completo
- [x] Error boundary global con recuperación
- [x] **Tests automatizados (94 tests, Vitest)**
- [x] Code splitting (lazy load rutas pesadas)
- [x] PWA installable + service worker offline
- [x] **Landing pública + Política privacidad + Términos uso**
- [x] **ESLint + Prettier + Husky pre-commit**
- [x] GitHub Actions CI (test + build en Node 20 y 22)
- [ ] Deploy en Vercel (URL pública)
- [ ] Autenticación real (Supabase / Auth0)
- [ ] Backend para sincronización entre dispositivos

---

## Mercado y diferenciación

**Mercado objetivo**: contadores independientes + PYMEs colombianas.

**Diferenciador vs. Siigo / Alegra**: ellos automatizan la facturación electrónica; este proyecto automatiza la **generación de reportes tributarios** a partir de facturas ya emitidas — un nicho menos saturado.

**Monetización futura (post-MVP)**: freemium escalado por número de empresas o facturas procesadas.

---

## Autor

**CANO SAS DEV**

Diseño, arquitectura, motor tributario, frontend e integración PWA. Proyecto desarrollado de cero como demostración técnica del nicho de automatización tributaria colombiana.

```
Desarrollado por  ▸  CANO SAS DEV
Año               ▸  2026
Stack             ▸  React 19 · Vite 8 · Tailwind 4 · Vitest
Tests             ▸  94 passing
Código abierto    ▸  MIT
```

---

## Licencia

MIT — ver [LICENSE](LICENSE). Código abierto. La marca **CANO SAS DEV** y su identidad gráfica son propiedad del autor y se mantienen en forks/redistribuciones.

---

## Disclaimer

Este proyecto es una demostración técnica. Los documentos generados **no son válidos** para presentación ante la DIAN. Para reportes tributarios reales, consulte a un contador certificado.
