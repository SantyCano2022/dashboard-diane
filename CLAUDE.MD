# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Qué es este proyecto

App web para contadores y PYMEs colombianas que automatiza reportes tributarios:
- Sube Excel con facturas → calcula IVA, Retefuente, ReteICA, ReteIVA automático
- Genera PDFs Formularios DIAN 300 (IVA) y 350 (Retenciones)
- Dashboard con gráficas Recharts por período
- Multi-empresa: un contador maneja varios clientes
- Calendario tributario DIAN 2025 con alertas de vencimientos

**Mercado objetivo:** contadores independientes + PYMEs colombianas.
**Diferenciador vs. Siigo/Alegra:** ellos hacen facturación electrónica; este app automatiza reportes tributarios.

---

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor Vite en http://localhost:5173
npm run build        # tsc + vite build → dist/
npm run preview      # servir dist/ localmente
```

No hay tests, lint, ni pipeline CI. `npm run build` corre `tsc` — útil como verificación de tipos antes de commit.

---

## Stack real (lo que corre hoy)

**No hay backend.** SPA client-only con persistencia en `localStorage`.

- React 19 + Vite 8 + Tailwind 4 (plugin Vite, sin archivo de config separado)
- react-router-dom v7 + framer-motion + lucide-react
- recharts (gráficas) + jsPDF + jspdf-autotable (PDFs) + xlsx (parseo Excel)
- @faker-js/faker locale `es` (seed de datos demo) + date-fns

TypeScript configurado pero el código fuente es `.jsx`. Dos archivos legacy `.ts` (`counter.ts`, `main.ts`) sin uso — ignorar.

---

## Arquitectura

```
src/
├── main.jsx                 entry — monta <App/>
├── App.jsx                  router + ProtectedRoute/PublicRoute
├── contexts/AppContext.jsx  estado global + persistencia localStorage
├── components/layout/Sidebar.jsx
├── pages/                   Login, Dashboard, Invoices, Reports, Calendar, Companies
└── lib/
    ├── taxEngine.js         IVA / Retefuente / ReteICA / ReteIVA + UVT 2025
    ├── excelParser.js       .xlsx → invoices con impuestos calculados
    ├── pdfGenerator.js      Formularios 300 y 350 con watermark obligatorio
    └── seedData.js          50 facturas demo + empresa "Demo Tech SAS" + calendario DIAN 2025
```

### Rutas

| Path | Componente |
|------|-----------|
| `/login` | LoginPage (pública) |
| `/` | DashboardPage |
| `/invoices` | InvoicesPage |
| `/reports` | ReportsPage |
| `/calendar` | CalendarPage |
| `/companies` | CompaniesPage |

Rutas protegidas requieren `isAuthenticated`. Todo `/*` redirige a `/`.

### AppContext — API expuesta

```js
{ user, isAuthenticated, login, logout,
  companies, activeCompany, setActiveCompany, addCompany, deleteCompany,
  invoices,         // YA FILTRADAS por activeCompany.id
  allInvoices,      // sin filtrar — usar solo para conteos cross-empresa
  addInvoices, deleteInvoice, deleteInvoices,
  calendar,
  sidebarOpen, setSidebarOpen }
```

- `login(email, password)` — solo acepta `demo@dian.co` / `demo1234`. Al loguearse genera 50 facturas con Faker y la empresa demo.
- `logout()` — limpia `localStorage` y resetea companies/invoices/activeCompany.
- `addInvoices(arr)` — estampa `company_id: activeCompany.id` en cada factura y hace prepend.
- `deleteInvoice(id)` / `deleteInvoices([ids])` — eliminan facturas.
- `addCompany(obj, { withDemoData })` — asigna `id: company-${Date.now()}`. Si `withDemoData: true`, genera 20 facturas demo para esa empresa.
- `deleteCompany(id)` — elimina empresa + sus facturas en cascada. Si era la activa, cambia a otra.
- **`invoices` siempre filtradas por empresa activa** — las páginas no deben filtrar manualmente.
- Persistencia: clave `dian_dashboard_data` en localStorage.

### Flujo de datos de facturas

**Toda factura pasa por `calculateInvoiceTaxes()` antes de guardarse** — seed, Excel parseado, manual. El objeto mezcla campos de entrada (`company_id`, `base_amount`, `iva_rate`, `activity`, `city`, `sector`, `gran_contribuyente`) con calculados (`iva_amount`, `retefuente_amount`, `reteica_amount`, `reteiva_amount`, `total`). Mantén esta convención si añades origen nuevo.

**Multi-tenant**: cada factura tiene `company_id`. El context filtra automáticamente por `activeCompany.id` y expone `invoices` ya filtradas. No filtres manualmente en páginas.

---

## Reglas tributarias (no inventar, no cambiar sin instrucción)

- `UVT_2025 = 49799` COP — en [src/lib/taxEngine.js:8](src/lib/taxEngine.js#L8).
- Tarifas IVA: 19% general / 5% reducida / 0% exento.
- Retefuente por actividad: tabla `RETEFUENTE_ACTIVITIES`. Si `base < baseUVT * UVT_2025`, retención = 0.
- ReteICA por ciudad+sector: solo `bogota` / `medellin` / `cali` definidas. Default `bogota`.
- ReteIVA = 15% del IVA, **solo** si `gran_contribuyente: true`.

---

## Compliance en PDFs (obligatorio, no debilitar)

`pdfGenerator.js` aplica siempre:
1. Watermark diagonal "DOCUMENTO DE PRUEBA – NO VÁLIDO ANTE LA DIAN"
2. Bloque amarillo de advertencia al pie con disclaimer legal
3. NIT hardcoded `999.999.999-0` (ignora el NIT real de la empresa)

No remuevas ni debilites estos elementos sin instrucción explícita.

---

## Convenciones al editar

- Estilos inline + clases Tailwind mezclados — sigue el estilo del archivo que tocas.
- Strings de UI en español (es-CO).
- Formato de moneda vía `formatCOP()` en `taxEngine.js`.
- Fechas como ISO `YYYY-MM-DD`.
- IDs: `${prefix}-${index}-${Date.now()}`.
- NIT demo: `999.999.999-0` (inválido a propósito — nunca uses NITs reales).

---

## Credenciales demo

```
email:    demo@dian.co
password: demo1234
```

---

## Fase actual

> Actualiza esta línea cada vez que termines una fase:

**FASE ACTUAL: Fase 5 — Deploy + Pulido final**

### Estado de fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Motor tributario (IVA / Retefuente / ReteICA / ReteIVA) | ✅ |
| 2 | Generación PDF Formularios 300 y 350 | ✅ |
| 3 | Frontend Dashboard + filtros período + alertas vencimiento | ✅ |
| 4 | Calendario DIAN 2025 + filtros NIT/obligación/urgencia | ✅ |
| 4.5 | Multi-tenant real (filtro por empresa) + responsive mobile | ✅ |
| 5 | Deploy en Vercel + URL pública | ⏳ |
| 6 | Video LinkedIn 3 min + revisión compliance final | ⏳ |

## Cómo continuar en nueva sesión

Lee este archivo y di: "Entendido, continuamos en [Fase X]"
