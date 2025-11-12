/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with member ID
       * @example cy.loginWithMemberId('member-123')
       */
      loginWithMemberId(memberId: string): Chainable<void>;

      /**
       * Custom command to login with admin key
       * @example cy.loginWithAdminKey('admin-key-123')
       */
      loginWithAdminKey(adminKey: string): Chainable<void>;

      /**
       * Custom command to wait for API response
       * @example cy.waitForApi('GET', '/api/applications')
       */
      waitForApi(method: string, url: string): Chainable<void>;

      /**
       * Custom command to fill application form
       * @example cy.fillApplicationForm({ name: 'João', email: 'joao@example.com' })
       */
      fillApplicationForm(data: { name: string; email: string; company?: string; motivation: string }): Chainable<void>;

      /**
       * Custom command to fill register form
       * @example cy.fillRegisterForm({ name: 'João', email: 'joao@example.com' })
       */
      fillRegisterForm(data: { name: string; email: string; company?: string }): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginWithMemberId', (memberId: string) => {
  cy.get('input[placeholder*="Member ID"]').type(memberId);
  cy.contains('button', 'Carregar').click();
  cy.wait('@getReferrals');
});

Cypress.Commands.add('loginWithAdminKey', (adminKey: string) => {
  cy.get('input[type="password"]').first().type(adminKey);
  cy.contains('button', 'Carregar').click();
  cy.wait('@getApplications');
});

Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, `**${url}**`).as(url.replace('/', ''));
});

Cypress.Commands.add('fillApplicationForm', (data) => {
  cy.get('label:contains("Nome")').parent().find('input').type(data.name);
  cy.get('label:contains("Email")').parent().find('input').type(data.email);
  if (data.company) {
    cy.get('label:contains("Empresa")').parent().find('input').type(data.company);
  }
  cy.get('label:contains("Por que você quer participar")').parent().find('textarea').type(data.motivation);
});

Cypress.Commands.add('fillRegisterForm', (data) => {
  cy.get('label:contains("Nome")').parent().find('input').type(data.name);
  cy.get('label:contains("Email")').parent().find('input').type(data.email);
  if (data.company) {
    cy.get('label:contains("Empresa")').parent().find('input').type(data.company);
  }
});

export {};

