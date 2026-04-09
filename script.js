/**
 * Lee y valida las coordenadas ingresadas en el formulario HTML.
 * @returns {{x0,y0,x1,y1}|null} Objeto con coordenadas o null si hay error.
 */
function leerCoordenadas() {
  // Obtener los valores de los inputs y convertirlos a entero
  const x0 = parseInt(document.getElementById('x0').value, 10);
  const y0 = parseInt(document.getElementById('y0').value, 10);
  const x1 = parseInt(document.getElementById('x1').value, 10);
  const y1 = parseInt(document.getElementById('y1').value, 10);

  // Verificar que todos sean números válidos
  if (isNaN(x0) || isNaN(y0) || isNaN(x1) || isNaN(y1)) {
    alert('Por favor ingresa valores numéricos enteros en todos los campos.');
    return null;
  }

  return { x0, y0, x1, y1 };
}

document.getElementById('btnDibujar').addEventListener('click', function () {
  const coords = leerCoordenadas();
  if (coords === null) return;

  const { x0, y0, x1, y1 } = coords;

  const canvas = document.getElementById('canvas');
  const ctx    = canvas.getContext('2d');

  // Limpiar el canvas antes de dibujar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calcular rango de coordenadas con un pequeño margen de 1 unidad
  const xMin = Math.min(x0, x1) - 1;
  const xMax = Math.max(x0, x1) + 1;
  const yMin = Math.min(y0, y1) - 1;
  const yMax = Math.max(y0, y1) + 1;

  // Crear transformación de coordenadas
  const transf = crearTransformacion(canvas, xMin, xMax, yMin, yMax);

  /**
   * Función plot: dibuja un píxel lógico (x,y) en el canvas
   * como un rectángulo relleno del tamaño de una celda.
   * @param {number} x - Coordenada lógica X.
   * @param {number} y - Coordenada lógica Y.
   */
  function plot(x, y) {
    const { px, py } = transf.toPixel(x, y);
    ctx.fillStyle = '#7fdbff';  // Color azul-cian para los píxeles de la línea
    ctx.fillRect(
      px - transf.escalaX / 2,  // Esquina superior izquierda de la celda
      py - transf.escalaY / 2,
      transf.escalaX - 1,       // Dejar 1px de separación entre celdas
      transf.escalaY - 1
    );
  }

  // Ejecutar el algoritmo de Bresenham
  bresenham(x0, y0, x1, y1, plot);
});// Escuchar el clic del botón
document.getElementById('btnDibujar').addEventListener('click', function () {
  const coords = leerCoordenadas();
  if (coords === null) return; // Salir si hay error

  // Confirmación temporal en consola (se reemplazará en siguientes commits)
  console.log('Coordenadas leídas:', coords);
})

/**
 * Implementación del algoritmo de líneas de Bresenham.
 * Traza una línea entera entre dos puntos usando solo aritmética entera.
 * @param {number} x0 - Coordenada X inicial.
 * @param {number} y0 - Coordenada Y inicial.
 * @param {number} x1 - Coordenada X final.
 * @param {number} y1 - Coordenada Y final.
 * @param {Function} plot - Función callback para dibujar el píxel en (x, y).
 *                          Firma: plot(x, y)
 */
function bresenham(x0, y0, x1, y1, plot) {
  // Cálculo de diferenciales y dirección del paso
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;  // Dirección en X: derecha (+1) o izquierda (-1)
  let sy = (y0 < y1) ? 1 : -1;  // Dirección en Y: abajo (+1) o arriba (-1)
  let err = dx - dy;             // Error inicial: diferencia de diferenciales

  while (true) {
    // Dibujar el punto actual
    plot(x0, y0);

    // Condición de finalización: llegamos al punto destino
    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;  // Doble del error para las comparaciones

    // Ajuste en el eje X: si el error doble supera -dy, avanzamos en X
    if (e2 > -dy) {
      err -= dy;
      x0  += sx;
    }

    // Ajuste en el eje Y: si el error doble es menor que dx, avanzamos en Y
    if (e2 < dx) {
      err += dx;
      y0  += sy;
    }
  }
}

/**
 * Ejecuta el algoritmo de Bresenham y devuelve un registro detallado
 * de cada iteración, útil para poblar la tabla de pasos.
 * @param {number} x0 - Coordenada X inicial.
 * @param {number} y0 - Coordenada Y inicial.
 * @param {number} x1 - Coordenada X final.
 * @param {number} y1 - Coordenada Y final.
 * @returns {Array<{paso, x, y, err, e2}>} Lista de estados por iteración.
 */
function bresenhamConRegistro(x0, y0, x1, y1) {
  let dx  = Math.abs(x1 - x0);
  let dy  = Math.abs(y1 - y0);
  let sx  = (x0 < x1) ? 1 : -1;
  let sy  = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  const pasos = [];  // Aquí guardaremos cada estado
  let paso = 0;

  while (true) {
    let e2 = 2 * err;

    // Guardar estado ANTES de mover el punto
    pasos.push({ paso: paso++, x: x0, y: y0, err, e2 });

    if (x0 === x1 && y0 === y1) break;

    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx)  { err += dx; y0 += sy; }
  }

  return pasos;
}


