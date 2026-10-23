# Café de la Plaza

Tarea universitaria: sistema sencillo de pedidos en español con frontend HTML/CSS/JavaScript, API Express y persistencia real en SQLite. Permite agregar, aumentar, disminuir, editar y eliminar cantidades, calcular el total y confirmar pedidos con UUID. Valida carrito vacío, cantidades enteras y existencias tanto en navegador como en API.

## Instalar y ejecutar

Requisitos: Git, Node.js **22.23.2** (incluye SQLite, sin instalar otro servidor) y npm. Internet solo para instalar dependencias; las pruebas no consumen servicios externos.

```bash
git clone https://github.com/jefroMMM/E2E-Tarea.git
cd E2E-Tarea
npm ci
npm run seed
npm start
```

Abrir http://127.0.0.1:3000. Detener con Ctrl+C. SQLite se crea en `data/cafeteria.sqlite` y conserva los pedidos al reiniciar. Los importes se almacenan en centavos para evitar errores de decimales. No hay pagos ni usuarios: es una demostración local.

## Cypress con TypeScript

Con el puerto 3000 libre:

```bash
npm run typecheck
npm run seed:test
npm run test:e2e
npm run test:reverse
```

`test:e2e` inicia el servidor de pruebas, espera `/api/health`, ejecuta los tres recorridos headless y detiene el servidor. `test:reverse` ejecuta cada archivo por separado en orden 03, 02, 01. No ejecutes las dos suites simultáneamente: comparten una base de pruebas.

Para ver el runner interactivo, en dos terminales:

```bash
# Terminal 1
npm run start:test
# Terminal 2
npm run cy:open
```

Elegir E2E, un navegador y el archivo. Con el servidor de pruebas activo, `npm run cy:run` ejecuta la suite headless. `baseUrl` está en `cypress.config.ts`.

## Tres recorridos

| Archivo | Verificación |
| --- | --- |
| `01-exitoso.cy.ts` | Café y pan; edita café a 2; total Q 48.00; POST 201; UUID visible; consulta GET y verifica pedido, líneas, total y descuento de stock persistidos. |
| `02-vacio.cy.ts` | Confirma carrito vacío; mensaje claro; cero solicitudes POST interceptadas; API devuelve cero pedidos. |
| `03-recuperacion.cy.ts` | Capuchino; simula un solo HTTP 500 con `cy.intercept({ times: 1 })`; conserva carrito y total; reintenta con API real y verifica persistencia. |

Se inspeccionan método, URL, código HTTP y contenido del pedido/respuesta. Las capturas y videos reales salen en `cypress/screenshots/` y `cypress/videos/`. La selección de evidencia de entrega está en `entrega/`.

## Arquitectura y reinicio

`public/` se sirve desde Express (`server.js`). La API usa `db.js` y SQLite; pedido, detalles y descuento de stock se guardan juntos en una transacción. El servidor calcula los precios, sin confiar en un total enviado desde el cliente.

| Ruta | Uso |
| --- | --- |
| GET `/api/products` | Menú y stock |
| POST `/api/orders` | `{ "items": [{ "product_id": 1, "quantity": 2 }] }` |
| GET `/api/orders` | Pedidos guardados |
| GET `/api/orders/:id` | Pedido y sus líneas |
| GET `/api/health` | Disponibilidad del servidor |
| POST `/api/test/reset` | Solo con `NODE_ENV=test`: restaura productos y elimina pedidos |

`npm run seed` reinicia la base normal (borra sus pedidos). `npm run seed:test` reinicia `data/test.sqlite`. `.env.test` contiene solo configuración pública, sin secretos. `start:test` establece el entorno de pruebas; fuera de él la ruta de reset devuelve 404. Cada `beforeEach` reinicia datos por esa ruta. El servidor escucha solo en localhost; no publiques un servidor con `NODE_ENV=test`. No incluyas `data/` en Git.

## Estabilidad y dependencias reales

Cada caso empieza con seed y navegador limpio (`testIsolation`). Usa `data-cy`, aserciones reintentables y alias de red; no usa pausas numéricas. Los intercepts se registran antes de la acción. Los botones se bloquean mientras se confirma. La prueba de vacío inspecciona el historial de solicitudes y la base por API. El orden inverso y los procesos separados comprueban independencia.

Frontend, HTTP, Express y SQLite son reales. Solo se simula el primer HTTP 500 de recuperación; ese intento no llega a la base. El reintento sí usa el backend real. No se simula el pedido exitoso ni su persistencia.

## GitHub Actions

`.github/workflows/e2e.yml` se ejecuta en push y pull request: Node 22, `npm ci`, TypeScript, seed, servidor con espera verificable, Cypress y orden inverso. Si falla un comando, falla el job. Sube capturas y videos como artifact `evidencia-cypress`, también cuando hay fallos. El estado real y enlace verificado de la ejecución se documentan en `entrega/estado.md`.

Para publicar cambios: `git add .`, `git commit -m "Implementa cafetería y pruebas E2E"` y `git push -u origin main`. En GitHub, abrir **Actions → Cypress E2E**, esperar el resultado y abrir la ejecución para copiar su enlace. No confundir una suite local exitosa con CI aprobado.

## Comparación breve

| Herramienta | Cuándo la elegiría |
| --- | --- |
| [Cypress](https://docs.cypress.io/api/commands/intercept) | Para esta tarea: runner visual, aserciones claras e inspección/simulación de HTTP fácil de explicar. |
| [Playwright](https://playwright.dev/docs/intro) | Para una suite que necesite Chromium, Firefox y WebKit o varios contextos de navegador, con autoesperas. |
| [Agent Browser](https://agent-browser.dev/) | Para exploración y automatización guiada por agentes desde CLI con snapshots y referencias a elementos. Aquí priorizaría la suite reproducible de Cypress para evaluar la rúbrica. |

## Entrega y uso de IA

Ver `entrega/informe.pdf`, `entrega/guion_video.md` y `entrega/estado.md`. El video debe grabarse y publicarse por el estudiante; su enlace se marca pendiente hasta existir.

ChatGPT y Codex fueron utilizados para apoyar el desarrollo, proponer pruebas, revisar selectores y documentación. Los recorridos usan pasos y aserciones explícitos para que el estudiante pueda leerlos, ejecutarlos y explicarlos.
