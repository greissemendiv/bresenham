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

// Escuchar el clic del botón
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