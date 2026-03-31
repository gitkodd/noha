# Infraestrutura Cloud: Supabase + Vercel

O NOHA utiliza uma arquitetura moderna de nuvem para garantir que os dados sejam acessíveis de qualquer lugar e que o deploy seja contínuo.

## 🗄️ Backend: Supabase

O **Supabase** atua como nossa plataforma de Backend-as-a-Service (BaaS).

### 1. Banco de Dados (PostgreSQL)
- **Tabelas:** `projects` (pai), `rooms` (filho), `items` (neto).
- **Relacionamentos:** Cascade deletes configurados para que, ao apagar um projeto, todos os seus ambientes e itens sejam removidos automaticamente.

### 2. Variáveis de Ambiente (CRÍTICO)
O projeto utiliza o bundler **Vite**. Por segurança, o Vite só expõe ao navegador variáveis que comecem com o prefixo `VITE_`.
- `VITE_SUPABASE_URL`: O endpoint da sua API no Supabase.
- `VITE_SUPABASE_ANON_KEY`: A chave pública Anon.

---

## 🚀 Frontend & Deploy: Vercel

A **Vercel** hospeda o projeto e gerencia o ciclo de vida do código.

### 1. Ciclo de Deploy (CI/CD)
Toda alteração enviada para a branch `main` no GitHub dispara um build automático na Vercel.
- **Build Command:** `npm run build` (dentro da pasta `frontend`).
- **Output Directory:** `dist`.

### 2. Configuração de Variáveis
As variáveis `VITE_` devem ser configuradas no painel da Vercel (Settings -> Environment Variables) para que o site funcione em produção.

---

## ⚠️ Troubleshooting Comum

### Tela Branca em Produção
Geralmente causada por variáveis de ambiente ausentes ou sem o prefixo `VITE_`. Verifique os logs de inspeção no navegador (F12).

### Erros de Conexão Locais
Certifique-se de que o seu arquivo `.env.local` contenha as chaves de produção se desejar testar os dados reais da nuvem localmente.
bau
