const cart = new Map();
let products = [];
let submitting = false;
const $ = s => document.querySelector(s);
const money = cents => `Q ${(cents / 100).toFixed(2)}`;
function message(text, kind = 'error') { $('#message').className = kind; $('#message').textContent = text; }
async function loadProducts() {
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error('No se pudo cargar el menú. Recarga la página.');
  products = await response.json();
  const icons = ['☕', '☕', '🥐', '🍵'];
  $('#products').innerHTML = products.map((p, index) => `<article class="product" data-cy="product-${p.id}"><div class="product-icon" aria-hidden="true">${icons[index] || '☕'}</div><h3>${p.name}</h3><div class="price">${money(p.price_cents)}</div><p class="stock ${p.stock ? '' : 'sold'}">${p.stock ? `${p.stock} disponibles` : 'Agotado'}</p><button data-add="${p.id}" data-cy="add-${p.id}" ${!p.stock || submitting ? 'disabled' : ''} aria-label="Agregar ${p.name}">Agregar al pedido</button></article>`).join('');
}
function renderCart() {
  $('#cart').innerHTML = cart.size ? [...cart].map(([id, quantity]) => {
    const p = products.find(p => p.id === id);
    return `<div class="cart-line" data-cy="cart-${id}"><h3>${p.name}</h3><div class="controls"><button data-change="${id}" data-delta="-1" aria-label="Disminuir ${p.name}" ${submitting ? 'disabled' : ''}>−</button><input data-cy="quantity-${id}" data-quantity="${id}" aria-label="Cantidad de ${p.name}" type="number" min="1" max="${Math.min(p.stock,999)}" step="1" value="${quantity}" ${submitting ? 'disabled' : ''}><button data-change="${id}" data-delta="1" aria-label="Aumentar ${p.name}" ${submitting ? 'disabled' : ''}>+</button><button class="remove" data-remove="${id}" aria-label="Eliminar ${p.name}" ${submitting ? 'disabled' : ''}>Eliminar</button></div><p class="line-price">${money(p.price_cents * quantity)}</p></div>`;
  }).join('') : '<p class="empty">Tu carrito está vacío.<br>Agrega algo del menú para empezar.</p>';
  $('#total').textContent = money([...cart].reduce((sum, [id, quantity]) => sum + products.find(p => p.id === id).price_cents * quantity, 0));
}
function setQuantity(id, quantity) {
  const p = products.find(p => p.id === id);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) message('La cantidad debe ser un número entero entre 1 y 999.');
  else if (quantity > p.stock) message(`Solo hay ${p.stock} unidades disponibles de ${p.name}.`);
  else { cart.set(id, quantity); message(''); }
  renderCart();
}
document.addEventListener('click', event => {
  if (submitting) return;
  const b = event.target.closest('button');
  if (!b) return;
  if (b.dataset.add) { const id = Number(b.dataset.add); setQuantity(id, (cart.get(id) || 0) + 1); }
  if (b.dataset.change) { const id = Number(b.dataset.change); setQuantity(id, cart.get(id) + Number(b.dataset.delta)); }
  if (b.dataset.remove) { cart.delete(Number(b.dataset.remove)); message(''); renderCart(); }
});
document.addEventListener('change', event => { if (event.target.dataset.quantity && !submitting) setQuantity(Number(event.target.dataset.quantity), Number(event.target.value)); });
$('#confirm').addEventListener('click', async () => {
  if (submitting) return;
  if (!cart.size) return message('Agrega al menos un producto antes de confirmar tu pedido.');
  submitting = true;
  $('#confirm').disabled = true;
  $('#confirm').textContent = 'Confirmando…';
  renderCart();
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [...cart].map(([product_id, quantity]) => ({ product_id, quantity })) }) });
    const order = await response.json();
    if (!response.ok) throw new Error(response.status === 409 ? order.error : 'No pudimos confirmar tu pedido. Tus productos siguen en el carrito. Intenta de nuevo.');
    cart.clear();
    message(`¡Pedido confirmado! Total: ${money(order.total_cents)}`, 'success');
    const identifier = document.createElement('strong');
    identifier.className = 'order-id'; identifier.dataset.cy = 'order-id'; identifier.textContent = order.id;
    $('#message').append(identifier);
  } catch (error) { message(error.message === 'Failed to fetch' ? 'No hay conexión. Conservamos tu carrito; intenta de nuevo.' : error.message); }
  finally {
    submitting = false; $('#confirm').disabled = false; $('#confirm').textContent = 'Confirmar pedido';
    try { await loadProducts(); } catch (error) { if (cart.size) message(error.message); }
    renderCart();
  }
});
loadProducts().catch(error => message(error.message));
renderCart();
