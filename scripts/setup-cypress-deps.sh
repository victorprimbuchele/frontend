#!/bin/bash

# Script para instalar dependências do Cypress no Ubuntu 24.04
# Execute com: bash scripts/setup-cypress-deps.sh

echo "Instalando dependências do Cypress para Ubuntu 24.04..."

sudo apt-get update

# Dependências principais (nomes atualizados para Ubuntu 24.04)
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

echo "Dependências instaladas! Tente executar: npm run cypress:run"




