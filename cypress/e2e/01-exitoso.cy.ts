describe('Pedido exitoso', () => {
  beforeEach(() => {
    cy.request('POST', '/api/test/reset').its('status').should('eq', 200);
    cy.intercept('GET', '/api/products').as('menu');
    cy.intercept('POST', '/api/orders').as('crearPedido');
    cy.visit('/');
    cy.wait('@menu').its('response.statusCode').should('eq', 200);
  });
  it('modifica cantidades y persiste el total y los productos', () => {
    cy.get('[data-cy=add-1]').click();
    cy.get('[data-cy=add-3]').click();
    cy.get('[data-cy=quantity-1]').clear().type('2').blur();
    cy.get('[data-cy=total]').should('have.text', 'Q 48.00');
    cy.screenshot('01-carrito-exitoso', { capture: 'fullPage' });
    cy.get('[data-cy=confirm]').click();
    cy.wait('@crearPedido').then(({ request, response }) => {
      expect(request.method).to.eq('POST');
      expect(request.url).to.eq(`${Cypress.config('baseUrl')}/api/orders`);
      expect(request.body).to.deep.eq({ items: [{ product_id: 1, quantity: 2 }, { product_id: 3, quantity: 1 }] });
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.total_cents).to.eq(4800);
      expect(response?.body.id).to.match(/^[0-9a-f-]{36}$/);
      cy.get('[data-cy=order-id]').should('have.text', response!.body.id);
      cy.request(`/api/orders/${response!.body.id}`).then(saved => {
        expect(saved.status).to.eq(200);
        expect(saved.body).to.deep.eq(response!.body);
        expect(saved.body.items).to.deep.eq([
          { product_id: 1, quantity: 2, price_cents: 1500 },
          { product_id: 3, quantity: 1, price_cents: 1800 },
        ]);
      });
    });
    cy.get('[data-cy=message]').should('contain.text', '¡Pedido confirmado! Total: Q 48.00');
    cy.get('[data-cy=cart]').should('contain.text', 'Tu carrito está vacío');
    cy.request('/api/orders').its('body').should('have.length', 1);
    cy.request('/api/products').then(({ body }) => {
      expect(body.find((p: { id: number }) => p.id === 1).stock).to.eq(18);
      expect(body.find((p: { id: number }) => p.id === 3).stock).to.eq(7);
    });
    cy.screenshot('02-pedido-confirmado', { capture: 'fullPage' });
  });
});