// Márgenes reservados para los ejes numéricos (izquierda e inferior)
const MARGEN_IZQ  = 50;  // píxeles para el eje Y (números a la izquierda)
const MARGEN_INF  = 40;  // píxeles para el eje X (números abajo)
const MARGEN_TOP  = 20;  // pequeño margen superior
const MARGEN_DER  = 20;  // pequeño margen derecho

/**
 * Calcula los parámetros de transformación para mapear coordenadas
 * lógicas (del usuario) al espacio de píxeles disponible en el canvas.
 *
 * La transformación considera los márgenes reservados para los ejes
 * numéricos y mantiene la proporción 1:1 entre X e Y.
 *
 * @param {HTMLCanvasElement} canvas - El elemento canvas.
 * @param {number} xMin - Valor lógico mínimo en X.
 * @param {number} xMax - Valor lógico máximo en X.
 * @param {number} yMin - Valor lógico mínimo en Y.
 * @param {number} yMax - Valor lógico máximo en Y.
 * @returns {{ toPixel: Function }} Objeto con función de conversión.
 */
function crearTransformacion(canvas, xMin, xMax, yMin, yMax) {
  // Área de dibujo disponible (descontando márgenes)
  const anchoUtil = canvas.width  - MARGEN_IZQ - MARGEN_DER;
  const altoUtil  = canvas.height - MARGEN_INF - MARGEN_TOP;

  // Escala: cuántos píxeles corresponden a 1 unidad lógica
  const escalaX = anchoUtil / (xMax - xMin + 1);
  const escalaY = altoUtil  / (yMax - yMin + 1);

  /**
   * Convierte un punto en coordenadas lógicas a píxeles del canvas.
   * El eje Y se invierte porque en canvas Y crece hacia abajo,
   * pero en matemáticas Y crece hacia arriba.
   * @param {number} x - Coordenada lógica X.
   * @param {number} y - Coordenada lógica Y.
   * @returns {{px: number, py: number}} Posición en píxeles.
   */
  function toPixel(x, y) {
    const px = MARGEN_IZQ + (x - xMin) * escalaX + escalaX / 2;
    // Invertir Y: yMax queda arriba, yMin queda abajo
    const py = MARGEN_TOP + (yMax - y) * escalaY + escalaY / 2;
    return { px, py };
  }

  return { toPixel, escalaX, escalaY, xMin, xMax, yMin, yMax };
}

/**
 * Dibuja las marcas de escala numérica en los ejes del canvas.
 * Eje Y en el lado izquierdo, eje X en el lado inferior.
 * Las marcas se alinean con las celdas de la cuadrícula lógica.
 *
 * @param {CanvasRenderingContext2D} ctx - Contexto 2D del canvas.
 * @param {{ toPixel, escalaX, escalaY, xMin, xMax, yMin, yMax }} transf
 *   - Objeto de transformación generado por crearTransformacion().
 */
function dibujarEjes(ctx, transf) {
  ctx.fillStyle   = '#888';   // Color gris para etiquetas de eje
  ctx.strokeStyle = '#333';   // Color gris oscuro para líneas de marca
  ctx.font        = '10px monospace';
  ctx.textAlign   = 'right';
  ctx.textBaseline = 'middle';

  // ── Eje Y: marcas en el lado izquierdo ──
  for (let y = transf.yMin; y <= transf.yMax; y++) {
    const { py } = transf.toPixel(transf.xMin, y);

    // Pequeña línea horizontal como marca de escala
    ctx.beginPath();
    ctx.moveTo(MARGEN_IZQ - 4, py);
    ctx.lineTo(MARGEN_IZQ, py);
    ctx.stroke();

    // Etiqueta numérica
    ctx.fillText(y, MARGEN_IZQ - 6, py);
  }

  // ── Eje X: marcas en el lado inferior ──
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';

  const yInferior = ctx.canvas.height - MARGEN_INF + 4;  // Posición Y de las etiquetas

  for (let x = transf.xMin; x <= transf.xMax; x++) {
    const { px } = transf.toPixel(x, transf.yMin);

    // Pequeña línea vertical como marca de escala
    ctx.beginPath();
    ctx.moveTo(px, ctx.canvas.height - MARGEN_INF);
    ctx.lineTo(px, ctx.canvas.height - MARGEN_INF + 4);
    ctx.stroke();

    // Etiqueta numérica
    ctx.fillStyle = '#888';
    ctx.fillText(x, px, yInferior);
  }

  // ── Líneas de eje principales ──
  ctx.strokeStyle = '#444';
  ctx.lineWidth   = 1;

  // Línea vertical del eje Y
  ctx.beginPath();
  ctx.moveTo(MARGEN_IZQ, MARGEN_TOP);
  ctx.lineTo(MARGEN_IZQ, ctx.canvas.height - MARGEN_INF);
  ctx.stroke();

  // Línea horizontal del eje X
  ctx.beginPath();
  ctx.moveTo(MARGEN_IZQ, ctx.canvas.height - MARGEN_INF);
  ctx.lineTo(ctx.canvas.width - MARGEN_DER, ctx.canvas.height - MARGEN_INF);
  ctx.stroke();
}