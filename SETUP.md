# Setup do Projeto - Networking Frontend

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Ubuntu 24.04 (ou similar)

## Instalação

### 1. Instalar dependências do projeto

```bash
npm install
```

### 2. Instalar dependências do sistema para Cypress (Ubuntu 24.04)

No Ubuntu 24.04, alguns pacotes mudaram de nome. Execute:

```bash
sudo apt-get update
sudo apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2t64 \
  libpango-1.0-0 \
  libcairo2
```

**Nota:** No Ubuntu 24.04, `libasound2` foi substituído por `libasound2t64`.

Ou execute o script automatizado:

```bash
bash scripts/setup-cypress-deps.sh
```

### 3. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Executando o projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Build de produção

```bash
npm run build
npm start
```

## Executando testes

### Testes Jest (unitários/integração)

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com coverage
npm run test:coverage
```

### Testes Cypress (E2E)

```bash
# Interface gráfica
npm run cypress:open

# Modo headless
npm run cypress:run
```

**Importante:** Certifique-se de que o servidor de desenvolvimento está rodando (`npm run dev`) antes de executar os testes E2E.

## Troubleshooting

### Erro: "libnspr4.so: cannot open shared object file"

Execute o comando de instalação de dependências acima.

### Erro: "Package 'libasound2' has no installation candidate"

No Ubuntu 24.04, use `libasound2t64` em vez de `libasound2`.

### Cypress não inicia no WSL

Se estiver usando WSL, pode ser necessário instalar dependências adicionais ou usar X11 forwarding para a interface gráfica.


