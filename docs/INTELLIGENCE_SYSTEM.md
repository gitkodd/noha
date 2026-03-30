# Sistema de Inteligência NOHA

> **Última atualização:** 2026-03-30  
> **Arquivo central:** `frontend/src/lib/intelligence.ts`

---

## Visão Geral

A "Inteligência NOHA" é um motor de análise baseado em dados históricos reais de 4 projetos executados. Ela compara o orçamento atual com o que de fato foi gasto em projetos anteriores, gerando três saídas principais:

1. **RiskRadar** — Análise de risco por cômodo/categoria
2. **DNA Drawer** — Similaridade com projetos históricos
3. **IntelligenceDashboard** — KPIs gerais de performance histórica

---

## Fonte de Dados

### Projetos Históricos Válidos (4)
- **Mafe 2.0** — Referência principal
- **Jaqueline 2.0** — Referência principal
- **Susana 2.0** — Referência principal
- **Debora Packer** — Referência principal

> ⚠️ **IMPORTANTE:** Os projetos Angela e Lilian foram **removidos** do histórico em março/2026 por terem planilhas incompletas/inconsistentes que distorciam as médias. Nunca adicione projetos ao histórico sem validar a completude dos dados.

### Arquivo de Dados
`frontend/src/data/historicalProjects.ts` — contém os dados brutos.  
`pro_extract.py` (raiz do projeto) — script Python que extrai dados das planilhas Excel e regenera `db.json`.

---

## Categorias de Custo

| Código | Label | Descrição |
|--------|-------|-----------|
| `CONSTRUCAO` | Obra Civil | Piso, elétrica, hidráulica |
| `MOVEIS` | Móveis | Marcenaria sob medida |
| `PRODUTOS` | Produtos & Acessórios | Amazon, itens comprados |
| `MAO_DE_OBRA` | Mão de Obra | Marceneiro e instaladores |
| `MAO_DE_OBRA_G` | Gestão de Obra | Equipe de gestão e coordenação |
| `EXTRAS` | Extras & Imprevistos | Itens fora do escopo |
| `DECORACAO` | Decoração | Acessórios e arte (% do CMV) |
| `PACOTES_TEMATICOS` | Pacotes Temáticos | Cenários e tematização |

---

## Lógica do RiskRadar

### O que é o `bufferPct`?

O buffer é calculado por `getRoomBuffer(roomType)` em `intelligence.ts`. Ele representa a **média de sobredesvio histórico** de uma categoria específica para aquele tipo de cômodo.

**Regras críticas do buffer (corrigidas em 2026-03):**

1. **Sem mínimo forçado:** O buffer pode ser `0%`. Antes havia um mínimo artificial de 5% que gerava falsos alertas.
2. **Threshold de 2.5%:** Só é sugerido buffer quando o risco histórico é ≥ 2.5%. Abaixo disso, é considerado ruído estatístico.
3. **EXTRAS excluído do cálculo:** A categoria EXTRAS tem desvio médio de ~80% por natureza (imprevistos), mas foi excluída do cálculo automático de buffer para não inflar artificialmente o orçamento.

```typescript
// CORRETO — intelligence.ts
function getRoomBuffer(roomType: RoomType): { bufferPct: number; isMocked: boolean } {
  // ...calcula desvio médio EXCLUINDO extras...
  const avgDeviation = /* média sem EXTRAS */
  
  if (avgDeviation >= 2.5) return { bufferPct: Math.round(avgDeviation), isMocked }
  return { bufferPct: 0, isMocked }  // sem buffer quando risco < 2.5%
}
```

### Estados do RiskRadar (lógica completa)

O RiskRadar recebe 4 props:
- `roomType`: tipo do cômodo
- `baseValue`: preço benchmark histórico (sem buffer)
- `currentValue`: preço atual configurado pelo usuário
- `onApplyBuffer`: callback para aplicar o buffer sugerido

