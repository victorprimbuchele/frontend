# Testes - Networking Frontend

Este projeto possui uma suíte completa de testes usando Jest para testes unitários/integração e Cypress para testes E2E.

## Estrutura de Testes

```
tests/
  __mocks__/          # Mocks globais (fetch, Next.js)
  helpers/            # Utilitários de teste (test-utils, mock-factories)
  unit/               # Testes unitários
    services/         # Testes dos serviços de API
    components/       # Testes de componentes
  integration/        # Testes de integração
    pages/           # Testes das páginas

cypress/
  e2e/               # Testes end-to-end
  fixtures/          # Dados de teste
  support/           # Comandos customizados e configuração
```

## Executando Testes Jest

### Todos os testes
```bash
npm test
```

### Modo watch (desenvolvimento)
```bash
npm run test:watch
```

### Com coverage
```bash
npm run test:coverage
```

### Teste específico
```bash
npm test -- applicationApi.test.ts
```

## Executando Testes Cypress

### Interface gráfica (recomendado para desenvolvimento)
```bash
npm run cypress:open
```

### Modo headless (CI/CD)
```bash
npm run cypress:run
```

### Teste específico
```bash
npx cypress run --spec "cypress/e2e/apply.cy.ts"
```

## Cobertura de Testes

### Testes Unitários
- ✅ Serviços de API (applicationApi, registerApi, referralsApi, adminApplicationApi)
- ✅ Componentes (InputGroup)

### Testes de Integração
- ✅ ApplyPage (formulário de aplicação)
- ✅ RegisterPage (formulário de registro)

### Testes E2E
- ✅ Fluxo de aplicação
- ✅ Fluxo de registro
- ✅ Fluxo de indicações (com paginação)
- ✅ Fluxo admin (listagem, aprovação, rejeição)

## Helpers e Utilitários

### test-utils.tsx
Wrapper customizado do React Testing Library com providers (ThemeProvider).

### mock-factories.ts
Factories para criar dados mockados:
- `createMockApplication()`
- `createMockReferral()`
- `createMockRegisterResponse()`
- `createMockGenericResponse()`
- `createMockGenericListResponse()`
- `createMockFetchResponse()`

## Comandos Customizados do Cypress

- `cy.loginWithMemberId(memberId)` - Login com Member ID
- `cy.loginWithAdminKey(adminKey)` - Login com Admin Key
- `cy.waitForApi(method, url)` - Aguardar resposta de API
- `cy.fillApplicationForm(data)` - Preencher formulário de aplicação
- `cy.fillRegisterForm(data)` - Preencher formulário de registro

## Notas

- Os testes E2E assumem que a aplicação está rodando em `http://localhost:3000`
- Os testes mockam as chamadas de API usando `cy.intercept()`
- Para testes E2E com API real, ajuste os intercepts no arquivo de teste

