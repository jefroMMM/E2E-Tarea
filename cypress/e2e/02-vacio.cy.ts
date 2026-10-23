describe('Validación del carrito vacío', () => {
  beforeEach(() => {
    cy.request('POST', '/api/test/reset');
    cy.intercept('GET', '/api/products').as('menu');
    cy.intercept('POST', '/api/orders').as('crearPedido');
    cy.visit('/');
    cy.wait('@menu').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(request.url).to.eq(`${Cypress.config('baseUrl')}/api/products`);
      expect(response?.statusCode).to.eq(200);
      expect(response?.body).to.have.length(4);
    });
  });
  it('muestra la validación sin enviar ni persistir pedidos', () => {
    cy.get('[data-cy=cart]').should('contain.text', 'Tu carrito está vacío');
    cy.get('[data-cy=confirm]').click();
    cy.get('[data-cy=message]').should('have.text', 'Agrega al menos un producto antes de confirmar tu pedido.');
    // El manejador del botón termina sin programar ninguna solicitud.
    cy.get('@crearPedido.all').should('have.length', 0);
    cy.request('/api/orders').then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body).to.deep.eq([]);
    });
    cy.screenshot('03-validacion-carrito-vacio', { capture: 'fullPage' });
  });
});
