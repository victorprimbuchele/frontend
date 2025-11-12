describe('Fluxo de Aplicação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('POST', '**/applications', { fixture: 'applications.json' }).as('createApplication');
  });

  it('deve preencher e submeter formulário de aplicação com sucesso', () => {
    cy.contains('h2', 'Aplicar para participar').should('be.visible');

    cy.get('label:contains("Nome")').parent().find('input').type('João Silva');
    cy.get('label:contains("Email")').parent().find('input').type('joao@example.com');
    cy.get('label:contains("Empresa")').parent().find('input').type('Empresa XYZ');
    cy.get('label:contains("Por que você quer participar")').parent().find('textarea').type('Quero participar do networking');

    cy.contains('button', 'Enviar').click();

    cy.wait('@createApplication');
    cy.contains('Intenção enviada com sucesso').should('be.visible');
    
    cy.get('label:contains("Nome")').parent().find('input').should('have.value', '');
    cy.get('label:contains("Email")').parent().find('input').should('have.value', '');
  });

  it('deve permitir submeter sem empresa (campo opcional)', () => {
    cy.get('label:contains("Nome")').parent().find('input').type('Maria Santos');
    cy.get('label:contains("Email")').parent().find('input').type('maria@example.com');
    cy.get('label:contains("Por que você quer participar")').parent().find('textarea').type('Motivação');

    cy.contains('button', 'Enviar').click();

    cy.wait('@createApplication');
    cy.contains('Intenção enviada com sucesso').should('be.visible');
  });

  it('deve exibir mensagem de erro quando submissão falha', () => {
    cy.intercept('POST', '**/applications', {
      statusCode: 400,
      body: { error: 'Email já cadastrado' },
    }).as('createApplicationError');

    cy.get('label:contains("Nome")').parent().find('input').type('João Silva');
    cy.get('label:contains("Email")').parent().find('input').type('joao@example.com');
    cy.get('label:contains("Por que você quer participar")').parent().find('textarea').type('Motivação');

    cy.contains('button', 'Enviar').click();

    cy.wait('@createApplicationError');
    cy.contains('Email já cadastrado').should('be.visible');
  });
});

