# 🎵 Hub Music

**Streaming e compartilhamento de áudio open source** — uma plataforma que une a experiência do Spotify com a abertura do SoundCloud.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-blue?logo=fastify)](https://fastify.dev/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Sobre o Projeto

O **Hub Music** é uma plataforma de streaming e compartilhamento de áudio totalmente open source. Nossa missão é conectar ouvintes a catálogos de músicas via APIs públicas (Deezer, Free To Use, Jamendo, LRCLIB), permitindo descoberta de novos sons com uma interface moderna, escura e personalizada.

### O que torna o Hub Music diferente?

| Hub Music | Spotify | SoundCloud |
|-----------|---------|------------|
| Código aberto (MIT) | ✅ Fechado | ✅ Fechado |
| Catálogo via APIs públicas | ✅ Catálogo próprio | ❌ Apenas uploads |
| Grátis e sem assinatura | ⚠️ Freemium | ✅ Grátis |
| Waveform interativa | ❌ | ✅ |
| Privacidade focada (LGPD) | ❌ | ❌ |

---

## ✨ Funcionalidades

### 🎧 Para Ouvintes
- **Player com waveform interativa** — visualize a forma da música enquanto ouve (estilo SoundCloud)
- **Busca unificada** — encontre faixas de APIs públicas (Deezer, Free To Use, Jamendo)
- **Playlists** — crie, edite e reproduza suas playlists em sequência
- **Feed social** — veja uploads recentes de usuários que você segue
- **Modo escuro** — interface preta e rosa, confortável para longas sessões

### 🎤 Para Artistas
- **Perfil de artista** — personalize com biografia, foto e links sociais
- **Estatísticas** — veja curtidas, reposts e comentários de suas faixas
- **Controle total** — edite ou exclua suas faixas a qualquer momento

### 🔧 Técnico
- **Backend:** Node.js + Fastify + TypeScript + Prisma + PostgreSQL
- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui
- **Player:** Howler.js + Wavesurfer.js
- **APIs públicas:** Deezer, MusicBrainz, Free To Use, Jamendo, LRCLIB, Radio Browser
- **Autenticação:** JWT com cookies HttpOnly

---

## 🚀 Como Rodar o Projeto (100% Nuvem)

O Hub Music está configurado para rodar totalmente na nuvem:

- **Backend:** [Render](https://render.com) (Node.js + Fastify + Prisma + PostgreSQL)
- **Frontend:** [Vercel](https://vercel.com) (React 18 + Vite)
- **Banco:** PostgreSQL gerenciado pelo Render (nativo, sem instalação)
- **Sem upload de músicas dos artistas** — apenas APIs públicas (Deezer, MusicBrainz, etc.)

### Pré-requisitos

- Conta no [Render](https://render.com)
- Conta no [Vercel](https://vercel.com)
- Repositório no GitHub

---

### 1️⃣ Banco de Dados (Render Gerenciado)

O Render oferece banco de dados PostgreSQL nativo! Quando você conectar seu GitHub ao Render, ele cria o banco automaticamente.

O `render.yaml` inclui o serviço de banco — nada para configurar manualmente.

---

### 2️⃣ Backend no Render

1. Conecte seu GitHub ao [Render](https://render.com)
2. Crie um **Web Service** selecionando seu repositório `hub-music`
3. Nas configurações:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
4. Adicione as variáveis de ambiente no painel do Render:

| Variável | Valor de exemplo |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | `sua-chave-secreta-muito-longa` |
| `JWT_REFRESH_SECRET` | `outra-chave-diferente` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `COOKIE_SECRET` | `sua-chave-de-cookie-secreta` |
| `FRONTEND_URL` | `https://seu-app.vercel.app` |
| `API_URL` | `https://seu-backend.onrender.com` |

O `DATABASE_URL` é obtido automaticamente do banco PostgreSQL criado pelo Render.

O Render usará o arquivo `render.yaml` na raiz do projeto para configurar automaticamente.

---

### 3️⃣ Frontend no Vercel

1. Conecte seu GitHub ao [Vercel](https://vercel.com)
2. Crie um **New Project** selecionando seu repositório `hub-music`
3. Nas configurações de build:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Dev Command:** `npm run dev`
4. Adicione a variável de ambiente:
   - **`VITE_API_URL`**: `https://seu-backend.onrender.com`

---

### 4️⃣ Rodar Localmente (Opcional - apenas para desenvolvimento)

Se quiser testar localmente antes do deploy, você precisa de um banco PostgreSQL:

```powershell
# Backend
cd backend
npm install
cp .env.example .env
# Edite o .env com sua DATABASE_URL do PostgreSQL
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

O front estará em **http://localhost:5173** e o back em **http://localhost:3000**.

---

## 🌐 Deploy no Render (Produção)

O backend está configurado para deploy no [Render](https://render.com) usando o arquivo `render.yaml`.

### Pré-requisitos para produção

- Um repositório no GitHub com o código do backend
- Um frontend hospedado (ex: [Vercel](https://vercel.com))

### Passos

1. No Render, crie um novo **Web Service** conectando seu GitHub
2. O Render cria automaticamente o banco PostgreSQL (`hub-music-db`)
3. Use o arquivo `render.yaml` na raiz do projeto para configurar automaticamente
4. Configure as variáveis `FRONTEND_URL`, `API_URL` no painel do Render
5. O comando de build executa: `npm install && npx prisma generate && npx prisma migrate deploy`
6. O comando de start executa: `npm start`

O frontend pode ser hospedado separadamente no Vercel — veja o arquivo `DEPLOY_VERCEL.md`.

---

## 📁 Estrutura de Pastas

```
hub-music/
├── backend/                 # API Node.js + Fastify
│   ├── src/
│   │   ├── routes/          # Rotas (auth, tracks, playlists, social, search)
│   │   ├── services/        # Serviços (storage, cache, APIs externas)
│   │   ├── middleware/      # Autenticação e validação
│   │   └── utils/           # Prisma, erros
│   ├── prisma/              # Schema do banco (PostgreSQL)
├── frontend/                # Interface React + Vite
│   ├── src/
│   │   ├── components/      # Componentes (ui, player, track, playlist)
│   │   ├── pages/           # Páginas (Home, Search, Perfil, etc.)
│   │   └── hooks/           # useAuth, usePlayer, useSearch
├── estudo/                  # Planejamento interno (não é commitado)
├── .env.example             # Exemplo de variáveis de ambiente
├── .gitignore               # Arquivos ignorados pelo Git
└── README.md                # Este arquivo
```

---

## 📡 Principais Endpoints da API

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/auth/register` | Cadastro de usuário | Não |
| `POST` | `/api/auth/login` | Login | Não |
| `POST` | `/api/auth/logout` | Logout | Não |
| `GET` | `/api/tracks` | Listar faixas públicas | Não |
| `GET` | `/api/tracks/:id` | Detalhes de uma faixa | Não |
| `GET` | `/api/search?q=...` | Busca unificada em APIs públicas | Não |
| `POST` | `/api/tracks/:id/like` | Curtir/descurtir | Sim |
| `POST` | `/api/tracks/:id/repost` | Repostar | Sim |
| `POST` | `/api/users/:id/follow` | Seguir usuário | Sim |

---

## 🤝 Como Contribuir

O Hub Music é open source e sua contribuição é bem-vinda!

1. Faça um **fork** deste repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m "feat: descrição da sua alteração"
   ```
4. Envie para o seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request**

---

## 📬 Contato

Tem uma sugestão ou encontrou um bug? Abra uma issue no GitHub ou entre em contato:

- **GitHub Issues:** [https://github.com/seu-usuario/hub-music/issues](https://github.com/seu-usuario/hub-music/issues)
- **Email:** contato@hubmusic.local

---

## ⚠️ Aviso Legal

O Hub Music é uma plataforma de streaming de áudio open source que agrega conteúdo de APIs públicas (Deezer, Free To Use, Jamendo, LRCLIB). A plataforma não hospeda arquivos de áudio próprios. Usuários são responsáveis pelo uso adequado do conteúdo acessado via APIs públicas. Em caso de notificação de violação de direitos autorais (DMCA), o conteúdo será removido após verificação.

---

Feito com ❤️ e ☕ pela comunidade open source.
