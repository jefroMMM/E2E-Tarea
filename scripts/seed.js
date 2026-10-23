const { db, seed } = require('../db');
seed();
db.close();
console.log('Datos reiniciados: 4 productos iniciales y 0 pedidos.');
