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
});
