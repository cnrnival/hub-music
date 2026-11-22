# 🚀 Deploy do Hub Music no Vercel

Este guia explica como colocar o **Hub Music** em produção usando **Vercel para o frontend** e serviços separados para **backend e banco de dados**.

> ⚠️ **Importante:** O Vercel é otimizado para frontends estáticos e funções serverless curtas. Como o backend do Hub Music precisa de:
> - Conexão persistente com MySQL
>
> Recomendamos **não rodar o backend no Vercel**. Use um serviço dedicado para o backend (Render) e mantenha apenas o frontend no Vercel.

---

## 📋 Visão geral da arquitetura em produção

```
┌─────────────────┐      HTTPS      ┌──────────────────┐
│   Usuário       │ ───────────────►│   Vercel         │
│  (Navegador)    │                 │  (Frontend)      │
└─────────────────┘                 │  (React + Vite)  │
                                   └──────────┬─────────┘
                                              │ HTTPS/API
                                              ▼
                                   ┌──────────────────┐
                                   │   Backend        │
                                   │  (Render)│
                                   │  Fastify + Prisma│
                                   └──────────┬─────────┘
                                              │ SQL
                                              ▼
                                   ┌──────────────────┐
                                   │  MySQL               │
                                   │  (Render)│
                                   └──────────────────┘
```

---

## 1️⃣ Passo a passo no Vercel (Frontend)

### A. Criar o repositório no GitHub

```powershell
# Na raiz do projeto
git add .
git commit -m "feat: preparar deploy no Vercel"
git remote add origin https://github.com/SEU_USUARIO/hub-music.git
git push -u origin main
```

> O arquivo `.gitignore` já protege `.env`, `estudo/` e `rea_spotify/` — nada sensível será enviado.

### B. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione seu repositório `hub-music`
4. Nas configurações de build, informe:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Dev Command:** `npm run dev`

### C. Variáveis de ambiente no Vercel

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

| Variável | Valor de exemplo | Obrigatório |
|----------|-----------------|-------------|
| `VITE_API_URL` | `https://hub-music-api.onrender.com` | ✅ Sim |

> O `VITE_API_URL` deve apontar para o seu backend (veja a seção 2 abaixo).

### D. Deploy

Após salvar as variáveis, o Vercel fará o build e deploy automático. Você receberá uma URL como:

```
https://hub-music-git-seuusuario-vercel.app.vercel.app
```

---

## 2️⃣ Backend (não no Vercel)

Como o backend precisa de conexão estável com banco de dados, hospede em um serviço dedicado:

### Opções recomendadas

| Serviço | Por que | Custo aproximado |
|---------|---------|------------------|
| **Render** | Nativo, banco MySQL incluído | Grátis / $7/mês |

### Exemplo com Render

1. Crie um "Web Service" no Render conectando seu GitHub
2. Root Directory: `backend`
3. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start Command: `npm start`
5. Adicione as variáveis de ambiente (mesmas do `.env`, exceto `DATABASE_URL` que pode ser gerenciado pelo Render)

### Variáveis necessárias no backend

| Variável | Exemplo |
|----------|---------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | `sua-chave-secreta-muito-longa` |
| `JWT_REFRESH_SECRET` | `outra-chave-diferente` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://seu-app.vercel.app` |
| `DEEZER_API_URL` | `https://api.deezer.com` |
| `MUSICBRAINZ_USER_AGENT` | `HubMusic/1.0` |
| `FREETOUSE_API_URL` | `https://api.freetouse.com/v3` |
| `JAMENDO_CLIENT_ID` | `seu-id` (opcional) |
| `LRCLIB_API_URL` | `https://lrclib.net/api` |
| `SAYMUSIC_API_URL` | `https://sayamusicapi...` |

---

## 3️⃣ Banco de Dados (MySQL)

O banco MySQL é nativo do Render — nada para configurar manualmente!

Quando você conectar seu GitHub ao Render, ele automaticamente cria o banco `hub-music-db` (veja o arquivo `render.yaml`).

A `DATABASE_URL` é obtida do banco via `fromDatabase` no `render.yaml`.

---

## 5️⃣ Estrutura final recomendada

```
hub-music/
├── backend/              → Render
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/             → Vercel
│   ├── src/
│   ├── vercel.json       ← criado acima
│   ├── vite.config.ts
│   └── package.json
├── estudo/               → .gitignore (não sobe)
├── .gitignore            → protege .env e estudo/
├── .env                  → LOCAL APENAS
├── .env.example          → público (sem senhas)
└── README.md
```

---

## 6️⃣ Checklist antes do deploy

- [ ] Repositório no GitHub (público ou privado)
- [ ] `.env` NÃO foi commited (está no `.gitignore`)
- [ ] `estudo/` e `rea_spotify/` não estão no commit (estão no `.gitignore`)
- [ ] Backend hospedado (Render) com variáveis configuradas
- [ ] MySQL rodando (Render externo)
- [ ] `VITE_API_URL` configurado no Vercel apontando para o backend
- [ ] Build do frontend funciona localmente: `cd frontend && npm run build`

---

## 7️⃣ Comandos úteis

```powershell
# Build local do frontend para testar
cd frontend
npm run build
npm run preview

# Verificar se o build não quebra
cd ../backend
npm run build

# Migrações do banco (local)
cd backend
npm run prisma:migrate
npm run prisma:studio
```

---

## 8️⃣ Problemas comuns

| Problema | Solução |
|----------|---------|
| CORS no frontend | No backend, configure `CORS` com a URL do Vercel (`FRONTEND_URL`) |
| Build falha no Vercel | Verifique se todas as dependências estão no `package.json` do frontend |
| Banco não conecta | Verifique se o `DATABASE_URL` está correto e se o banco aceita conexões do IP do servidor |

---

## 📞 Suporte

Se encontrar erro no build do Vercel, verifique os **Function Logs** no painel do Vercel e compartilhe a mensagem de erro aqui para ajustarmos.
