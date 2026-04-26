# Dual Investment Manager — Repo Context

## Tech Stack

- **Runtime**: Google Apps Script (backend), Vanilla JS (frontend)
- **Data**: Google Sheets (single spreadsheet, multiple sheet tabs: "CAPITAL 1", "CAPITAL 2", etc.)
- **CSS**: Custom Glassmorphism design system with CSS custom properties (~120 variables)
- **Icons**: Lucide (via CDN: `https://unpkg.com/lucide@latest`)
- **Font**: Space Grotesk (Google Fonts)
- **Hosting**: GAS Web App deployment
- **No build tools, no frameworks, no package.json**

## Files

| File | Purpose |
|---|---|
| `Index.html` | Main HTML template (header, modals, forms, theme toggle). Uses `<?!= include('...'); ?>` to pull in Styles.html and Scripts.html. |
| `Styles.html` | ~3243 lines of CSS — glassmorphism design, dark/light themes, responsive, animations, skeleton loaders. |
| `Scripts.html` | ~2042 lines of JS — all client logic: form handling, rendering, inline editing, toasts, animations, modals, theme toggle. |
| `Codigo.gs` | ~738 lines of Google Apps Script — CRUD against Sheets, formulas, dollar rate fetch, capital management. |

## Key JS Global Variables (Scripts.html)

| Variable | Purpose |
|---|---|
| `DOM` | Cached DOM element references (populated once in `cacheDOM()`) |
| `operacionesData` | `{ activas: [], completadas: [] }` — all loaded operations |
| `currentSheet` | Current sheet tab name (e.g. `"CAPITAL 1"`) |
| `editandoFila` | Row number being edited, or `null` |

## Naming Conventions

- **Spanish** for all identifiers, labels, comments
- **camelCase** for JS/GAS variables and functions
- **UPPER_SNAKE_CASE** for constants
- **kebab-case** for CSS classes and custom properties
- **camelCase** for HTML IDs
- Error/response objects: `{ success: boolean, message?: string, ...data }`

## Data Flow

```
User Action → JS (google.script.run) → Codigo.gs (SpreadsheetApp) → Google Sheets
→ JSON response → JS SuccessHandler → DOM update
```

## Calling GAS from JS (the only async pattern)

```javascript
google.script.run
  .withSuccessHandler(function(response) {
    if (response?.success) { /* update UI */ }
    else { showAlert("error", extraerMensaje(response, "fallback")); }
  })
  .withFailureHandler(function(error) {
    showAlert("error", "Error: " + extraerMensaje(error, "Error desconocido"));
  })
  .functionName(params, currentSheet);
```

Always call `isGASAvailable()` before invoking `google.script.run`.

## Column Mapping (Codigo.gs, 1-indexed)

| Col | Letter | Field |
|---|---|---|
| 5 | E | Fecha Inicio |
| 6 | F | Fecha Fin |
| 7 | G | CEX |
| 8 | H | Monto |
| 9 | I | Moneda |
| 10 | J | APR |
| 11 | K | Tipo |
| 12 | L | Precio Objetivo |
| 13 | M | Días (formula) |
| 14 | N | "dia" |
| 15 | O | Horas (formula) |
| 16 | P | "hrs" |
| 17 | Q | Tiempo decimal (formula) |
| 18 | R | Interés (formula) |
| 19 | S | Final Calc (formula) |
| 20 | T | Final Obtenido Valor |
| 21 | U | Final Obtenido Moneda |
| 22 | V | APR Acum |
| 23 | W | APR Efectivo |

Formula rows start at `FIRST_DATA_ROW` (16). Manual input = cols E-L (8 cols). Formulas in M-W.

## Currency & Decimal Rules

- **USDT**: 4 decimals max in input (`step="0.0001"`), displayed with 2 decimals + `$` prefix
- **ETH/BTC**: 6 decimals max in input (`step="0.000001"`), displayed with 6 decimals

## Key Patterns

- **DOM caching**: `DOM.elId = document.getElementById("elId")` in `cacheDOM()`
- **RAF wrapping**: `raf(() => { /* DOM update */ })` for animation frames
- **Event delegation**: One listener per container using `e.target.closest()`
- **Sanitize**: `sanitize(str)` before any `innerHTML` with user data
- **Confirmations**: `mostrarConfirmacion(mensaje, onConfirm, onCancel)` creates a fullscreen overlay
- **Silent reload**: `cargarOperaciones(true)` — skips loading indicator for background refreshes
- **Form loading**: `setFormLoading(true/false)` disables button, shows spinner, changes text
- **Row animations**: CSS classes `anim-row-pending/completing/exit/collapse/edit/new`
- **Form validation**: `showFieldError(groupId, errorId)` adds `.has-error` to group + `.show` to error span

## Important HTML IDs

| ID | Purpose |
|---|---|
| `formOperacion` | New/edit operation form |
| `monto` | Amount input (number) |
| `moneda` | Currency select (USDT/ETH/BTC) |
| `modalFormulario` | Operation form overlay |
| `modalDetalle` | Operation detail overlay |
| `activasContainer` | Active ops table |
| `historialContainer` | Completed ops table |
| `resumenContainer` | Financial summary cards |
| `toastContainer` | Toast notifications |
| `btnFlotanteAdd` | Floating add button |

## CSS Architecture

- **Dark theme**: `:root` (default)
- **Light theme**: `[data-theme="light"]` override block
- **Persisted in**: `localStorage`
- **Design system**: Glassmorphism — `--glass-bg`, `--glass-border`, backdrop-filter blur, green glow (`--primary: #00ff94`)

## GAS Backend Functions (Scripts.html → Codigo.gs)

| JS calls | GAS function |
|---|---|
| `obtenerOperaciones(currentSheet)` | reads all rows → `{ activas[], completadas[] }` |
| `agregarOperacion(datos, currentSheet)` | creates row with formulas |
| `actualizarOperacionFila(datos, currentSheet)` | updates existing row |
| `eliminarOperacionFila(fila, currentSheet)` | deletes row |
| `completarOperacion(fila, monedaFinal, currentSheet)` | marks completed |
| `obtenerResumen(currentSheet)` | financial summary |
| `actualizarCelda(celda, valor, nota, sheetName)` | edits B4/B6 cell |
| `getCapitalsList()` | lists all sheet tabs |
| `crearNuevoCapital(datos)` | creates new sheet tab |

## Sheet (Capital) Name Format

`"CAPITAL 1"`, `"CAPITAL 2"`, etc. Default is `"CAPITAL 1"`. Capital selector loads from `getCapitalsList()`.
