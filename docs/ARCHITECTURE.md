# Arquitetura de Software e UX

O modelo arquitetural do **NOHA** privilegia a simplicidade com componentes agnósticos de rota e estado desacoplado da UI via Zustand.

## O Wizard (Stepper)

A navegação de etapas utiliza o componente `<App />` atuando como Maestro. As etapas mapeiam IDs sequenciais `[1, 2, 3]`.
Atualmente a navegação superior é **livre** `(cursor-pointer)`, permitindo que o executivo de vendas pule etapas para montar e demonstrar orçamentos customizados dinamicamente durante uma *call*.

---

## Gestão de Estado e Persistência Cloud

O sistema utiliza duas camadas de estado via **Zustand**:

### 1. Estado Volátil / Local (`useBudgetStore`)
Guarda os dados temporários do orçamento atual (seleção de ambientes, multiplicadores e taxas). Utiliza `localStorage` para persistência de sessão curta no browser.

### 2. Estado em Nuvem (`useProjectStore`)
Gerencia a persistência definitiva via **Supabase (PostgreSQL)**. 
- **Sincronização:** Os projetos, quartos e itens são buscados dinamicamente da nuvem.
- **Mapeamento:** O Store traduz o esquema relacional do Postgres para as interfaces TypeScript utilizadas no frontend.

### 3. Autenticação e Segurança (`useAuthStore`)
Guarda a sessão do **Supabase Auth**. Atua como gatekeeper no roteamento principal (`App.tsx`).

---

## Infraestrutura e Segurança

> 📄 **Documentação completa:** Ver [`SECURITY_PROTOCOL.md`](./SECURITY_PROTOCOL.md) | [`CLOUD_INFRASTRUCTURE.md`](./CLOUD_INFRASTRUCTURE.md)

- **Backend:** Supabase (Auth + DB Relacional).
- **Segurança:** Row Level Security (RLS) ativado por padrão em todas as tabelas.
- **Frontend:** React + Vite (Prefixos `VITE_` obrigatórios para envs).

## CSS e Design System

O sistema usa uma paleta semântica de 3 camadas detalhadas em [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
Tokens CSS definidos em `src/index.css` e registrados no `tailwind.config.js`.
