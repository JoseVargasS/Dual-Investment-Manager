# Inversión Dual - Crypto Dashboard

Aplicación web optimizada para gestionar y seguir operaciones de inversión dual en criptomonedas (BTC, ETH, USDT). Versión mejorada con optimizaciones de rendimiento y código refactorizado.

## 🚀 Mejoras Implementadas

### **Optimizaciones de Rendimiento**

- **Reducción de llamadas a SpreadsheetApp.flush()**: Solo cuando es estrictamente necesario
- **Batch operations**: Formateo y escritura en lotes para mejorar velocidad
- **DOM caching**: Referencias a elementos DOM almacenadas en caché
- **Event delegation**: Eventos delegados para mejor rendimiento en tablas dinámicas
- **Debounce utility**: Para inputs que requieren procesamiento

### **Mejoras de Código**

- **Manejo robusto de fechas**: UTC para evitar problemas de timezone
- **Validación mejorada**: Formularios con validación en tiempo real
- **Error handling**: Manejo de errores consistente y logging
- **Refactorización**: Código más limpio y mantenible
- **Optimizaciones CSS**: Archivo CSS organizado y optimizado

### **Correcciones de Bugs**

- **Date handling**: Corrección de problemas de timezone en fechas
- **DOM caching**: Uso consistente de referencias almacenadas
- **Form validation**: Validación más robusta de campos numéricos
- **Error reporting**: Mensajes de error más informativos

## 📁 Estructura del Proyecto

```
Dual Investment Manager/
├── Index.html      # Plantilla principal HTML (optimizada)
├── Styles.html     # Estilos CSS (Glassmorphism UI - optimizado)
├── Scripts.html    # Lógica JavaScript del cliente (refactorizado)
├── Codigo.gs       # Google Apps Script (backend - optimizado)
└── README.md       # Este archivo (actualizado)
```

## 📋 Requisitos

- Cuenta de Google
- Google Sheets (Google Drive)
- Acceso a Google Apps Script

---

## 🛠️ Cómo Crear la Hoja de Google

### 1. Crear Nueva Hoja de Cálculo

