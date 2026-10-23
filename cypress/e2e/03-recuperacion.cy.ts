describe('Fallo controlado y recuperación', () => {
  beforeEach(() => {
    cy.request('POST', '/api/test/reset');
    cy.intercept('GET', '/api/products').as('menu');
    cy.visit('/');
    cy.wait('@menu');
  });
  it('conserva el carrito ante HTTP 500 y permite reintentar', () => {
    cy.get('[data-cy=add-2]').click();
    // La ruta general observa el reintento real. La simulación solo se aplica una vez.
    cy.intercept('POST', '/api/orders').as('reintento');
    cy.intercept({ method: 'POST', pathname: '/api/orders', times: 1 }, {
      statusCode: 500, body: { error: 'Fallo simulado para la prueba' },
    }).as('fallo');
    cy.get('[data-cy=confirm]').click();
    cy.wait('@fallo').then(({ request, response }) => {
      expect(request.method).to.eq('POST');
      expect(request.url).to.eq(`${Cypress.config('baseUrl')}/api/orders`);
      expect(request.body).to.deep.eq({ items: [{ product_id: 2, quantity: 1 }] });
      expect(response?.statusCode).to.eq(500);
      expect(response?.body.error).to.eq('Fallo simulado para la prueba');
    });
    cy.get('[data-cy=message]').should('contain.text', 'Tus productos siguen en el carrito');
    cy.get('[data-cy=quantity-2]').should('have.value', '1');
    cy.get('[data-cy=total]').should('have.text', 'Q 22.00');
    cy.request('/api/orders').its('body').should('have.length', 0);
    cy.get('[data-cy=confirm]').should('be.enabled');
    cy.screenshot('04-fallo-controlado', { capture: 'fullPage' });
    cy.get('[data-cy=confirm]').click();
    cy.wait('@reintento').then(({ request, response }) => {
      expect(request.method).to.eq('POST');
      expect(request.url).to.eq(`${Cypress.config('baseUrl')}/api/orders`);
      expect(request.body.items).to.deep.eq([{ product_id: 2, quantity: 1 }]);
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.total_cents).to.eq(2200);
      cy.request(`/api/orders/${response!.body.id}`).its('body.total_cents').should('eq', 2200);
    });
    cy.get('[data-cy=message]').should('contain.text', '¡Pedido confirmado!');
    cy.get('[data-cy=order-id]').should('be.visible');
    cy.request('/api/orders').its('body').should('have.length', 1);
    cy.screenshot('05-recuperacion-exitosa', { capture: 'fullPage' });
  });
});