**Lógica de exibição do badge (header):**
```
currentValue < baseValue     → "Abaixo da média ⚠️" (rose)
currentValue >= baseValue + bufferPct > 0  → "Risco: +X%" (amber)  
currentValue >= baseValue + bufferPct = 0  → "Margem OK ✓" (accent-intel)
```

**Lógica do footer:**
```
currentValue < baseValue  → Alerta rose: "X% abaixo da média histórica de $Y"
bufferAlreadyApplied OR bufferPct = 0 → Confirmação accent-intel: "sem sobreriscos"
else → null (nenhuma mensagem)
```

> 🐛 **BUG CORRIGIDO (2026-03-30):** O footer anteriormente mostrava "sem sobreriscos" baseado apenas em `bufferPct === 0`, ignorando se `currentValue < baseValue`. Com preço de `$1.000` vs benchmark de `$11.804`, exibia falso positivo. Corrigido com a condicional `currentValue < baseValue` prioritária.

---

## DNA Drawer — Similaridade de Projetos

### Como o Score é Calculado

A função `getSimilarProjects(config)` compara o perfil do orçamento atual com cada projeto histórico usando pontuação por dimensão:

| Dimensão | Pontos | Critério |
|----------|--------|---------|
| nº de Temáticos | 0–30 | Diferença proporcional |
| nº de Adultos | 0–20 | Diferença proporcional |
| nº de Lofts | 0–15 | Exato/proporcional |
| Game Rooms | 0–15 | Exato/proporcional |
| Lanai | 0–10 | Tem ou não tem |
| Faixa de CMV | 0–10 | Diferença % do CMV estimado |

**Score ≥ 70%** = projetos muito próximos em perfil → confiança alta para usar como referência  
**Score 40–69%** = projetos parcialmente similares → usar com ressalva  
**Score < 40%** = pouca similaridade → apenas informativo

### Componentes do DNA

| Componente | Localização | Contexto |
|-----------|-------------|---------|
| `DNACard.tsx` | Dentro do SummaryPanel (dark) | Versão compacta, fundo escuro |
| `DNADrawer.tsx` | Off-canvas lateral | Versão detalhada, fundo surface-warm |

---

## IntelligenceDashboard

Acessado pelo botão "Ver Inteligência" no header da etapa 2.

**KPIs exibidos:**
- CMV Médio por Projeto
- Desvio Médio Geral (real vs orçado)
- Custo médio por Quarto Temático
- Custo médio por Quarto Adulto

**Gráficos:**
- CMV Orçado vs. Real (por projeto)
- Margem por Categoria (desvio % de todas as categorias)

**Interpretação dos desvios:**
- Desvio negativo (-X%) = custo real ABAIXO do orçado → boa notícia (você orça mais do que gasta)
- Desvio positivo (+X%) = custo real ACIMA do orçado → atenção (risco de margem)

> ℹ️ O desvio médio geral histórico do NOHA é **-10.6%**, ou seja, os projetos tendem a custar ~10% menos do que fue orçado. Isso é saudável.

---

## Dados Estimados (isMocked)

Alguns projetos ou categorias podem ter dados incompletos. Nesses casos, o sistema usa projeções baseadas em médias. Esses dados são sinalizado com:
- Ícone 🧪 (FlaskConical)
- Badge "estimado" em amber

Isso é transparente ao usuário e não afeta a precisão dos outros dados.

---

## Como Adicionar um Novo Projeto Histórico

1. Adicione a planilha na pasta de dados fonte
2. Execute `python pro_extract.py` na raiz do projeto para regenerar `db.json`
3. Valide que o projeto tem **todos os campos obrigatórios** preenchidos:
   - `totalPriceCost` (CMV orçado)
   - `totalActualCost` (CMV real)
   - Breakdowns por categoria
4. Verifique se o desvio médio do novo projeto não está distorcendo as médias históricas
5. Se o projeto for de perfil muito diferente (ex: apenas 1 cômodo), opte por marcá-lo como `isMocked: true` ou não incluir
