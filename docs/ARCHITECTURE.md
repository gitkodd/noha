# Arquitetura de Software e UX

O modelo arquitetural do **NOHA** privilegia a simplicidade com componentes agnósticos de rota e estado desacoplado da UI via Zustand.

## O Wizard (Stepper)

A navegação de etapas utiliza o componente `<App />` atuando como Maestro. As etapas mapeiam IDs sequenciais `[1, 2, 3, 4]`.
Originalmente existia bloqueios condicionais obrigando a linearidade (ex: não avançar da etapa 1 sem ler aprovar). Atualmente a navegação superior é **livre** `(cursor-pointer)`, permitindo que o executivo de vendas pule etapas para montar e demonstrar orçamentos customizados dinamicamente durante uma *call* sem sofrer frustrações com validações excessivas.

## Estado Global Persistido (Zustand `useBudgetStore`)

A store central guarda todos os dados temporários e fixos:

1. `globalSettings`: Configura de forma rígida a matriz de preços (`roomBasePrices`), % de comissões e Tiers (`Basic/Premium`). Só é modificado via modal Admin.
2. `rooms`: O que o usuário selecionou ativamente no orçamento `(id, base, custom, active, multiplier)`.
3. `commissions`: Quais comissões o cliente escolheu manter LIGADAS e aplicar na transação `(markup, projeto, adm)`.
4. `activeStep`: Qual a tela atual.
5. **PersistMiddleware:** Utiliza cache assíncrono do browser `({ name: 'noha-budget-storage' })`. Graças a isso, a guia pode ser movida, atualizada ou fechada no meio da negociação. A aplicação retoma de onde parou.

## CSS e Design System

> 📄 **Documentação completa:** Ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

O sistema usa uma paleta semântica de 3 camadas:
- **`primary`** (`#BCA68F` — areia/cobre): cor da marca, header, tiers, bordas
- **`accent-intel`** (`#9B6A2F` — dourado/cognac): exclusivo para UI de Inteligência (DNA, RiskRadar, benchmarking)
- **Semânticas** (`emerald`, `rose`, `amber`): apenas para estados de dados (bom/ruim/aviso)

Cores extintas e **proibidas:** `violet-*`, `indigo-*`, `emerald-*` como fundo de seção.

- Construído baseando-se em `flexbox`, garantindo zero comportamentos inesperados ao re-renderizar.
- Modal administrativo invocado globalmente via `React.createPortal()` para impedir conflitos de z-index.
- Tokens CSS definidos em `src/index.css` e registrados no `tailwind.config.js`.

