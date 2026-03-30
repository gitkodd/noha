# Design System — NOHA

> **Última atualização:** 2026-03-30  
> **Status:** Ativo e aplicado em todos os componentes

---

## Princípio Fundamental

> *"Restraint is luxury."*

O sistema foi projetado para transmitir sofisticação pelo que **não** usa, não pelo excesso. Uma cor de marca, um acento de inteligência, cores semânticas moderadas.

---

## Paleta de 3 Camadas

### Camada 1 — Brand (Primária)

| Token CSS | Valor | Classe Tailwind | Uso |
|-----------|-------|-----------------|-----|
| `--primary` | `hsl(31 29% 65%)` ≈ `#BCA68F` | `bg-primary`, `text-primary`, `border-primary` | Cor da marca — areia/cobre suave |
| `--primary-foreground` | `hsl(0 0% 100%)` | `text-primary-foreground` | Texto sobre fundos de primary |

**Quando usar `primary`:** Header, tier ativo no stepper, bordas de destaque, tags de informação secundária.

### Camada 2 — Intel (Acento de Inteligência)

| Token CSS | Valor | Classe Tailwind | Uso |
|-----------|-------|-----------------|-----|
| `--accent-intel` | `hsl(30 55% 40%)` ≈ `#9B6A2F` | `bg-accent-intel`, `text-accent-intel` | Dourado/cognac — EXCLUSIVO para UI de Inteligência |
| `--accent-intel-foreground` | `hsl(0 0% 100%)` | `text-accent-intel-foreground` | Texto sobre fundos de intel |

**Quando usar `accent-intel`:** Ícone DNA, botão "Ver Inteligência", box Benchmarking, RiskRadar header, KPI header, badge de score no DNACard, barras de similaridade alta (≥70%).

> ⚠️ **REGRA CRÍTICA:** `accent-intel` é reservado exclusivamente para elementos de "inteligência/análise". Nunca use em botões de ação genérica, formulários ou navegação.

### Camada 3 — Semântica (Funcional)

Estas cores são **funcionais**, não de marca. Use apenas para indicar estados de dados:

| Cor | Tailwind | Quando usar |
|-----|----------|-------------|
| `emerald` | `text-emerald-600`, `bg-emerald-400` | Desvio negativo (economizou vs orçado) |
| `rose` | `text-rose-600`, `bg-rose-500` | Desvio positivo (gastou acima do orçado) / Preço abaixo do benchmark |
| `amber` | `text-amber-600`, `bg-amber-400` | Aviso moderado / Risco de margem / Dados estimados |

> ✅ Emerald/Rose/Amber **são permitidos** em CategoryRow, DeviationBadge e alertas de risco — são semânticos, não de marca.

---

## Superfícies (Backgrounds)

| Token CSS | Valor | Classe Tailwind | Uso |
|-----------|-------|-----------------|-----|
| `--background` | `hsl(40 33% 98%)` | `bg-background` | Fundo da página — off-white areia |
| `--surface-warm` | `hsl(38 40% 97%)` | `bg-surface-warm` | Drawers, RiskRadar, painéis claros — off-white mais quente |
| `--card` | `hsl(0 0% 100%)` | `bg-card` | Cards e modais brancos |
| SummaryPanel | `from-stone-800 to-stone-900` | (hardcoded dark) | Painel dark do resumo — intencionalmente escuro e premium |

> ℹ️ O DNA Drawer usa `bg-surface-warm` (off-white areia), NÃO `bg-white` frio. Isso o conecta visualmente à identidade da marca sem ser escuro como o SummaryPanel.

---

## Bordas e Textos

| Token CSS | Classe Tailwind | Uso |
|-----------|-----------------|-----|
| `--border` | `border-border` | Bordas padrão de cards e inputs |
| `--foreground` | `text-foreground` | Texto principal |
| `text-foreground/70` | — | Texto secundário/labels |
| `text-foreground/40` | — | Texto terciário/placeholders |

---

## Regras Proibidas (NUNCA FAÇA)

