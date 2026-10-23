const express = require('express');
const { randomUUID } = require('node:crypto');
const { db, seed } = require('./db');
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.static(require('node:path').join(__dirname, 'public')));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/products', (_req, res) => res.json(db.prepare('SELECT * FROM products ORDER BY id').all()));
function orderById(id) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (order) order.items = db.prepare('SELECT product_id, quantity, price_cents FROM order_items WHERE order_id = ? ORDER BY product_id').all(id);
  return order;
}
app.get('/api/orders', (_req, res) => res.json(db.prepare('SELECT * FROM orders ORDER BY created_at').all()));
app.get('/api/orders/:id', (req, res) => {
  const order = orderById(req.params.id);
  res.status(order ? 200 : 404).json(order || { error: 'No se encontró el pedido.' });
});
app.post('/api/orders', (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || !items.length || items.length > 50 || items.some(i => !i || !Number.isSafeInteger(i.product_id) || !Number.isSafeInteger(i.quantity) || i.quantity < 1 || i.quantity > 999) || new Set(items.map(i => i.product_id)).size !== items.length) {
    return res.status(400).json({ error: 'Agrega productos con cantidades enteras entre 1 y 999.' });
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    const lines = items.map(item => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product || product.stock < item.quantity) throw new Error('No hay existencias suficientes. Revisa las cantidades.');
      return { ...item, price_cents: product.price_cents };
    });
    const id = randomUUID();
    const total = lines.reduce((sum, i) => sum + i.quantity * i.price_cents, 0);
    db.prepare('INSERT INTO orders VALUES (?, ?, ?)').run(id, total, new Date().toISOString());
    for (const i of lines) {
      db.prepare('INSERT INTO order_items VALUES (?, ?, ?, ?)').run(id, i.product_id, i.quantity, i.price_cents);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(i.quantity, i.product_id);
    }
    db.exec('COMMIT');
    return res.status(201).json(orderById(id));
  } catch (error) {
    db.exec('ROLLBACK');
    if (error.message.startsWith('No hay existencias')) return res.status(409).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: 'No pudimos guardar el pedido. Intenta de nuevo.' });
  }
});
// La ruta ni siquiera existe en producción/desarrollo; usa una base separada.
if (process.env.NODE_ENV === 'test') app.post('/api/test/reset', (_req, res) => { seed(); res.json({ status: 'reiniciado' }); });
app.use((err, _req, res, _next) => res.status(400).json({ error: 'La solicitud no es válida.' }));
app.listen(process.env.PORT || 3000, '127.0.0.1', () => console.log(`Cafetería en http://127.0.0.1:${process.env.PORT || 3000} (${process.env.NODE_ENV || 'development'})`));
