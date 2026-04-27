# Dual Investment Manager

Aplicación web para gestionar y monitorear operaciones de inversión dual en criptomonedas (BTC, ETH, USDT). Construida sobre Google Apps Script con interfaz glassmorphism y soporte multi-capital.

## Stack Tecnológico

- **Backend**: Google Apps Script (GAS) — CRUD contra Google Sheets
- **Frontend**: Vanilla JS (sin frameworks)
- **Datos**: Google Sheets (múltiples pestañas: "CAPITAL 1", "CAPITAL 2", etc.)
- **CSS**: Sistema glassmorphism con ~120 custom properties
- **Iconos**: Lucide (CDN)
- **Fuente**: Space Grotesk (Google Fonts)
- **Hosting**: GAS Web App deployment
- **Sin build tools, sin frameworks, sin package.json**

## Estructura del Proyecto

```
Dual Investment Manager/
├── Index.html      # Plantilla HTML principal (318 líneas)
├── Styles.html     # CSS — glassmorphism, dark/light, responsive (3243 líneas)
├── Scripts.html    # JS — lógica cliente, formularios, rendering (2042 líneas)
├── Codigo.gs       # GAS — backend CRUD, fórmulas, tasa USD (738 líneas)
├── AGENTS.md       # Contexto del repo para herramientas AI
└── README.md
```

## Requisitos

- Cuenta de Google
- Google Sheets (Google Drive)
- Acceso a Google Apps Script

---

## Configuración

### 1. Crear la Hoja de Cálculo