```tsx
// ❌ ERRADO — cores extintas do sistema
<div className="bg-violet-600">       // violet não existe no design system
<div className="bg-indigo-50">        // indigo não existe no design system
<div className="bg-emerald-50">       // emerald-50 como fundo de seção = viola identidade
<div className="text-violet-400">     // substitua por text-accent-intel
<div className="text-indigo-800">     // substitua por text-foreground

// ✅ CORRETO
<div className="bg-accent-intel">
<div className="bg-surface-warm">
<div className="text-accent-intel">
<div className="text-foreground">
```

---

## Componentes e Seus Temas

### `SummaryPanel.tsx` — Dark Panel
- Fundo: `from-stone-800 to-stone-900` (gradient dark charcoal)
- Texto: `text-white`, `text-white/70`, `text-white/40`
- Botão DNA: `bg-accent-intel/15 border-accent-intel/25 text-accent-intel`
- DNACard (dentro do SummaryPanel): score em `text-accent-intel`, barra em `bg-accent-intel`

### `DNADrawer.tsx` — Off-white Drawer
- Fundo: `bg-surface-warm`
- Accent line topo: `bg-accent-intel` (1px, identifica que é componente de inteligência)
- Header icon: `bg-accent-intel`
- Score: `text-accent-intel`
- Tags de similaridade: `bg-primary/10 text-foreground/70 border-primary/20`
- Barra de score: `bg-accent-intel` (≥70%), `bg-primary` (40-69%), `bg-border` (<40%)
- Composição box: `bg-white/70 border-primary/20`

### `RoomConfigurator.tsx`
- Input com preço customizado: `bg-primary/8 border-primary/40`
- Botão "Restaurar": `text-primary`
- Botão "Aplicar Média": `bg-primary/10 border-primary/25`
- Box Inteligência NOHA: `bg-accent-intel/8 border-accent-intel/20 text-accent-intel`
- Badge "Margem Segura": `bg-accent-intel/10 text-accent-intel border-accent-intel/25`
- Badge "Risco de Margem": `bg-amber-50 text-amber-700 border-amber-200/50` (semântico)

### `RiskRadar.tsx`
- Fundo geral: `bg-surface-warm border-border`
- Header ícone: `text-accent-intel`
- Badge "Margem OK ✓": `bg-accent-intel/10 text-accent-intel`
- Badge "Abaixo da média ⚠️": `bg-rose-50 text-rose-600 border-rose-200`
- Badge "Risco: +X%": `bg-amber-50 text-amber-700 border-amber-200`
- Footer OK: `bg-accent-intel text-accent-intel-foreground`
- Footer alerta: `bg-rose-50 text-rose-700 border-rose-200`
- CategoryRow dots/textos: `emerald` (negativo), `amber` (0-15%), `rose` (>15%) — semântico ✅

### `IntelligenceDashboard.tsx`
- Header icon: `bg-accent-intel shadow-accent-intel/20`
- KPICard tipo "intel": `bg-accent-intel shadow-accent-intel/20`
- Ícones BarChart3, Target: `text-accent-intel`
- Nota de rodapé: `bg-surface-warm border-primary/20`
- riskColor() function: mantém emerald/amber/rose para estados de desvio — semântico ✅

### `CommissionPanel.tsx`
- Ícone "Fee de Projeto": `text-primary`
- Ícone "Fee Operacional": `text-accent-intel`

### `ConfigModal.tsx`
- Barra lateral "Fee de Projeto": `bg-primary`
- Barra lateral "Fee Operacional": `bg-accent-intel`

### `App.tsx`
- Botão "Ver Inteligência": `bg-accent-intel shadow-accent-intel/20`

---

## Dark Mode

Os tokens estão definidos para `.dark` no `index.css`. No dark mode:
- `--accent-intel` passa de `hsl(30 55% 40%)` para `hsl(30 55% 50%)` (mais claro para manter contraste)
- `--surface-warm` passa de `hsl(38 40% 97%)` para `hsl(30 20% 16%)` (escuro quente)

---

## Como Adicionar um Novo Componente

1. **Precisa identificar "inteligência"?** → Use `accent-intel`
2. **Precisa de fundo claro/painel?** → Use `surface-warm` ou `bg-white/70`
3. **É um estado positivo/negativo de dado?** → Use as cores semânticas (emerald/rose/amber)
4. **É um elemento primário da marca?** → Use `primary`
5. **Nunca** use `violet-*`, `indigo-*` ou `emerald-*` como cor de fundo de seção
