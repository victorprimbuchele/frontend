describe('Fluxo Admin - Aplicações', () => {
  const adminKey = 'admin-key-123';

  beforeEach(() => {
    cy.visit('/admin/applications');
    cy.intercept('GET', '**/admin/applications*', { fixture: 'applications.json' }).as('getApplications');
  });

  it('deve desabilitar botões para aplicações já processadas', () => {
    cy.intercept('GET', '**/admin/applications*', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 'app-456',
            name: 'Maria Santos',
            email: 'maria@example.com',
            company: null,
            motivation: 'Interesse',
            status: 'APPROVED',
            createdAt: '2024-01-02T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        error: '',
      },
    }).as('getApplicationsApproved');

    cy.get('input[type="password"]').first().type(adminKey);
    cy.contains('button', 'Carregar').click();
    cy.wait('@getApplicationsApproved');

    cy.contains('tr', 'Maria Santos').within(() => {
      cy.contains('button', 'Aprovar').should('be.disabled');
      cy.contains('button', 'Recusar').should('be.disabled');
    });
  });

  it('deve fazer logout', () => {
    cy.get('input[type="password"]').first().type(adminKey);
    cy.contains('button', 'Carregar').click();
    cy.wait('@getApplications');

    cy.contains('button', 'Sair').click();

    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Carregar').should('be.visible');
  });
});

