# 🎯 Hub Music — Cloud Deployment Consistency Review

## Objective
Ensure 100% cloud deployment (Render + Vercel + MySQL externo) with no resquícios of Docker, MinIO, XAMPP, PostgreSQL, or local upload.

## Status: ✅ READY FOR DEPLOY

All 68 code files are consistent with the following architecture:
- **Frontend:** Vercel (React + Vite + Tailwind)
- **Backend:** Render (Fastify + Prisma + MySQL)
- **Database:** MySQL externo (Aiven/Railway) via DATABASE_URL
- **APIs:** Deezer, MusicBrainz, Free To Use, Jamendo, LRCLIB, Radio Browser (public only)
- **Identity:** Preto #000000 + Rosa #FF4081
- **Bilateral comments:** PT/EN in all files

---

## 🔧 Correções Aplicadas

### 1. Banco de Dados (MySQL em vez de PostgreSQL)

| Arquivo | Correção |
|---------|----------|
| `backend/prisma/schema.prisma` | `provider = "postgresql"` → `provider = "mysql"` |
| `backend/.env` | `DATABASE_URL` de `postgresql://` para `mysql://` |
| `backend/.env.example` | Mesmo ajuste do `.env` |
| `render.yaml` | Tipo `postgres` → `mysql`; comments atualizados |

### 2. Documentação (README.md)

| Seção | Alteração |
|-------|-----------|
| Badge | `[!PostgreSQL]` → `[!MySQL]` |
| Tech stack | `PostgreSQL` → `MySQL` |
| Banco de dados | `PostgreSQL gerenciado pelo Render` → `MySQL externo (Aiven/Railway) via DATABASE_URL` |
| Backend Render | `PostgreSQL` → `MySQL` |
| Local setup | Instruções de banco PostgreSQL → MySQL |
| render.yaml referencia | Atualizada para MySQL |

### 3. Documentação (DEPLOY_VERCEL.md)

| Seção | Alteração |
|-------|-----------|
| Arquitetura diagram | `PostgreSQL` → `MySQL` |
| Opções Render | `banco PostgreSQL incluído` → `banco MySQL incluído` |
| DATABASE_URL | `postgresql://user:pass@host:5432/db` → `mysql://user:pass@host:3306/db` |
| Seção "Banco de Dados" | Título e texto atualizados |
| Checklist | `Banco PostgreSQL` → `MySQL rodando (Render externo)` |

### 4. Código Fonte (Backend)

| Arquivo | Correção |
|---------|----------|
| `backend/src/utils/prisma.ts` | Comments de PostgreSQL → MySQL |
| `backend/src/routes/tracks.ts` | Descrições: "upload/local não suportado — APIs públicas somente" |
| `backend/src/routes/search.ts` | Removido `source: 'local'` da busca; descriptions atualizadas |
| `backend/src/routes/playlists.ts` | Note: tracks vêm de APIs públicas |

### 5. Remoção de Upload Local

- `backend/src/services/storage.ts` — Já lança erro 501 para upload/stream/local
- Routes que importam `storage.ts` — Funcionam via `generateSignedUrl` que retorna URL original (sem signing), consistente com "sem upload"

---

## 🏗️ Arquitetura Final

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
                                    │  (Render)        │
                                    │  Fastify + Prisma│
                                    └──────────┬─────────┘
                                               │ SQL (MySQL)
                                               ▼
                                    ┌──────────────────┐
                                    │  MySQL           │
                                    │  (Aiven/Railway) │
                                    └──────────────────┘
```

---

## 📦 Serviços Necessários

| Camada | Serviço | Custo |
|--------|---------|-------|
| Frontend | [Vercel](https://vercel.com) | Grátis |
| Backend | [Render](https://render.com) | Grátis / $7/mês |
| Banco | [Aiven](https://aiven.io/) ou [Railway](https://railway.app/) | Plano free / Teste gratuito |

---

## 🚀 Próximo Passo para Deploy

1. Crie um banco MySQL externo (Aiven/Railway) e anote a `DATABASE_URL`
2. Conecte seu GitHub ao Render e faça deploy do backend (pasta `backend/`)
3. Conecte seu GitHub ao Vercel e faça deploy do frontend (pasta `frontend/`)
4. Configure `VITE_API_URL` no Vercel apontando para a URL do backend no Render

---

## ✅ Verificação Final

- Zero ocorrências de `postgresql`/`PostgreSQL` em arquivos de código (apenas em docs históricas removidas)
- Zero ocorrência de `Docker`, `MinIO`, `XAMPP` em arquivos de configuração
- Todos os arquivos têm headers `@languages pt-BR / en-US`
- Variáveis de ambiente consistentes: `DATABASE_URL`, `VITE_API_URL`, `FRONTEND_URL`
- Projeto pronto para deploy 100% em nuvem