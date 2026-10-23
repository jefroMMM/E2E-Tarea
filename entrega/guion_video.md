# Guion de demostración (2:50 máximo)

Preparación (antes de grabar): ejecutar `npm ci`. Tener dos terminales, navegador y GitHub Actions abiertos. Ejecutar `npm run start:test` en una terminal y `npm run cy:open` en otra. Elegir E2E y navegador. Mantener a mano `03-recuperacion.cy.ts`. No mostrar credenciales. Si Actions todavía no está aprobado, completarlo antes del video y no decir que pasó.

| Tiempo | Qué decir | Qué mostrar y hacer |
| --- | --- | --- |
| 0:00-0:20 | “Esta es mi tarea de pruebas de extremo a extremo. Hice una cafetería con una página sencilla, una API en Express y SQLite para guardar los pedidos.” | Abrir http://127.0.0.1:3000. Mostrar menú, precios, disponibilidad y carrito. |
| 0:20-0:45 | “Puedo agregar productos, cambiar cantidades y quitarlos. El total se actualiza. Si confirmo sin productos, la aplicación me avisa.” | Agregar café, pulsar + y −, editar la cantidad a 2. Pulsar Eliminar y luego Confirmar pedido. Mostrar validación. |
| 0:45-1:15 | “Ahora voy a probar un pedido completo. La prueba cambia una cantidad y comprueba los 48 quetzales. También revisa por la API que el pedido quedó guardado.” | En Cypress ejecutar `01-exitoso.cy.ts`. Mostrar pasos verdes, confirmación, identificador y solicitud GET de verificación. |
| 1:15-1:35 | “Este segundo recorrido confirma que un carrito vacío no envía la solicitud ni crea pedidos.” | Ejecutar `02-vacio.cy.ts`; mostrar mensaje y aserciones de cero solicitudes y lista vacía. |
| 1:35-2:05 | “Para probar un fallo sin romper el servidor, uso intercept. Solo la primera solicitud responde con error 500. El carrito se conserva y el segundo intento usa la API real.” | Mostrar brevemente `times: 1` y `statusCode: 500` en `03-recuperacion.cy.ts`. Ejecutar ese archivo en Cypress; mostrar captura de fallo y luego recuperación. |
| 2:05-2:25 | “Cada prueba reinicia los datos y empieza sola. Espero respuestas de red y condiciones de pantalla; no uso pausas de segundos. También ejecuté las pruebas en orden inverso.” | Mostrar `beforeEach`, `cy.wait('@fallo')` y `entrega/resultados-inverso.txt`. No leer todo el código. |
| 2:25-2:45 | “En cada push o pull request, GitHub instala, inicia la aplicación y ejecuta las pruebas. Aquí está el resultado y las evidencias.” | Abrir ejecución verificada de Actions desde `entrega/estado.md`. Mostrar job verde y artifact. Si aún está pendiente, decirlo expresamente y mostrar workflow sin afirmar éxito. |
| 2:45-2:50 | “El README explica cómo repetirlo. Usé ChatGPT y Codex como apoyo y revisé las pruebas para poder explicarlas.” | Mostrar README y carpeta entrega. |

Al terminar: subir el video a una plataforma accesible para el docente, verificar el enlace en ventana privada y agregarlo a `entrega/estado.md` y al PDF. No debe superar 3 minutos.
