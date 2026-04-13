# Inversión Dual Manager 🚀

Un dashboard premium y de alto rendimiento diseñado para gestionar y rastrear operaciones de **Inversión Dual** (Dual Investment) en diferentes CEXs (Binance, Bybit, OKX, Bitget). Esta aplicación está construida sobre **Google Apps Script**, permitiendo una integración transparente con Google Sheets como base de datos.

## ✨ Características Principales

### 📊 Gestión de Operaciones
- **Seguimiento en Tiempo Real**: Visualiza tus operaciones activas e historial con datos actualizados automáticamente.
- **Sincronización Inteligente**: Los montos de las operaciones se extraen directamente de las fórmulas de las celdas, garantizando precisión matemática total.
- **Edición Avanzada**: Modal personalizado para desglosar sumandos de cuotas y capital, sincronizando notas de texto con operaciones matemáticas.

### ⚡ Rendimiento Optimizado
- **Skeleton Loaders**: Experiencia de carga fluida mediante marcadores de posición animados (skeletons) que reducen la percepción de espera.
- **Backend Caching**: Sistema de caché para el tipo de cambio USD (DollarHouse), acelerando los refrescos del dashboard en un 300%.
- **Delegación de Eventos**: Arquitectura de frontend eficiente que permite manejar grandes volúmenes de datos con un consumo mínimo de memoria.
- **Aceleración por GPU**: Animaciones y transiciones optimizadas para funcionar a 60fps constantes.

### 🧮 Herramientas Financieras
- **Calculadora Proyectada**: Estima el capital final y el interés acumulado en tiempo real basado en el APR y el tiempo de permanencia.
- **Resumen Financiero**: Cuadros automáticos que resumen tu patrimonio, objetivos y rendimiento acumulado.

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 (Modern Flexbox/Grid).
- **Backend**: Google Apps Script (GAS).
- **Base de Datos**: Google Sheets (Spreadsheet Service).
- **Integraciones**: DollarHouse API (Tipo de cambio).

## 🚀 Instalación y Uso

1. **Preparar la Hoja**: Asegúrate de tener una hoja llamada `PRESTAMO` con la estructura de columnas adecuada (iniciando en la fila 20 para datos).
2. **Abrir Apps Script**: En tu Google Sheet, ve a `Extensiones` -> `Apps Script`.
3. **Copiar Archivos**: 
   - Copia el contenido de `Codigo.gs` al editor.
   - Crea los archivos HTML (`Index.html`, `Scripts.html`, `Styles.html`) y pega su contenido respectivo.
4. **Desplegar**: Haz clic en el botón `Desplegar` -> `Nueva implementación` -> `Aplicación web`.
5. **Permisos**: Autoriza los permisos necesarios para que la script pueda leer tu hoja y realizar peticiones externas.

## 📱 Diseño Responsive
La interfaz está diseñada bajo principios de **Mobile First**, asegurando que puedas consultar y gestionar tus inversiones tanto en escritorio como en dispositivos móviles con la misma fluidez.

---
Desarrollado con ❤️ para la gestión eficiente de activos criptográficos.