1. Ir a [sheet.new](https://sheet.new) o [drive.google.com](https://drive.google.com)
2. Crear una **nueva hoja de cálculo** en blanco
3. Nombrar el archivo: `Inversión Dual - Dashboard`

### 2. Estructura de Pestañas

La app soporta múltiples capitales. La pestaña por defecto es `CAPITAL 1`.

| Fila | Contenido |
|---|---|
| 1-15 | Reservado (totales y configuraciones) |
| 16 | Inicio de datos (`FIRST_DATA_ROW = 16`) |
| 16-17 | Encabezados de sección |
| 18 | Headers de columnas |
| 21+ | Operaciones activas/completadas |

#### Columnas (desde columna E = col 5)

| # | Letra | Campo | Tipo |
|---|---|---|---|
| 5 | E | Fecha Inicio | Manual |
| 6 | F | Fecha Fin | Manual |
| 7 | G | CEX | Manual |
| 8 | H | Monto | Manual |
| 9 | I | Moneda | Manual |
| 10 | J | APR | Manual |
| 11 | K | Tipo | Manual |
| 12 | L | Precio Objetivo | Manual |
| 13 | M | Días | Fórmula |
| 14 | N | "dia" | Etiqueta |
| 15 | O | Horas | Fórmula |
| 16 | P | "hrs" | Etiqueta |
| 17 | Q | Tiempo decimal | Fórmula |
| 18 | R | Interés | Fórmula |
| 19 | S | Final Calc | Fórmula |
| 20 | T | Final Obtenido Valor | Manual (al completar) |
| 21 | U | Final Obtenido Moneda | Manual (al completar) |
| 22 | V | APR Acum | Fórmula |
| 23 | W | APR Efectivo | Fórmula |

### 3. Configurar Google Apps Script

1. En la hoja, ir a **Extensiones → Apps Script**
2. Crear un nuevo proyecto
3. Copiar el contenido de `Codigo.gs`

Actualizar el ID de la hoja en `Codigo.gs`, línea 9:

```javascript
const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI";
```

El ID se obtiene de la URL: `https://docs.google.com/spreadsheets/d/XXXXX/edit` → la parte `XXXXX`.

### 4. Desplegar la App Web

1. En Apps Script: **Deploy → New deployment**
2. Seleccionar **Web app**
3. Configurar:
   - **Execute as**: Me
   - **Who has access**: Only myself (o Anyone with Google Account)
4. Click **Deploy**
5. Copiar la URL generada

---

## Uso

### Nueva Operación

1. Completar formulario: Fecha inicio, CEX (Binance/Bybit/OKX/Bitget), Monto, Moneda (USDT/ETH/BTC), APR, Tipo (Buy/Sell ETH/BTC), Precio Objetivo
2. Click **Guardar Operación**

### Completar Operación

1. En "Operaciones en Curso", seleccionar moneda final en el dropdown
2. Confirmar finalización

### Editar / Eliminar

- Editar: click en ícono de lápiz → modificar valores → **Actualizar Operación**
- Eliminar: click en ícono de papelera → confirmar

### Multi-Capital

- Usar el selector de capital en el header para cambiar entre pestañas
- Crear nuevos capitales desde el selector (se crea una nueva pestaña "CAPITAL N")

### Tema Claro/Oscuro

- Toggle en el header para alternar entre dark (default) y light theme
- Persistido en `localStorage`

---

## Funciones del Backend (GAS)

| Función GAS | Descripción |
|---|---|
| `obtenerOperaciones(sheetName)` | Lee todas las filas → `{ activas[], completadas[] }` |
| `agregarOperacion(datos, sheetName)` | Crea fila con fórmulas |
| `actualizarOperacionFila(datos, sheetName)` | Actualiza fila existente |
| `eliminarOperacionFila(fila, sheetName)` | Elimina fila |
| `completarOperacion(fila, monedaFinal, sheetName)` | Marca como completada |
| `obtenerResumen(sheetName)` | Resumen financiero |
| `actualizarCelda(celda, valor, nota, sheetName)` | Edita celda B4/B6 |
| `getCapitalsList()` | Lista pestañas de capital |
| `crearNuevoCapital(datos)` | Crea nueva pestaña |

## Flujo de Datos

```
Acción del usuario → JS (google.script.run) → Codigo.gs (SpreadsheetApp)
→ Google Sheets → JSON response → JS SuccessHandler → Actualización DOM
```

---

## Arquitectura CSS

- **Dark theme**: `:root` (default) — fondo `#050505`, acento verde `#00ff94`
- **Light theme**: `[data-theme="light"]` override
- **Persistido en**: `localStorage`
- **Design system**: Glassmorphism — `--glass-bg`, `--glass-border`, `backdrop-filter: blur()`, glow verde
- **Tipografía**: Space Grotesk (main + mono)
- **Responsive**: Mobile-first con breakpoints optimizados

### Variables CSS Principales

```css
--primary: #00ff94;
--secondary: #00d4ff;
--danger: #ff4d6d;
--warning: #ffd166;
--dark: #050505;
--dark-2: #080808;
--text: #eeeeee;
--text-muted: #777777;
```

---

## Patrones Clave del Frontend

| Patrón | Implementación |
|---|---|
| DOM caching | `DOM.elId = document.getElementById("elId")` en `cacheDOM()` |
| Event delegation | Un listener por contenedor con `e.target.closest()` |
| RAF | `raf(() => { ... })` para animaciones |
| Sanitize | `sanitize(str)` antes de `innerHTML` con datos de usuario |
| Confirmaciones | `mostrarConfirmacion(mensaje, onConfirm, onCancel)` |
| Silent reload | `cargarOperaciones(true)` — sin indicador de carga |
| Form loading | `setFormLoading(true/false)` — deshabilita botón, muestra spinner |
| Validación | `showFieldError(groupId, errorId)` — `.has-error` + `.show` |
| Animaciones de fila | CSS: `anim-row-pending/completing/exit/collapse/edit/new` |

### Reglas de Decimales por Moneda

| Moneda | Decimales input | Decimales display | Prefijo |
|---|---|---|---|
| USDT | 4 (`step="0.0001"`) | 2 | `$` |
| ETH | 6 (`step="0.000001"`) | 6 | — |
| BTC | 6 (`step="0.000001"`) | 6 | — |

---

## Solución de Problemas

| Problema | Solución |
|---|---|
| "No se pudo conectar con GAS" | Verificar despliegue, SPREADSHEET_ID, nombre de pestaña, permisos |
| "No hay operaciones" | Datos deben empezar en fila 16, columnas E-W, headers en fila 18 |
| App en blanco | Abrir consola (F12), revisar errores JS, verificar URL de despliegue |
| Duplicados en select CEX | El código limpia el select antes de agregar opciones |

---

## Licencia

MIT License

---

**Versión**: 3.0
**Última actualización**: Abril 2026
**Estado**: Producción
