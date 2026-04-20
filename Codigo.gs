/**
 * Aplicación Web de Gestión de Operaciones de Inversión Dual
 * Google Apps Script - Bound Script (Extensiones → Apps Script desde la hoja)
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const SPREADSHEET_ID = "1g9JBdaZ7eAAhaEjUf5pQs2YEzKAR2QYANXAJHMz0oJc";
const SHEET_NAME = "PRESTAMO";

// Los datos individuales empiezan en fila 20
const FIRST_DATA_ROW = 20;

// Columnas (1-indexado)
// E=FECHA INICIO, F=FECHA FIN, G=CEX, H=MONTO, I=MONEDA
// J=%APR, K=TIPO, L=PRECIO OBJ.
// M=TIEMPO CEX, N=TIEMPO DÍAS, O=DURACIÓN
// Q=FINAL OBTENIDO, R=INTERÉS, S=TOTAL
// U=MONEDA FINAL, V=APR ACUMULADO, W=APR EFECTIVO DIARIO
const COL = {
  FECHA_INICIO: 5,
  FECHA_FIN: 6,
  CEX: 7,
  MONTO: 8,
  MONEDA: 9,
  APR: 10,
  TIPO: 11,
  PRECIO_OBJ: 12,
  TIEMPO_CEX: 13,
  TIEMPO_DIAS: 14,
  DURACION: 15,
  FINAL: 17,
  INTERES: 18,
  TOTAL: 19,
  MONEDA_FINAL: 21,
  APR_ACUM: 22,
  APR_EFECTIVO: 23,
};

const NUM_COLS = 19; // Desde E hasta W (23 - 5 + 1)
const COLS_INPUT = 8; // Columnas E-L (entrada manual)

// ============================================
// HELPERS DE FECHA
// ============================================
// Convierte fecha ISO (from datetime-local input) a Date object
function parseFechaISO(fechaISO, tz) {
  const fechaStr = fechaISO.replace("T", " ").substring(0, 16) + ":00";
  return Utilities.parseDate(fechaStr, tz, "yyyy-MM-dd HH:mm:ss");
}

// Calcula fecha de fin: día siguiente a las 3:00 AM
function calcFechaFin(fechaInicio, tz) {
  const diaStr = Utilities.formatDate(
    new Date(fechaInicio.getTime() + 86400000),
    tz,
    "yyyy-MM-dd",
  );
  return Utilities.parseDate(diaStr + " 03:00:00", tz, "yyyy-MM-dd HH:mm:ss");
}

// Formatea porcentaje (decimal → string con %)
function fmtPct(raw) {
  if (typeof raw === "number" && isFinite(raw)) return (raw * 100).toFixed(2);
  const n = parseFloat(String(raw));
  return isNaN(n) ? "0.00" : (n * 100).toFixed(2);
}

// ============================================
// FUNCIONES DE PLANTILLA
// ============================================
// Incluir archivos HTML (Index, Styles, Scripts)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// PUNTO DE ENTRADA WEB
// ============================================
// Se ejecuta al abrir la URL de la web app
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  return template
    .evaluate()
    .setTitle("Inversión Dual · Crypto Dashboard")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0");
}

// ============================================
// HELPER: Obtener la hoja
// ============================================
// Retorna {sheet, ss} para operar con la hoja de cálculo
function getSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("getActiveSpreadsheet falló: " + e);
  }

  // Fallback: abrir por ID (standalone script)
  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      throw new Error("No se pudo acceder a la hoja: " + e.toString());
    }
  }

  if (!ss) throw new Error("No se pudo obtener la hoja de cálculo");

  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No se encontró la pestaña "' + SHEET_NAME + '"');

  return { sheet, ss };
}

// ============================================
// HELPER: Serializar valor para JSON
// ============================================
// Convierte valores de celda a tipos JSON válidos (Date → string)
function serCell(val) {
  if (val === null || val === undefined) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    try {
      const { ss } = getSheet();
      return Utilities.formatDate(
        val,
        ss.getSpreadsheetTimeZone(),
        "yyyy-MM-dd HH:mm:ss",
      );
    } catch (e) {
      return Utilities.formatDate(val, "GMT-5", "yyyy-MM-dd HH:mm:ss");
    }
  }
  if (typeof val === "number") return isNaN(val) || !isFinite(val) ? null : val;
  if (typeof val === "boolean") return val;
  return String(val);
}

// ============================================
// AGREGAR OPERACIÓN
// ============================================
// Crea una nueva fila con los datos de la operación (solo E-L)
// Las columnas M-W se calculan automáticamente en la hoja
function agregarOperacion(datos) {
  try {
    const { sheet, ss } = getSheet();
    const tz = ss.getSpreadsheetTimeZone();

    // Buscar primera fila vacía desde FIRST_DATA_ROW
    let nuevaFila = FIRST_DATA_ROW;
    const lastRow = sheet.getLastRow();
    while (nuevaFila <= lastRow) {
      const val = sheet.getRange(nuevaFila, COL.FECHA_INICIO).getValue();
      if (!val || val.toString().trim() === "") break;
      nuevaFila++;
    }

    // Calcular fechas de inicio y fin
    const fechaInicio = parseFechaISO(datos.fechaInicio, tz);
    const fechaFin = calcFechaFin(fechaInicio, tz);

    // Datos para columnas E-L (entrada manual del usuario)
    const rowData = [
      fechaInicio,
      fechaFin,
      datos.cex,
      datos.monto,
      datos.moneda,
      datos.apr / 100, // APR como decimal
      datos.tipoOperacion,
      datos.precioObjetivo,
    ];

    // Escribir en la hoja
    const range = sheet.getRange(nuevaFila, COL.FECHA_INICIO, 1, COLS_INPUT);
    range.setValues([rowData]);

    // Aplicar formatos
    sheet
      .getRange(nuevaFila, COL.FECHA_INICIO)
      .setNumberFormat("dd/mm/yyyy hh:mm");
    sheet
      .getRange(nuevaFila, COL.FECHA_FIN)
      .setNumberFormat("dd/mm/yyyy hh:mm");
    sheet.getRange(nuevaFila, COL.APR).setNumberFormat("0.00%");

    const fmtMonto = datos.moneda === "USDT" ? "$#,##0.00" : "0.000000";
    sheet.getRange(nuevaFila, COL.MONTO).setNumberFormat(fmtMonto);

    return {
      success: true,
      message: "Operación agregada en fila " + nuevaFila,
      fila: nuevaFila,
    };
  } catch (error) {
    Logger.log("Error en agregarOperacion: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// OBTENER OPERACIONES
// ============================================
// Lee todas las operaciones de la hoja y las separa en activas y completadas
function obtenerOperaciones() {
  try {
    const { sheet } = getSheet();
    const lastRow = sheet.getLastRow();

    Logger.log(
      "obtenerOperaciones: lastRow=" +
        lastRow +
        ", FIRST_DATA_ROW=" +
        FIRST_DATA_ROW,
    );

    if (lastRow < FIRST_DATA_ROW)
      return { success: true, activas: [], completadas: [] };

    // Leer todas las filas con datos
    const numRows = lastRow - FIRST_DATA_ROW + 1;
    const values = sheet
      .getRange(FIRST_DATA_ROW, COL.FECHA_INICIO, numRows, NUM_COLS)
      .getValues();

    const activas = [];
    const completadas = [];

    // Procesar cada fila
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const fechaVal = row[0];
      if (!fechaVal || fechaVal.toString().trim() === "") continue;

      // Crear objeto operación con los datos de la fila
      const operacion = {
        fila: FIRST_DATA_ROW + i,
        fechaInicio: serCell(row[0]),
        fechaFin: serCell(row[1]),
        cex: serCell(row[2]),
        monto: serCell(row[3]),
        moneda: serCell(row[4]),
        apr: fmtPct(row[5]),
        tipoOperacion: serCell(row[6]),
        precioObjetivo: serCell(row[7]),
        tiempoCex: serCell(row[8]),
        tiempoDias: serCell(row[9]),
        duracion: serCell(row[10]),
        final: serCell(row[15]), // T - Final obtenido (con símbolo)
        interes: serCell(row[13]),
        total: serCell(row[14]),
        monedaFinal: serCell(row[16]), // U - Moneda final
        aprAcum: fmtPct(row[17]),
        aprEfectivo: fmtPct(row[18]),
      };

      // Clasificar: tiene MONEDA_FINAL → completada, si no → activa
      const mf = row[16];
      if (mf !== null && mf !== undefined && mf.toString().trim() !== "") {
        completadas.push(operacion);
      } else {
        activas.push(operacion);
      }
    }

    Logger.log(
      "Activas: " + activas.length + ", Completadas: " + completadas.length,
    );
    return { success: true, activas: activas, completadas: completadas };
  } catch (error) {
    Logger.log("Error en obtenerOperaciones: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// ELIMINAR OPERACIÓN
// ============================================
// Elimina la fila de la operación
function eliminarOperacionFila(fila) {
  try {
    const { sheet } = getSheet();
    sheet.deleteRow(fila);
    SpreadsheetApp.flush();
    return { success: true, message: "Operación eliminada" };
  } catch (error) {
    Logger.log("Error eliminarOperacionFila: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// ACTUALIZAR OPERACIÓN
// ============================================
// Actualiza los datos de una operación existente (solo E-L)
function actualizarOperacionFila(datos) {
  try {
    const { sheet, ss } = getSheet();
    const tz = ss.getSpreadsheetTimeZone();

    // Calcular nuevas fechas
    const fechaInicio = parseFechaISO(datos.fechaInicio, tz);
    const fechaFin = calcFechaFin(fechaInicio, tz);

    const f = datos.fila;
    const rowData = [
      fechaInicio,
      fechaFin,
      datos.cex,
      datos.monto,
      datos.moneda,
      datos.apr / 100,
      datos.tipoOperacion,
      datos.precioObjetivo,
    ];

    const range = sheet.getRange(f, COL.FECHA_INICIO, 1, COLS_INPUT);
    range.setValues([rowData]);

    // Aplicar formatos
    sheet.getRange(f, COL.APR).setNumberFormat("0.00%");
    const fmtMonto = datos.moneda === "USDT" ? "$#,##0.00" : "0.000000";
    sheet.getRange(f, COL.MONTO).setNumberFormat(fmtMonto);

    SpreadsheetApp.flush();
    return { success: true, message: "Operación actualizada correctamente" };
  } catch (error) {
    Logger.log("Error actualizarOperacionFila: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// COMPLETAR OPERACIÓN
// ============================================
// Marca la operación como completada ingresando la moneda final (columna U)
// Las columnas M-W se calculan automáticamente en la hoja
function completarOperacion(fila, monedaFinal) {
  try {
    const { sheet } = getSheet();
    sheet.getRange(fila, COL.MONEDA_FINAL).setValue(monedaFinal);
    SpreadsheetApp.flush();
    return { success: true, message: "Operación completada correctamente" };
  } catch (error) {
    Logger.log("Error en completarOperacion: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// OBTENER RESUMEN
// ============================================
// Obtiene los datos de los cuadros de resumen de la hoja
function obtenerResumen() {
  try {
    const { sheet } = getSheet();

    let cuadro1 = [],
      cuadro2 = [],
      cuadro3 = [];
    let notaB6 = "",
      formulaB6 = "",
      notaB4 = "",
      formulaB4 = "";

    // Actualizar dólar antes de leer (para valores frescos)
    GetDollarHouse();
    SpreadsheetApp.flush();

    // Obtener valores formateados de cada cuadro
    try {
      cuadro1 = sheet.getRange("A3:B11").getDisplayValues();
    } catch (e) {
      Logger.log("Error A3:B11: " + e);
    }
    try {
      cuadro2 = sheet.getRange("E2:F5").getDisplayValues();
    } catch (e) {
      Logger.log("Error E2:F5: " + e);
    }
    try {
      cuadro3 = sheet.getRange("E7:F12").getDisplayValues();
    } catch (e) {
      Logger.log("Error E7:F12: " + e);
    }

    // Obtener notas y fórmulas de celdas editables
    try {
      notaB6 = sheet.getRange("B6").getNote() || "";
    } catch (e) {}
    try {
      formulaB6 = sheet.getRange("B6").getFormula() || "";
    } catch (e) {}
    try {
      notaB4 = sheet.getRange("B4").getNote() || "";
    } catch (e) {}
    try {
      formulaB4 = sheet.getRange("B4").getFormula() || "";
    } catch (e) {}

    Logger.log(
      "Resumen: cuadro1=" +
        cuadro1.length +
        ", cuadro2=" +
        cuadro2.length +
        ", quadro3=" +
        cuadro3.length,
    );

    return {
      success: true,
      cuadro1,
      cuadro2,
      cuadro3,
      notaB6,
      notaB4,
      formulaB6,
      formulaB4,
    };
  } catch (error) {
    Logger.log("Error en obtenerResumen: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// DOLLARHOUSE
// ============================================
// Extrae texto entre dos delimitadores
function extractBetween(text, startStr, endStr) {
  const startIdx = text.indexOf(startStr);
  if (startIdx === -1) return null;
  return text
    .substring(
      startIdx + startStr.length,
      text.indexOf(endStr, startIdx + startStr.length),
    )
    .trim();
}

// Obtiene el tipo de cambio del dólar desde DollarHouse
// Usa caché para evitar solicitudes frecuentes
function GetDollarHouse() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("dollar_rate");
  if (cached) return parseFloat(cached); // Retorna caché si existe

  const { sheet } = getSheet();
  if (!sheet) return null;

  try {
    // Fetch a DollarHouse
    const resp = UrlFetchApp.fetch("https://app.dollarhouse.pe/", {
      method: "get",
      muteHttpExceptions: true,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (resp.getResponseCode() !== 200) {
      sheet.getRange("F2").setValue("N/A");
      return null;
    }

    const html = resp.getContentText();
    const buy = extractBetween(html, 'id="buy-exchange-rate">', "<");
    const buyNum = buy ? parseFloat(buy.replace(/[^0-9.]/g, "")) : null;

    if (buyNum && !isNaN(buyNum)) {
      sheet.getRange("F2").setValue(buyNum);
      cache.put("dollar_rate", buyNum.toString(), 60); // Caché 1 minuto
      return buyNum;
    } else {
      sheet.getRange("F2").setValue("N/A");
      return null;
    }
  } catch (e) {
    Logger.log("Error en GetDollarHouse: " + e);
    return null;
  }
}

// ============================================
// ACTUALIZAR CELDA
// ============================================
// Actualiza una celda específica con valor o fórmula
function actualizarCelda(celda, valor, nota) {
  try {
    const { sheet } = getSheet();
    const rango = sheet.getRange(celda || "B6");

    // Si empieza con "=", guardar como fórmula
    if (typeof valor === "string" && valor.startsWith("=")) {
      rango.setFormula(valor);
    } else {
      const numVal = parseFloat(String(valor).replace(/[$,\s]/g, ""));
      rango.setValue(isNaN(numVal) ? valor : numVal);
    }
    if (nota !== undefined) rango.setNote(nota);
    SpreadsheetApp.flush();
    return { success: true, message: "Valor actualizado" };
  } catch (error) {
    Logger.log("Error en actualizarCelda: " + error);
    return { success: false, message: error.toString() };
  }
}
