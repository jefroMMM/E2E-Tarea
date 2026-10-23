const { spawn } = require('node:child_process');
const { resolve } = require('node:path');
const { setTimeout: pause } = require('node:timers/promises');
const root = resolve(__dirname, '..');
const health = 'http://127.0.0.1:3000/api/health';

async function run() {
  // Evita probar accidentalmente otro servidor que ya esté usando el puerto.
  const occupied = await fetch(health, { signal: AbortSignal.timeout(1000) }).catch(() => null);
  if (occupied) throw new Error('Libera el puerto 3000 antes de ejecutar la suite.');
  const server = spawn(process.execPath, ['--env-file=.env.test', 'server.js'], { cwd: root, stdio: 'inherit' });
  const stopped = new Promise(resolve => server.once('exit', resolve));
  server.on('error', error => console.error(error.message));
  try {
    const deadline = Date.now() + 20000;
    let ready = false;
    while (Date.now() < deadline && server.exitCode === null) {
      const response = await fetch(health, { signal: AbortSignal.timeout(1000) }).catch(() => null);
      if (response?.ok) { ready = true; break; }
      // Sondeo de disponibilidad, no una espera fija dentro de las pruebas.
      await pause(100);
    }
    if (!ready) throw new Error('La API no estuvo disponible dentro de 20 segundos.');
    console.log('API disponible: HTTP 200. Iniciando Cypress.');
    const specs = process.argv.includes('--reverse')
      ? ['03-recuperacion', '02-vacio', '01-exitoso'] : [null];
    for (const spec of specs) {
      const args = [resolve(root, 'node_modules/cypress/bin/cypress'), 'run'];
      if (spec) args.push('--spec', `cypress/e2e/${spec}.cy.ts`, '--config', 'trashAssetsBeforeRuns=false');
      // Cada spec del orden inverso se ejecuta en su propio proceso.
      const code = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', resolve);
      });
      if (code !== 0) throw new Error(`Cypress terminó con código ${code}.`);
    }
  } finally {
    server.kill();
    await stopped;
    console.log('Servidor de pruebas detenido.');
  }
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