1. Ve a [sheet.new](https://sheet.new) o [drive.google.com](https://drive.google.com)
2. Crea una **Nueva hoja de cálculo** en blanco
3. Nombra el archivo: `Inversión Dual - Dashboard`

### 2. Configurar Pestañas

La app usa **1 pestaña principal**:

#### Pestaña: `PRESTAMO`

| Fila   | Contenido                                 |
| ------ | ----------------------------------------- |
| 1-15   | Reserved (totales y configuraciones)      |
| 16-17  | Encabezados de sección                    |
| **18** | Headers de columnas                       |
| **20** | **Inicio de datos (FIRST_DATA_ROW = 20)** |
| 21+    | Operaciones activas/completadas           |

##### Estructura de Columnas (Desde columna E = columna 5):

| #   | Letra | Campo               | Descripción                            |
| --- | ----- | ------------------- | -------------------------------------- |
| 5   | E     | FECHA INICIO        | Fecha y hora de inicio                 |
| 6   | F     | FECHA FIN           | Fecha de finalización                  |
| 7   | G     | CEX                 | Exchange (Binance, Bybit, OKX, Bitget) |
| 8   | H     | MONTO               | Monto inicial invertido                |
| 9   | I     | MONEDA              | Moneda (USDT, ETH, BTC)                |
| 10  | J     | %APR                | Tasa APR anual                         |
| 11  | K     | TIPO                | Tipo operación (Buy/Sell ETH/BTC)      |
| 12  | L     | PRECIO OBJ.         | Precio objetivo                        |
| 13  | M     | TIEMPO CEX          | Tiempo en CEX (días)                   |
| 14  | N     | DURACION            | Duración (horas)                       |
| 17  | Q     | FINAL OBTENIDO      | Monto final recibido                   |
| 18  | R     | INTERÉS             | Interés generado                       |
| 19  | S     | TOTAL               | Total (monto + interés)                |
| 21  | U     | MONEDA FINAL        | Moneda de cierre                       |
| 22  | V     | APR ACUMULADO       | APR acumulado                          |
| 23  | W     | APR EFECTIVO DIARIO | APR efectivo diario                    |

### 3. Configurar Google Apps Script

1. En la hoja, ve a **Extensiones → Apps Script**
2. Crea un nuevo proyecto
3. Copia el contenido de `Codigo.gs`

#### Actualizar el ID de la hoja:

En `Codigo.gs`, línea 9:

```javascript
const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI";
```

Para obtener el ID de tu hoja:

- Abre tu hoja de cálculo
- Mira la URL: `https://docs.google.com/spreadsheets/d/1g9JBdaZ7eAAha.../edit`
- El ID es la parte entre `/d/` y `/edit`: `1g9JBdaZ7eAAha...`

### 4. Desplegar la App Web

1. En Apps Script: **Deploy → New deployment**
2. Selecciona **Web app**
3. Configura:
   - **Description**: v2.0 (optimizado)
   - **Execute as**: Me
   - **Who has access**: Only myself (o Anyone with Google Account si quieres compartir)
4. Click **Deploy**
5. Copia la **URL de la app** generada

---

## 📱 Cómo Usar la App

### Nueva Operación

1. Completa el formulario:
   - **Fecha y Hora de Inicio**: Hora de inicio (default 4:00 AM UTC)
   - **CEX**: Exchange (Binance, Bybit, OKX, Bitget)
   - **Monto**: Cantidad a invertir (decimales automáticos según moneda)
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

### Calculadora Interactiva

1. En la sección "Resultados", edita los valores de:
   - **%APR**: Tasa de interés anual
   - **Días**: Período de inversión
   - **Retiro mensual**: Monto a retirar mensualmente
2. El **Capital Final** se recalcula automáticamente

---

## 🎨 Estilos (Glassmorphism UI Optimizado)

El UI usa efectos **glassmorphism** modernos con optimizaciones de rendimiento:

- **Fondo**: Negro (#050505) con grid sutil y orbes flotantes
- **Cards**: Efecto glass muy transparente con blur (optimizado para GPU)
- **Bordes**: Sutiles con glow verde (#00ff94)
- **Tipografía**: Inter (UI) + JetBrains Mono (números)
- **Responsive**: Optimizado para móvil con fuentes grandes
- **Animaciones**: Suaves con `requestAnimationFrame`

### Variables CSS Principales

```css
--primary: #00ff94 /* Verde - Principal */ --secondary: #00d4ff /* Cyan */
  --danger: #ff4d6d /* Rojo */ --warning: #ffd166 /* Oro */ --dark: #050505
  /* Fondo negro */ --dark-2: #080808 /* Fondo secundario */ --text: #eeeeee
  /* Texto claro */ --text-muted: #777777 /* Texto muted */;
```

### Optimizaciones Implementadas

- **CSS organizado**: Mejor estructura y comentarios
- **Performance**: Animaciones optimizadas con `will-change`
- **Mobile-first**: Diseño responsivo mejorado
- **Accessibility**: Mejor contraste y semántica

---

## 🔧 Solución de Problemas

### Error: "No se pudo conectar con Google Apps Script"

1. Verifica que la app esté desplegada correctamente
2. Confirma el SPREADSHEET_ID en Codigo.gs coincida con tu hoja
3. Verifica que la pestaña se llame exactamente "PRESTAMO"
4. Revisa los permisos de ejecución en Apps Script

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

## 🔍 Detalles Técnicos (Optimizados)

### Backend (Codigo.gs - Optimizado)

- **SPREADSHEET_ID**: ID único de la hoja
- **SHEET_NAME**: Nombre de la pestaña principal ("PRESTAMO")
- **FIRST_DATA_ROW**: Fila inicial de datos (20)
- **Columnas**: E (5) a W (23)
- **Batch operations**: Formateo y escritura en lotes
- **Cache**: Cache de tasa de cambio (10 minutos)
- **Logging**: Logger integrado para debugging

### Frontend (HTML/JS/CSS - Optimizado)

- **UI Vanilla**: Sin frameworks, máximo rendimiento
- **Glassmorphism**: Efectos visuales optimizados para GPU
- **DOM caching**: Referencias almacenadas para acceso rápido
- **Event delegation**: Eventos delegados para mejor rendimiento
- **Skeleton loaders**: Indicadores de carga optimizados
- **Responsive**: Mobile-first con breakpoints optimizados
- **Accessibility**: Mejor semántica y contraste

### Optimizaciones de Rendimiento

1. **Reducción de SpreadsheetApp.flush()**: Solo cuando es necesario
2. **Batch formatting**: Aplicación de formatos en lotes
3. **DOM caching**: Evita búsquedas repetidas de elementos
4. **Event delegation**: Menos listeners, mejor rendimiento
5. **Debounce**: Para inputs que requieren procesamiento
6. **requestAnimationFrame**: Animaciones suaves

### Manejo de Errores

- **Validación en tiempo real**: Formularios con validación inmediata
- **Mensajes informativos**: Errores claros y específicos
- **Fallbacks**: Alternativas cuando fallan operaciones
- **Logging**: Registro detallado para debugging

---

## 📊 Características Principales

### ✅ Gestión de Operaciones

- Agregar nuevas operaciones
- Editar operaciones existentes
- Completar operaciones con moneda final
- Eliminar operaciones con confirmación

### 📈 Dashboard de Resumen

- Resumen BBVA con valores actualizados
- Objetivos con tasa de cambio en tiempo real
- Calculadora interactiva de resultados
- Visualización de APR acumulado y efectivo

### 🎨 UI Moderna

- Glassmorphism con efectos blur
- Animaciones suaves
- Diseño responsive
- Temas oscuro/verde

### 🔄 Sincronización en Tiempo Real

- Actualización automática de datos
- Cache de tasa de cambio
- Feedback visual inmediato
- Skeleton loaders durante carga

---

## 🚀 Próximas Mejoras (Roadmap)

### Fase 1 - Optimizaciones (Completado)

- ✅ Refactorización de código
- ✅ Optimización de rendimiento
- ✅ Mejora de manejo de errores
- ✅ Documentación actualizada

### Fase 2 - Nuevas Funcionalidades (Planeado)

- Gráficos de rendimiento
- Exportación de datos (CSV/PDF)
- Notificaciones push
- Multi-usuario con permisos

### Fase 3 - Escalabilidad (Futuro)

- API REST para integraciones
- Dashboard multi-exchange
- Análisis predictivo
- Mobile app nativa

---

## 📝 Licencia

MIT License - Uso libre.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para soporte o preguntas:

- Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
- Abre un issue en el repositorio
- Contacta al desarrollador principal

---

**Versión**: 2.0 (Optimizada)  
**Última actualización**: Abril 2026  
**Estado**: ✅ Producción
