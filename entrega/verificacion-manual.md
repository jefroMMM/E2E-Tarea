# Verificación manual real - 23 de octubre de 2026

Realizada en el navegador contra http://127.0.0.1:3000:

- Menú con nombres, precios y existencias; té agotado con botón deshabilitado.
- Agregar café: Q 15.00. Aumentar a 2: Q 30.00. Disminuir a 1: Q 15.00.
- Editar a 0: validación; conserva cantidad 1.
- Editar a 21 con stock 20: mensaje de existencias; conserva cantidad 1.
- Eliminar: carrito vacío y total Q 0.00.
- Confirmar vacío: mensaje de agregar al menos un producto.
- Agregar 2 cafés y 1 pan: total Q 48.00.
- Confirmar: mensaje de éxito, UUID y total Q 48.00. Carrito vacío; stock café 18 y pan 7.
- API consultada aparte: total 4800 centavos y dos líneas persistidas; validaciones de entrada y stock comprobadas (ver verificacion-api.txt).

La suite Cypress documenta por separado el fallo HTTP simulado y la recuperación.

Se reinició el proceso del servidor y se volvió a consultar la API: el mismo pedido Q 48.00 y sus dos líneas seguían guardados.
