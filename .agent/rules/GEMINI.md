---
trigger: always_on
---

# GEMINI.md - Sistema de Orçamentos NOHA

> Este arquivo define como o AI se comporta neste workspace.

---

## 🔴 PROJECT: SISTEMA NOHA (PRIORIDADE MÁXIMA)

> **ESTAS REGRAS PREVALECEM sobre qualquer skill, agent ou regra genérica do kit.**

### Referências Obrigatórias

| Documento | Quando Ler |
|-----------|------------|
| [`NOHA_Sistema_Orcamentos_PRD.md`](file:///Users/machenri/Documents/projetos-antigravity/Noha/docs/NOHA_Sistema_Orcamentos_PRD.md) | **SEMPRE** antes de implementar |
| `config/design-tokens.ts` | Para cores e espaçamentos |
| `app/globals.css` | Para variáveis CSS |

### Stack do Projeto
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Banco:** MongoDB Atlas (Mongoose)
- **Estilo:** TailwindCSS + Design Tokens Semânticos
- **Validação:** Zod
- **Animação:** GSAP Premium

---

### Leis da Arquitetura (INVIOLÁVEIS)

#### 1. Zod-First Validation
NENHUM dado entra no sistema sem um Schema Zod em `lib/schemas`.

#### 2. Separação de Preocupações (SoC)
- Arquivos `.tsx` = **Apenas Visual** (JSX)
- Se houver 3+ `useState` ou 1+ `useEffect` → **EXTRAIR** para `hooks/domain`

#### 3. UI Kit Puro
Componentes em `components/ui` são "burros". NUNCA importe Models ou Services.

#### 4. Server Actions para Mutações
Use `app/actions` para Criar/Editar/Deletar. Não use API Routes.

---

### Design Tokens - CORES E ESTILOS (CRÍTICO!)

⚠️ **NUNCA use cores fixas! Use classes semânticas:**

```tsx
// ✅ CORRETO - Dark Mode automático
<div className="bg-surface text-foreground border-border rounded-card">
<p className="text-text-muted">Secundário</p>
<button className="bg-primary">Ação</button>

// ❌ INCORRETO - Quebra Dark Mode
<div className="bg-white text-black border-gray-200 rounded-lg">
```

| Uso | Classe |
|-----|--------|
| Fundo página | `bg-background` |
| Cards/Modais | `bg-surface` |
| Texto principal | `text-foreground` |
| Texto secundário | `text-text-muted` |
| Cor da marca | `bg-primary`, `text-primary` |
| Bordas | `border-border` |
| Arredondamentos | `rounded-card`, `rounded-button`, `rounded-input` |
| Espaçamentos | `px-page-x`, `py-section-y`, `gap-gap-md` |

---

### Estrutura de Diretórios

```
app/(shop)/     → Site público
app/(admin)/    → Painel de controle
app/actions/    → Server Actions (mutações)
lib/schemas/    → Schemas Zod (validação)
hooks/domain/   → Lógica de negócio
hooks/ui/       → Interações visuais
components/ui/  → UI Kit (componentes puros)
config/         → Constantes e tokens
```

---

### Workflow para Nova Feature

Siga `.agent/skills/implementar-feature/SKILL.md`:

1. **Verificar** se schema/model/hook existem
2. **Schema Zod** → `lib/schemas/{entidade}.ts`
3. **Hook** → `hooks/domain/use{Entidade}Form.ts`
4. **Componente** → Apenas UI, consome o hook
5. **Action** → `app/actions/{entidade}.ts` com validação Zod

---

### Entidades do Sistema

| Entidade | Schema | Hook | Actions |
|----------|--------|------|---------|
| Product | ✅ | ✅ useProductForm | ✅ |
| Post | ✅ | ✅ usePostForm | ✅ |
| Author | ✅ | ✅ useAuthorForm | ✅ |
| Project | ✅ | ❌ | ✅ |
| Family | ✅ | ❌ | ✅ |

### Constantes Centralizadas

```typescript
import { STONE_TYPES, STONE_ORIGINS } from "@/config/defaults";
```

---

## CRITICAL: AGENT & SKILL PROTOCOL

> **MANDATORY:** Read the appropriate agent file and its skills BEFORE implementing.

### Modular Skill Loading Protocol

Agent activated → Check frontmatter "skills:" → Read SKILL.md → Read specific sections.

- **Selective Reading:** Read `SKILL.md` first, then only sections matching the request.
- **Rule Priority:** P0 (Project Rules acima) > P1 (GEMINI.md) > P2 (Agent) > P3 (Skill).

---

## 📥 REQUEST CLASSIFIER

**Before ANY action, classify the request:**

| Request Type     | Trigger Keywords                           | Active Tiers                   | Result                      |
| ---------------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| **QUESTION**     | "what is", "how does", "explain"           | TIER 0 only                    | Text Response               |
| **SURVEY/INTEL** | "analyze", "list files", "overview"        | TIER 0 + Explorer              | Session Intel (No File)     |
| **SIMPLE CODE**  | "fix", "add", "change" (single file)       | TIER 0 + TIER 1 (lite)         | Inline Edit                 |
| **COMPLEX CODE** | "build", "create", "implement", "refactor" | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md Required** |
| **DESIGN/UI**    | "design", "UI", "page", "dashboard"        | TIER 0 + TIER 1 + Agent        | **{task-slug}.md Required** |
| **SLASH CMD**    | /create, /orchestrate, /debug              | Command-specific flow          | Variable                    |

---

## 🤖 INTELLIGENT AGENT ROUTING

**Before responding to ANY request, analyze and select the best agent(s).**

### Auto-Selection Protocol

1. **Analyze (Silent)**: Detect domains (Frontend, Backend, Security, etc.)
2. **Select Agent(s)**: Choose the most appropriate specialist(s)
3. **Inform User**: State which expertise is being applied
4. **Apply**: Use the selected agent's persona and rules

### Response Format

```markdown
🤖 **Applying knowledge of `@[agent-name]`...**

[Continue with specialized response]
```

---

## TIER 0: UNIVERSAL RULES

### 🌐 Language Handling

- **Respond in user's language** (Portuguese BR for this project)
- **Code comments/variables** remain in English

### 🧹 Clean Code

**ALL code MUST follow `@[skills/clean-code]` rules:**

- Concise, direct, no over-engineering
- Self-documenting code
- Testing: Pyramid (Unit > Int > E2E)

### 🧠 Read → Understand → Apply

```
❌ WRONG: Read agent file → Start coding
✅ CORRECT: Read → Understand WHY → Apply PRINCIPLES → Code
```

---

## 🛑 SOCRATIC GATE

**MANDATORY: Complex requests must pass through the Socratic Gate.**

| Request Type            | Strategy       | Required Action                     |
| ----------------------- | -------------- | ----------------------------------- |
| **New Feature / Build** | Deep Discovery | ASK minimum 3 strategic questions   |
| **Code Edit / Bug Fix** | Context Check  | Confirm understanding + ask impact  |
| **Vague / Simple**      | Clarification  | Ask Purpose, Users, and Scope       |

**Protocol:**
1. **Never Assume:** If even 1% is unclear, ASK.
2. **Wait:** Do NOT write code until the user clears the Gate.

---

## TIER 1: CODE RULES

### 📱 Project Type Routing

| Project Type | Primary Agent | Skills |
| ------------ | ------------- | ------ |
| **WEB** (Next.js, React) | `frontend-specialist` | frontend-design, react-patterns |
| **BACKEND** (API, DB) | `backend-specialist` | api-patterns, database-design |

### 🏁 Final Checklist Protocol

**Trigger:** "final checks", "validar", "testar tudo"

| Task Stage | Command | Purpose |
| ---------- | ------- | ------- |
| **Manual Audit** | `python .agent/scripts/checklist.py .` | Priority-based audit |
| **Pre-Deploy** | `python .agent/scripts/verify_all.py . --url <URL>` | Full Suite |

---

## 📁 QUICK REFERENCE

### Agents & Skills

- **Masters**: `orchestrator`, `project-planner`, `frontend-specialist`, `backend-specialist`, `debugger`
- **Key Skills**: `clean-code`, `brainstorming`, `frontend-design`, `plan-writing`

### Key Scripts

- **Verify**: `.agent/scripts/verify_all.py`, `.agent/scripts/checklist.py`
- **Audits**: `ux_audit.py`, `lighthouse_audit.py`, `seo_checker.py`

---

## Regras de Comunicação

- Explique o **porquê** da decisão antes do código
- Se pedirem algo que quebre uma regra, **recuse educadamente** e sugira a forma correta
- **SEMPRE** responda em Português do Brasil
