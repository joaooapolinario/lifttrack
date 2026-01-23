# 🏋️‍♂️ LiftTrack

> Um rastreador de treinos minimalista, focado em dispositivos móveis e alta performance.

## 📋 Sobre o Projeto

O **LiftTrack** foi desenvolvido para resolver a complexidade dos apps de academia tradicionais. Com uma abordagem **Mobile First**, ele oferece uma interface limpa, modo escuro nativo e foco total na execução do treino, sem distrações.

O projeto é um Monorepo dividido em Frontend (Next.js) e Backend (NestJS).

## ✨ Funcionalidades

- **📱 Mobile First UI:** Interface pensada para uso com uma mão só.
- **🌑 Dark Mode Premium:** Tema escuro com alto contraste e destaques em Azul Neon.
- **⚡ Modo Treino Ativo:** Cronômetro fixo (Sticky), checklist de exercícios e frases motivacionais.
- **🖱️ Drag & Drop Intuitivo:** Reordenação de exercícios com UX otimizada para toque (ícones táteis).
- **📝 Gestão de Fichas:** Criação, edição e personalização completa de treinos.
- **📚 Banco de Exercícios:** Seleção inteligente de exercícios.

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Shadcn/ui](https://ui.shadcn.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gestão de Estado/Drag:** @hello-pangea/dnd

### Backend
- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Autenticação:** JWT

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- pnpm (recomendado) ou npm
- Docker (opcional, para rodar o banco localmente)

### 1. Clonar o repositório
```bash
git clone https://github.com/joaooapolinario/lifttrack.git
cd lifttrack
```

### 2. Configurar o Backend
```bash
cd backend
cp .env.example .env
# Configure sua DATABASE_URL no arquivo .env

pnpm install
npx prisma migrate dev  # Cria as tabelas no banco
npx prisma db seed      # (Opcional) Popula com exercícios iniciais
pnpm start:dev
```

### 3. Configurar o Frontend
Em um novo terminal
```bash
cd frontend
cp .env.example .env.local
# Defina NEXT_PUBLIC_API_URL=http://localhost:3001

pnpm install
pnpm dev
```

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar Pull Requests.



