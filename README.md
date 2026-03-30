# NOHA - Sistema de Orçamentos

Sistema de orçamentos e benchmarking de alto padrão (Luxury SaaS) focado em usabilidade premium, precisão matemática e autonomia comercial do vendedor.

## 📁 Documentação e Regras de Negócio (`/docs`)

Toda a inteligência do sistema e manuais de especificação estão centralizados na pasta de documentos (`/docs` ou na própria raiz do projeto). 

Documentos oficiais críticos:
- **`NOHA_Sistema_Orcamentos_PRD.md`**: Documento de Requisitos do Produto (PRD). Contém absoluta e estritamente todas as regras de negócios, markup reverso, fórmula do CMV e lógica dos descontos/ágios de Tiers (Basic/Premium). **Leitura obrigatória** antes de alterar o motor de cálculos (`useBudgetStore`).

## 🛠 Stack Tecnológica
- **Frontend:** React + TypeScript + Vite
- **Estilização:** Tailwind CSS + NOHA UI Kit (Design Tokens exclusivos)
- **Gerenciamento de Estado:** Zustand (Valores com persistência via `localStorage`)
- **Aesthetics (UI/UX):** Minimalista / Luxury SaaS (Paleta focada em cor primária Taupe `#BCA68F`, micro-assets e botões "Chips" discretos).

## 🚀 Como iniciar o projeto

Para rodar o simulador de vendas/orçamentos localmente:

```bash
cd frontend
npm install
npm run dev
```

## 📂 Estrutura Principal do Projeto

```text
/frontend
  /src
    /components       # Componentes React principais
      /ui             # Componentes base (Buttons, Switches)
    /store            # Lógicas de estado (Zustand)
    App.tsx           # Entry point do Wizard de Orçamentos
    index.css         # Importações do Tailwind
/docs                 # Documentação oficial do projeto
```

## 🧠 Arquitetura de Estado (Features)
O motor central do app (`useBudgetStore.ts`) abstrai a complexidade do cálculo do *RoomConfigurator*. Ele gerencia:
- O histórico preditivo e médias do Algoritmo M3.
- Suporte a **Overrides Financeiros (Custom Price)** diretamente pelo Vendedor da ponta.
- Cascata em tempo real para o Painel de Resumo (CMV, Deduções Livres, Setup Fee e Valor Final de Venda).
