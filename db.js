const { DatabaseSync } = require('node:sqlite');
const { mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const dbPath = resolve(process.env.DB_PATH || 'data/cafeteria.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents > 0), stock INTEGER NOT NULL CHECK(stock >= 0));
  CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, total_cents INTEGER NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS order_items (order_id TEXT NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL REFERENCES products(id), quantity INTEGER NOT NULL CHECK(quantity > 0), price_cents INTEGER NOT NULL, PRIMARY KEY(order_id, product_id));`);
function seed() {
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('DELETE FROM order_items; DELETE FROM orders; DELETE FROM products;');
    const insert = db.prepare('INSERT INTO products VALUES (?, ?, ?, ?)');
    [[1,'Café americano',1500,20],[2,'Capuchino',2200,12],[3,'Pan de chocolate',1800,8],[4,'Té de manzanilla',1200,0]].forEach(p => insert.run(...p));
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
if (db.prepare('SELECT COUNT(*) AS count FROM products').get().count === 0) seed();
module.exports = { db, seed };
