const { spawnSync } = require('node:child_process');
// Procesos separados: demuestra también que cada recorrido funciona por sí solo.
for (const spec of ['03-recuperacion', '02-vacio', '01-exitoso']) {
  const result = spawnSync(process.execPath, [require.resolve('cypress/bin/cypress'), 'run', '--spec', `cypress/e2e/${spec}.cy.ts`, '--config', 'trashAssetsBeforeRuns=false'], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
