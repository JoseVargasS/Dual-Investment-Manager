# Inversión Dual - Crypto Dashboard

Aplicación web para gestionar y seguir operaciones de inversión dual en criptomonedas (BTC, ETH, USDT).

## Estructura del Proyecto

```
Dual Investment Manager/
├── Index.html      # Plantilla principal HTML
├── Styles.html   # Estilos CSS (Glassmorphism UI)
├── Scripts.html # Lógica JavaScript del cliente
├── Codigo.gs    # Google Apps Script (backend)
└── README.md    # Este archivo
```

## Requisitos

- Cuenta de Google
- Google Sheets (Google Drive)
- Acceso a Google Apps Script

---

## Cómo Crear la Hoja de Google

### 1. Crear Nueva Hoja de Cálculo

1. Ve a [sheet.new](https://sheet.new) o [drive.google.com](https://drive.google.com)
2. Crea una **Nueva hoja de cálculo** en blanco
3. Nombra el archivo: `Inversión Dual - Dashboard`

### 2. Configurar Pestañas

La app usa **1 pestaña principal**:

#### Pestaña: `PRESTAMO`

| Fila | Contenido |
|------|----------|
| 1-15 | Reserved (totales y configuraciones) |
| 16-17 | Encabezados de sección |
| **18** | Headers de columnas |
| **20** | **Inicio de datos (FIRST_DATA_ROW = 20)** |
| 21+ | Operaciones activas/completadas |

##### Estructura de Columnas (Desde columna E = columna 5):

| # | Letra | Campo | Descripción |
|----|------|------|-----------|
| 5 | E | FECHA INICIO | Fecha y hora de inicio |
| 6 | F | FECHA FIN | Fecha de finalización |
| 7 | G | CEX | Exchange (Binance, Bybit, OKX, Bitget) |
| 8 | H | MONTO | Monto inicial invertido |
| 9 | I | MONEDA | Moneda (USDT, ETH, BTC) |
| 10 | J | %APR | Tasa APR anual |
| 11 | K | TIPO | Tipo operación (Buy/Sell ETH/BTC) |
| 12 | L | PRECIO OBJ. | Precio objetivo |
| 13 | M | TIEMPO CEX | Tiempo en CEX (días) |
| 14 | N | DURACION | Duración (horas) |
| 17 | Q | FINAL OBTENIDO | Monto final recibido |
| 18 | R | INTERÉS | Interés generado |
| 19 | S | TOTAL | Total (monto + interés) |
| 21 | U | MONEDA FINAL | Moneda de cierre |
| 22 | V | APR ACUMULADO | APR acumulado |
| 23 | W | APR EFECTIVO DIARIO | APR efectivo diario |

### 3. Configurar Google Apps Script

1. En la hoja, ve a **Extensiones → Apps Script**
2. Crea un nuevo proyecto
3. Copia el contenido de `Codigo.gs`

#### Actualizar el ID de la hoja:

En `Codigo.gs`, línea 9:

```javascript
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
```

Para obtener el ID de tu hoja:
- Abre tu hoja de cálculo
- Mira la URL: `https://docs.google.com/spreadsheets/d/1g9JBdaZ7eAAha.../edit`
- El ID es la parte entre `/d/` y `/edit`: `1g9JBdaZ7eAAha...`

### 4. Desplegar la App Web

1. En Apps Script: **Deploy → New deployment**
2. Selecciona **Web app**
3. Configura:
   - **Description**: v1.0
   - **Execute as**: Me
   - **Who has access**: Only myself (o Anyone with Google Account si quieres compartir)
4. Click **Deploy**
5. Copia la **URL de la app** generada

---

## Cómo Usar la App

### Nueva Operación

1. Completa el formulario:
   - **Fecha y Hora de Inicio**: Hora de inicio (default 4:00 AM)
   - **CEX**: Exchange (Binance, Bybit, OKX, Bitget)
   - **Monto**: Cantidad a invertir
   - **Moneda**: USDT, ETH o BTC
   - **% APR**: Tasa anual esperada
   - **Tipo de Operación**: 
     - `Buy ETH low` = Comprar ETH bajo precio
     - `Sell ETH high` = Vender ETH alto precio
     - `Buy BTC low` = Comprar BTC bajo precio
     - `Sell BTC high` = Vender BTC alto precio
   - **Precio Objetivo**: Precio target

2. Click **Guardar Operación**

### Completar Operación

1. En "Operaciones en Curso", selecciona la moneda final en el dropdown
2. Confirma la finalización

### Editar Operación

1. Click en botón de editar (lápiz) en la fila
2. Modifica los valores
3. Click **Actualizar Operación**

### Eliminar Operación

1. Click en botón de eliminar (papelera)
2. Confirma la eliminación

---

## Estilos (Glassmorphism UI)

El UI usa efectos **glassmorphism** modernos con transparencia y patrones:

- **Fondo**: Negro (#050505) con grid sutil y orbes flotantes
- **Cards**: Efecto glass muy transparente con blur
- **Bordes**: Sutiles con glow verde (#00ff94)
- **Tipografía**: Inter (UI) + JetBrains Mono (números)
- **Responsive**: Optimizado para móvil con fuentes grandes

### Variables CSS Principales

```css
--primary: #00ff94       /* Verde - Principal */
--secondary: #00d4ff    /* Cyan */
--danger: #ff4d6d       /* Rojo */
--warning: #ffd166      /* Oro */
--dark: #050505         /* Fondo negro */
--dark-2: #080808      /* Fondo secundario */
--text: #eeeeee        /* Texto claro */
--text-muted: #777777   /* Texto muted */
```

### Características Visuales

- Fondo con patrón grid de 40x40px
- Textura noise sutil
- Cards con `backdrop-filter: blur(20px)`
- Bordes con highlight interno
- Animaciones suaves
- Skeleton loaders durante carga

---

## Solución de Problemas

### Error: "No se pudo conectar con Google Apps Script"

1. Verifica que la app esté desplegada correctamente
2. Confirma el SPREADSHEET_ID en Codigo.gs coincida con tu hoja
3. Verifica que la pestaña se llame exactamente "PRESTAMO"

### Error: "No hay operaciones"

1. Verifica que los datos empiecen en fila 20 (FIRST_DATA_ROW)
2. Confirma que las columnas E a W existan
3. Revisa los encabezados en fila 18

### La app no carga/en blanco

1. Abre la consola del navegador (F12 → Console)
2. Revisa los errores de JavaScript
3. Verifica la URL de despliegue sea correcta

### Duplicados en select CEX

- El código ya limpia el select antes de agregar opciones para evitar duplicados

---

## Detalles Técnicos

### Backend (Codigo.gs)

- **SPREADSHEET_ID**: ID único de la hoja
- **SHEET_NAME**: Nombre de la pestaña principal ("PRESTAMO")
- **FIRST_DATA_ROW**: Fila inicial de datos (20)
- **Columnas**: E (5) a W (23)

### Frontend (HTML/JS/CSS)

- UI Vanilla (sin frameworks)
- Glassmorphism verde/negro
- Eventos delegados para mejor rendimiento
- Skeleton loaders durante carga
- Optimizado para móvil

---

## Licencia

MIT License - Uso libre.