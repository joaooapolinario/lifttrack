FROM node:18-alpine

# Instala dependências de sistema (necessário para Prisma)
RUN apk add --no-cache openssl

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instala TODAS as dependências (dev e prod) para garantir que o build funcione
# O --prod=false é crucial para baixar o @nestjs/cli
RUN pnpm install --frozen-lockfile --prod=false

# Copia todo o código fonte
COPY . .

# Gera o cliente do Prisma
RUN pnpm exec prisma generate

# Constrói o projeto (Cria a pasta dist)
RUN pnpm run build

# Expõe a porta
EXPOSE 3000

# CORREÇÃO AQUI: Apontando para dist/src/main.js em vez de dist/main.js
CMD ["node", "dist/src/main.js"]