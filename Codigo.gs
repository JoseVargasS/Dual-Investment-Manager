/**
 * Aplicación Web de Gestión de Operaciones de Inversión Dual
 * Google Apps Script - Bound Script (Extensiones → Apps Script desde la hoja)
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const SPREADSHEET_ID = '1g9JBdaZ7eAAhaEjUf5pQs2YEzKAR2QYANXAJHMz0oJc';
const SHEET_NAME     = 'PRESTAMO';

// Los datos individuales empiezan en fila 20
// (filas 16-17: sección/encabezados, filas 16-19: filas fusionadas con totales)
const FIRST_DATA_ROW = 20;

// Columnas (1-indexado) - estructura REAL de la hoja:
// E=FECHA INICIO, F=FECHA FIN, G=CEX, H=MONTO, I=MONEDA
// J=%APR, K=TIPO, L=PRECIO OBJ.
// M=TIEMPO EN CEX, N=Tiempo(días), O=interés(no usado)
// P=total(no usado), Q=FINAL OBTENIDO (valor numérico)
// R=INTERÉS, S=TOTAL, T=no usado
// U=MONEDA FINAL (para completar la operación)
// V=APR ACUMULADO, W=APR EFECTIVO DIARIO
const COL_E            = 5;   // FECHA INICIO
const COL_F            = 6;   // FECHA FIN
const COL_G            = 7;   // CEX
const COL_H            = 8;   // MONTO
const COL_I            = 9;   // MONEDA
const COL_J            = 10;  // %APR
const COL_K            = 11;  // TIPO
const COL_L            = 12;  // PRECIO OBJ.
const COL_M            = 13;  // TIEMPO CEX
const COL_N            = 14;  // TIEMPO DIAS
const COL_O            = 15;  // DURACION
const COL_P            = 16;
const COL_Q            = 17;  // FINAL OBTENIDO
const COL_R            = 18;  // INTERES
const COL_S            = 19;  // TOTAL
const COL_T            = 20;
const COL_MONEDA_FINAL = 21;  // U (MONEDA FINAL)
const COL_V            = 22;  // APR ACUMULADO
const COL_W            = 23;  // APR EFECTIVO DIARIO

const NUM_COLS = 19; // Desde E hasta W inclusive (23 - 5 + 1 = 19)

// ============================================
// FUNCIONES DE PLANTILLA
// ============================================
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// PUNTO DE ENTRADA WEB
// ============================================
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Inversión Dual · Crypto Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ============================================
// HELPER: Obtener la hoja
// Intenta getActiveSpreadsheet() primero (bound script),
// si falla usa openById() como fallback (standalone script).
// ============================================
function getSheet() {
  let ss = null;

  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log('getActiveSpreadsheet falló: ' + e);
  }

  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      throw new Error('No se pudo acceder a la hoja. Error: ' + e.toString());
    }
  }

  if (!ss) throw new Error('No se pudo obtener la hoja de cálculo');

  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No se encontró la pestaña "' + SHEET_NAME + '"');

  return { sheet: sheet, ss: ss };
}

// ============================================
// HELPER: Serializar un valor de celda para JSON
// CRÍTICO: Los Date objects hacen que toda la respuesta
// de google.script.run se vuelva null si no se convierten.
// ============================================
function serCell(val) {
  if (val === null || val === undefined) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    try {
      const { ss } = getSheet();
      const tz = ss.getSpreadsheetTimeZone();
      return Utilities.formatDate(val, tz, 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return Utilities.formatDate(val, 'GMT-5', 'yyyy-MM-dd HH:mm:ss');
    }
  }
  if (typeof val === 'number') {
    return (isNaN(val) || !isFinite(val)) ? null : val;
  }
  if (typeof val === 'boolean') return val;
  return String(val);
}

// ============================================
// AGREGAR OPERACIÓN
// ============================================
function agregarOperacion(datos) {
  try {
    const { sheet, ss } = getSheet();

    // Buscar primera fila vacía desde FIRST_DATA_ROW
    let nuevaFila = FIRST_DATA_ROW;
    const lastRow = sheet.getLastRow();
    while (nuevaFila <= lastRow) {
      const val = sheet.getRange(nuevaFila, COL_E).getValue();
      if (!val || val.toString().trim() === '') break;
      nuevaFila++;
    }

    const tz = ss.getSpreadsheetTimeZone();
    
    // Parsear fecha local asegurando timezone de la hoja
    let fechaStr = datos.fechaInicio; 
    // Si viene de ISOString, reemplaza T y asegura segundos
    fechaStr = fechaStr.replace('T', ' ').substring(0, 16) + ':00'; // "2026-04-13 04:00:00"
    const fechaInicio = Utilities.parseDate(fechaStr, tz, "yyyy-MM-dd HH:mm:ss");

    // Fecha de fin: día siguiente a las 3:00 AM en la timezone de la hoja
    const diaStr    = Utilities.formatDate(new Date(fechaInicio.getTime() + 86400000), tz, 'yyyy-MM-dd');
    const fechaFin  = Utilities.parseDate(diaStr + ' 03:00:00', tz, 'yyyy-MM-dd HH:mm:ss');

    // Usar batch updates para mejorar el rendimiento
    const range = sheet.getRange(nuevaFila, COL_E, 1, NUM_COLS);
    const rowData = [
      fechaInicio,           // E
      fechaFin,              // F
      datos.cex,             // G
      datos.monto,           // H
      datos.moneda,          // I
      datos.apr / 100,       // J
      datos.tipoOperacion,   // K
      datos.precioObjetivo,  // L
      '',                    // M - TIEMPO CEX (vacío al inicio)
      '',                    // N - TIEMPO DIAS (vacío al inicio)
      '',                    // O - DURACION (vacía al inicio)
      '',                    // P
      '',                    // Q - FINAL OBTENIDO (vacío al inicio)
      '',                    // R - INTERES (vacío al inicio)
      '',                    // S - TOTAL (vacío al inicio)
      '',                    // T (vacío al inicio)
      '',                    // U - MONEDA FINAL (vacía al inicio)
      '',                    // V - APR ACUMULADO (vacío al inicio)
      ''                     // W - APR EFECTIVO DIARIO (vacío al inicio)
    ];
    
    range.setValues([rowData]);
    
    // Aplicar formatos numéricos
    sheet.getRange(nuevaFila, COL_E).setNumberFormat('dd/mm/yyyy hh:mm'); // FECHA INICIO
    sheet.getRange(nuevaFila, COL_F).setNumberFormat('dd/mm/yyyy hh:mm'); // FECHA FIN
    sheet.getRange(nuevaFila, COL_J).setNumberFormat('0.00%');           // %APR
    
    const montoCell = sheet.getRange(nuevaFila, COL_H);                  // MONTO
    if      (datos.moneda === 'USDT') montoCell.setNumberFormat('$#,##0.00');
    else if (datos.moneda === 'ETH')  montoCell.setNumberFormat('0.000000');
    else if (datos.moneda === 'BTC')  montoCell.setNumberFormat('0.000000');
    else                              montoCell.setNumberFormat('#,##0.00');

    SpreadsheetApp.flush(); // Asegura que se apliquen los cambios
    
    return { success: true, message: 'Operación agregada en fila ' + nuevaFila, fila: nuevaFila };

  } catch (error) {
    Logger.log('Error en agregarOperacion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// OBTENER OPERACIONES
// ============================================
function obtenerOperaciones() {
  try {
    const { sheet } = getSheet();
    const lastRow   = sheet.getLastRow();

    Logger.log('obtenerOperaciones: lastRow=' + lastRow + ', FIRST_DATA_ROW=' + FIRST_DATA_ROW);

    if (lastRow < FIRST_DATA_ROW) {
      return { success: true, activas: [], completadas: [] };
    }

    const numRows   = lastRow - FIRST_DATA_ROW + 1;
    const values    = sheet.getRange(FIRST_DATA_ROW, COL_E, numRows, NUM_COLS).getValues();

    const activas     = [];
    const completadas = [];

    for (let i = 0; i < values.length; i++) {
      const row = values[i];

      // Saltar filas sin fecha de inicio
      const fechaVal = row[0];
      if (!fechaVal || fechaVal.toString().trim() === '') continue;

      // Porcentajes: la hoja los guarda como decimales (0.6372 = 63.72%)
      function fmtPct(raw) {
        if (typeof raw === 'number' && isFinite(raw)) return (raw * 100).toFixed(2);
        const n = parseFloat(String(raw));
        return isNaN(n) ? '0.00' : (n * 100).toFixed(2);
      }

      const operacion = {
        fila:           FIRST_DATA_ROW + i,
        fechaInicio:    serCell(row[0]),   // E → ISO string
        fechaFin:       serCell(row[1]),   // F → ISO string
        cex:            serCell(row[2]),   // G
        monto:          serCell(row[3]),   // H
        moneda:         serCell(row[4]),   // I  ← siempre string o null
        apr:            fmtPct(row[5]),    // J
        tipoOperacion:  serCell(row[6]),   // K
        precioObjetivo: serCell(row[7]),   // L
        tiempoCex:      serCell(row[8]),   // M
        tiempoDias:     serCell(row[9]),   // N
        duracion:       serCell(row[10]),  // O - TIEMPO (ej. "23 hours")
        final:          serCell(row[15]),  // Q - FINAL OBTENIDO (valor numérico)
        interes:        serCell(row[13]),  // R - INTERÉS
        total:          serCell(row[14]),  // S - TOTAL
        monedaFinal:    serCell(row[16]),  // U - MONEDA FINAL (confirmación)
        aprAcum:        fmtPct(row[17]),   // V - APR ACUMULADO
        aprEfectivo:    fmtPct(row[18])    // W - APR EFECTIVO DIARIO
      };

      // Completada si U (col 21, row[16]) tiene valor
      const mf = row[16];
      if (mf !== null && mf !== undefined && mf.toString().trim() !== '') {
        completadas.push(operacion);
      } else {
        activas.push(operacion);
      }
    }

    Logger.log('Activas: ' + activas.length + ', Completadas: ' + completadas.length);

    return { success: true, activas: activas, completadas: completadas };

  } catch (error) {
    Logger.log('Error en obtenerOperaciones: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// ACCIONES DE ESTADO DE OPERAR (Completar, Eliminar, Actualizar)
// ============================================

function eliminarOperacionFila(fila) {
  try {
    const { sheet } = getSheet();
    sheet.deleteRow(fila);
    SpreadsheetApp.flush(); // Asegura que se apliquen los cambios
    return { success: true, message: 'Operación eliminada' };
  } catch (error) {
    Logger.log('Error eliminarOperacionFila: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function actualizarOperacionFila(datos) {
  try {
    const { sheet } = getSheet();
    const tz = sheet.getParent().getSpreadsheetTimeZone();
    
    let fechaStr = datos.fechaInicio; 
    fechaStr = fechaStr.replace('T', ' ').substring(0, 16) + ':00'; 
    const fechaInicio = Utilities.parseDate(fechaStr, tz, "yyyy-MM-dd HH:mm:ss");
    
    // Fecha de fin al día siguiente 3 AM
    const diaStr    = Utilities.formatDate(new Date(fechaInicio.getTime() + 86400000), tz, 'yyyy-MM-dd');
    const fechaFin  = Utilities.parseDate(diaStr + ' 03:00:00', tz, 'yyyy-MM-dd HH:mm:ss');
    
    const f = datos.fila;
    
    // Actualizar múltiples celdas a la vez para mejorar el rendimiento
    const range = sheet.getRange(f, COL_E, 1, 8); // Actualizamos desde E hasta K
    const rowData = [
      fechaInicio,           // E
      fechaFin,              // F
      datos.cex,             // G
      datos.monto,           // H
      datos.moneda,          // I
      datos.apr / 100,       // J
      datos.tipoOperacion,   // K
      datos.precioObjetivo   // L
    ];
    
    range.setValues([rowData]);
    
    // Aplicar formato a la celda de APR
    sheet.getRange(f, COL_J).setNumberFormat('0.00%');
    
    // Aplicar formato al monto
    const montoCell = sheet.getRange(f, COL_H);
    if      (datos.moneda === 'USDT') montoCell.setNumberFormat('$#,##0.00');
    else if (datos.moneda === 'ETH')  montoCell.setNumberFormat('0.000000');
    else if (datos.moneda === 'BTC')  montoCell.setNumberFormat('0.000000');
    else                              montoCell.setNumberFormat('#,##0.00');
    
    SpreadsheetApp.flush(); // Asegura que se apliquen los cambios
    return { success: true, message: 'Operación actualizada correctamente' };
  } catch (error) {
    Logger.log('Error actualizarOperacionFila: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function completarOperacion(fila, monedaFinal) {
  try {
    const { sheet } = getSheet();
    
    // Actualizar la moneda final
    sheet.getRange(fila, COL_MONEDA_FINAL).setValue(monedaFinal);
    
    // Calcular interés, total y otros valores derivados
    const monto = sheet.getRange(fila, COL_H).getValue();
    const apr = sheet.getRange(fila, COL_J).getValue(); // Ya es decimal (0.15 = 15%)
    const precioObj = sheet.getRange(fila, COL_L).getValue();
    
    // Calcular interés: monto * apr (ya que apr es decimal)
    const interes = monto * apr;
    
    // Calcular total: monto + interés
    const total = monto + interes;
    
    // Actualizar interés (R) y total (S)
    sheet.getRange(fila, COL_R).setValue(interes);
    sheet.getRange(fila, COL_S).setValue(total);
    
    // Calcular APR acumulado y efectivo diario (fórmulas simplificadas)
    // Aquí puedes poner tus propias fórmulas basadas en la lógica de negocio
    const aprAcumulado = apr; // Por ejemplo, usar el mismo valor inicialmente
    const aprEfectivoDiario = apr / 365; // Ejemplo: división simple entre 365 días
    
    sheet.getRange(fila, COL_V).setValue(aprAcumulado);
    sheet.getRange(fila, COL_W).setValue(aprEfectivoDiario);
    
    // Aplicar formatos
    sheet.getRange(fila, COL_R).setNumberFormat('$#,##0.00');
    sheet.getRange(fila, COL_S).setNumberFormat('$#,##0.00');
    sheet.getRange(fila, COL_V).setNumberFormat('0.00%');
    sheet.getRange(fila, COL_W).setNumberFormat('0.00%');
    
    SpreadsheetApp.flush(); // Asegura que se apliquen los cambios
    
    return { success: true, message: 'Operación completada correctamente' };
  } catch (error) {
    Logger.log('Error en completarOperacion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// OBTENER RESUMEN
// Usa getDisplayValues() para obtener los valores TAL COMO
// la hoja los muestra: fechas formateadas, porcentajes con %,
// moneda con $, solo 2 decimales — sin conversión adicional.
// ============================================
function obtenerResumen() {
  try {
    const { sheet } = getSheet();

    let cuadro1 = [], cuadro2 = [], cuadro3 = [];

    // 1. Actualizar el dólar antes de leer para que "Objetivos" tenga el valor fresco
    GetDollarHouse();
    SpreadsheetApp.flush();

    // getDisplayValues() → ya formateados por la hoja (strings siempre, nunca Date)
    try { cuadro1 = sheet.getRange('A3:B11').getDisplayValues(); }
    catch(e) { Logger.log('Error A3:B11: ' + e); }

    try { cuadro2 = sheet.getRange('E2:F5').getDisplayValues(); }
    catch(e) { Logger.log('Error E2:F5: ' + e); }

    try { cuadro3 = sheet.getRange('E7:F12').getDisplayValues(); }
    catch(e) { Logger.log('Error E7:F12: ' + e); }

    let notaB6 = '';
    try { notaB6 = sheet.getRange('B6').getNote() || ''; }
    catch(e) {}

    let formulaB6 = '';
    try { formulaB6 = sheet.getRange('B6').getFormula() || ''; }
    catch(e) {}

    let notaB4 = '';
    try { notaB4 = sheet.getRange('B4').getNote() || ''; }
    catch(e) {}

    let formulaB4 = '';
    try { formulaB4 = sheet.getRange('B4').getFormula() || ''; }
    catch(e) {}

    Logger.log('Resumen: cuadro1=' + cuadro1.length + ', cuadro2=' + cuadro2.length + ', cuadro3=' + cuadro3.length);

    return { 
      success: true, 
      cuadro1: cuadro1, 
      cuadro2: cuadro2, 
      cuadro3: cuadro3, 
      notaB6: notaB6, 
      notaB4: notaB4,
      formulaB6: formulaB6,
      formulaB4: formulaB4
    };

  } catch (error) {
    Logger.log('Error en obtenerResumen: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// OBTENER TIPO DE CAMBIO (DollarHouse)
// ============================================
function ExtractBetween(text, startStr, endStr) {
  var startIdx = text.indexOf(startStr);
  if (startIdx === -1) return null;
  startIdx += startStr.length;
  var endIdx = text.indexOf(endStr, startIdx);
  if (endIdx === -1) return null;
  return text.substring(startIdx, endIdx).trim();
}

function parseFlexibleNumber(str) {
  if (!str) return null;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function GetDollarHouse() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("dollar_rate");
  if (cached) {
    Logger.log("Usando tasa de cambio desde el caché: " + cached);
    return parseFloat(cached);
  }

  var { sheet } = getSheet();
  if (!sheet) return null;

  var url = 'https://app.dollarhouse.pe/';
  var options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  };
  
  try {
    var resp = UrlFetchApp.fetch(url, options);
    var code = resp.getResponseCode();
    if (code !== 200) {
      sheet.getRange('F2').setValue('N/A');
      return null;
    }

    var html = resp.getContentText();
    var buy = ExtractBetween(html, 'id="buy-exchange-rate">', '<');
    var buyNum = buy ? parseFlexibleNumber(buy) : null;

    if (buyNum !== null) {
      sheet.getRange('F2').setValue(buyNum);
      cache.put("dollar_rate", buyNum.toString(), 600); // 10 minutos (600 seg)
      return buyNum;
    } else {
      sheet.getRange('F2').setValue('N/A');
      return null;
    }
  } catch (e) {
    Logger.log("Error en GetDollarHouse: " + e.toString());
    return null;
  }
}

function actualizarCelda(celda, valor, nota) {
  try {
    const { sheet } = getSheet();
    const rango = sheet.getRange(celda || 'B6');
    // Guardar como número o fórmula si empieza con "="
    if (typeof valor === 'string' && valor.startsWith('=')) {
      rango.setFormula(valor);
    } else {
      const numVal = parseFloat(String(valor).replace(/[$,\s]/g, ''));
      rango.setValue(isNaN(numVal) ? valor : numVal);
    }

    if (nota !== undefined) {
      rango.setNote(nota);
    }

    // Forzar recalculo de fórmulas en toda la hoja (en especial Cuadro2: Objetivos)
    SpreadsheetApp.flush();
    return { success: true, message: 'Valor actualizado' };
  } catch (error) {
    Logger.log('Error en actualizarCelda: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}