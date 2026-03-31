# NOHA CONCEPT - Sistema de Orçamentos

> Documentação Técnica e Funcional  
> Versão: 2.0 (Março 2026)  
> Documento: PRD - Product Requirements Document  
> Status: Em Desenvolvimento  

---

## 1. Visão Geral do Sistema

### 1.1 Contexto
A NOHA Concept atua na modularização de casas para locação nos Estados Unidos, transformando imóveis residenciais em propriedades temáticas de alto padrão para o mercado de vacation rental. O processo envolve a reforma completa de cada imóvel: quartos temáticos, áreas sociais, espaços de entretenimento e toda a infraestrutura necessária para uma experiência premium de hospedagem.

### 1.2 Problema
Atualmente a equipe elabora orçamentos de forma manual, somando itens individualmente com base em estimativas. Isso resulta em:
- Orçamentos imprecisos, geralmente subestimados
- Perda de margem durante a execução do projeto
- Tempo excessivo para montar cada proposta
- Falta de padronização entre projetos

### 1.3 Solução
O Sistema de Orçamentos NOHA é uma ferramenta interna que permite à equipe configurar projetos de forma visual, selecionar componentes e obter um valor estimado em tempo real, baseado em valores de referência e no histórico de projetos já executados.

O grande diferencial competitivo do sistema é a **Camada de Inteligência Histórica**: à medida que novos projetos são importados, o sistema aprende com o histórico real de execução e passa a oferecer previsões, alertas de risco e comparações automáticas — transformando o orçamento em uma ferramenta estratégica de proteção de margem.

---

## 2. Funcionalidades

### 2.1 Configurador de Projeto
Tela principal onde o usuário monta a configuração do projeto selecionando os cômodos e suas características.

#### 2.1.1 Cômodos Disponíveis
| Cômodo | Valor Base | Histórico Médio | Projetos |
| :--- | :--- | :--- | :--- |
| Quarto Temático | $12,000 | $12,162 | 16 |
| Quarto Adulto | $6,000 | $3,625 | 17 |
| Loft | $14,000 | $10,781 | 3 |
| Garagem / Cinema | $16,000 | $20,347 | 2 |
| Delphino | $2,000 | - | - |

#### 2.1.2 Níveis de Acabamento (Tiers)
Cada cômodo pode ser configurado em três níveis que ajustam o valor proporcionalmente:
| Tier | Fator | Descrição |
| :--- | :--- | :--- |
| **Basic** | -15% (dedução absoluta) | Acabamento funcional, itens essenciais, decoração simplificada |
| **Padrão** | Valor base (referência) | Padrão NOHA. Valores da tabela de referência atual |
| **Premium** | +15% (acréscimo absoluto) | Acabamento superior, materiais premium, decoração elaborada |

#### 2.1.3 Decoração
A decoração é calculada automaticamente como **5% do valor total dos cômodos**. Esse valor cobre itens decorativos gerais que são proporcionais ao tamanho e nível do projeto. Não é um item selecionável; aparece no resumo como linha automática.

#### 2.1.4 Lanai (Módulo Especial de Amenities)
O Lanai é tratado como um módulo especial de área externa, configurável diretamente no primeiro passo do orçador. Diferente dos cômodos comuns, ele possui itens opcionais de custo fixo:
- Telão Integrado: $12,500
- Summer Kitchen Premium: $6,000
- Tela de Privacidade: $3,000

#### 2.1.5 Overrides de Preço (Custom Price)
A automação matemática do sistema atua de forma **sugestiva**. O vendedor possui total autonomia de **sobrescrever** o "Valor Sugerido" pelo sistema em qualquer cômodo (inserindo um `Custom Price` no input direto). Esta alteração atualiza toda a cascata do sistema e o cálculo do CMV passa a atuar sobre o novo valor forçado. A qualquer instante, é possível retornar ao padrão clicando em "Aplicar Média".

---

### 2.2 Comissões e Markup
Cada comissão possui um checkbox que permite ativá-la ou desativá-la no cálculo, além do percentual editável. Isso permite simular cenários diferentes rapidamente.

| Comissão | % Padrão | Base de Cálculo | Ativável |
| :--- | :--- | :--- | :--- |
| Markup | 40% | Sobre o CMV | Sim (checkbox) |
| Comissão Ingrid | 10% | Sobre o CMV | Sim (checkbox) |
| Corretor | 10% | Sobre a Venda | Sim (checkbox) |
| Comissão Tati | 2% | Sobre a Venda | Sim (checkbox) |

#### 2.2.1 Fórmula de Cálculo
O preço final de venda é calculado da seguinte forma:
1. `CMV = Cômodos + Decoração (5%) + Lanai`
2. `Subtotal = CMV + Markup(%) + Comissão Ingrid(%)`
3. `Preço Venda = Subtotal / (1 - Corretor% - Tati%)`

*(As comissões sobre venda usam cálculo reverso para que o percentual incida sobre o valor final, não sobre o custo).*

---

### 2.3 Sistema de Combos
Combos são templates reutilizáveis de configuração. Permitem que a equipe tenha configurações pré-montadas para tipos comuns de projeto.

#### 2.3.1 Funcionalidades de Combos
- Criar combo do zero com nome, cômodos, tiers e itens de lanai
- Salvar a configuração atual como novo combo
- Carregar combo e personalizar antes de finalizar
- Editar combos existentes
- Excluir combos

#### 2.3.2 Casos de Uso
- **Combo "Temático Completo":** 4 quartos temáticos + 2 adulto + 1 loft + 1 garagem + lanai completo. Ideal para casas maiores focadas em experiência.
- **Combo "Econômico 5 Quartos":** 1 temático + 4 adulto tier basic. Para projetos com orçamento mais enxuto.
- **Combo "Premium Full":** 6 temáticos premium + 1 loft premium + 1 garagem + delphino + lanai completo.

---

### 2.4 Comparação com Histórico (Algoritmo M3)
O sistema exibe no rodapé de cada cômodo um painel de inteligência que cruza o valor base com a média real de projetos já executados.
- **Margem Segura (Verde):** Histórico abaixo do valor orçado.
- **Alerta de Risco (Vermelho/Rust):** Histórico acima do valor orçado (Risco de estouro).
- **Ação "Aplicar Média":** Botão que injeta a média histórica devidamente calculada diretamente no Input de Custom Price do Orçamento, automatizando a proteção anti-prejuízo.

---

## 3. Camada de Inteligência Histórica

> Esta é a seção que define o **diferencial competitivo real** do sistema NOHA. As três features abaixo transformam o sistema de um simples orçamentador em uma plataforma de inteligência de projetos.

### 3.1 Feature C — Radar de Desvio (Histórico por Categoria)

#### 3.1.1 Visão
Painel colapsável exibido dentro do card de cada cômodo no Configurador. Responde a pergunta: *"Historicamente, quanto esse tipo de cômodo costuma sair além do que foi orçado, e em qual categoria?"*

#### 3.1.2 Comportamento
- Exibe desvio médio entre `Price Cost` (orçado) e `Actual Cost` (real) agrupado por categoria
- Calcula um **Buffer Sugerido** (% ponderada dos desvios) para o cômodo inteiro
- Botão "Aplicar Buffer" injeta o valor ajustado diretamente no Custom Price do cômodo
- Indicadores visuais de risco: 🔴 alto (>20%) · 🟡 médio (10-20%) · 🟢 baixo (<10%)

#### 3.1.3 Dados por Categoria
As planilhas possuem 6 categorias padronizadas e consistentes entre todos os projetos:

| Categoria | Código na planilha | Descrição |
| :--- | :--- | :--- |
| Construção | `CONSTRUCAO` | Materiais, elétrica, marcenaria, acabamentos |
| Móveis | `MOVEIS` | Mobiliário geral |
| Produtos | `PRODUTOS` | Amazon, decoração, itens de consumo |
| Mão de Obra | `MAO DE OBRA` | Labor individual por serviço |
| Mão de Obra Geral | `MAO DE OBRA. G` | Labor geral / empreiteira |
| Extras | `EXTRAS` | Itens fora do escopo padrão |

#### 3.1.4 Status dos Dados
- **Dependência crítica:** Coluna `Actual Cost` preenchida nas planilhas de projetos concluídos
- **Estado atual:** Presente na estrutura de todas as planilhas (coluna J). Preenchimento parcial — apenas Debora Secco tem dados completos
- **Estratégia:** Funciona com mock realista no lançamento; dados reais inseridos progressivamente conforme equipe completa as planilhas

---

### 3.2 Feature D — DNA do Projeto (Fingerprint de Similaridade)

#### 3.2.1 Visão
Card exibido no painel lateral do Configurador assim que o usuário monta a combinação de cômodos. O sistema compara automaticamente o projeto em construção contra todos os projetos históricos da base e exibe os mais similares com seus custos reais.

#### 3.2.2 Comportamento
- Análise automática em tempo real conforme o usuário adiciona/remove cômodos
- Exibe top 3 projetos históricos mais similares com score de similaridade (%)
- Para cada projeto similar: configuração, CMV orçado vs. real, desvio total
- Destaque visual do ambiente com maior desvio histórico no projeto similar
- Ação "Usar como referência": popula o orçamento atual com valores do projeto similar

#### 3.2.3 Algoritmo de Similaridade
Score calculado por pontuação ponderada de características:

| Característica | Peso |
| :--- | :--- |
| Número total de quartos | 30% |
| Número de quartos temáticos | 25% |
| Presença de Loft | 10% |
| Presença de Garagem / Cinema | 10% |
| Presença de Lanai completo | 10% |
| Faixa de CMV total | 15% |

#### 3.2.4 Classificação de Ambientes (Regra de Negócio)
O sistema classifica automaticamente os ambientes das planilhas pelo nome:

| Regra de Nome | Classificação |
| :--- | :--- |
| "Bedroom" + tema (Minions, Frozen, Mickey, Harry Potter, Avengers, Rapunzel, etc.) | Quarto Temático |
| "Bedroom Master" / "Bedroom" + (King, Queen, Bege, Cinza, Full) | Quarto Adulto |
| "LOFT" | Loft |
| "GAME ROOM" / "GARAGEM" / "BILLIARD" / "CINEMA" | Garagem / Cinema |
| "FOYER" / "KITCHEN" / "LIVING" / "DINNING" / "LAUNDRY" | Área Social |
| "LANAI" | Lanai |
| "BATHROOM" | Banheiro |
| "EXTRAS" | Extras |

#### 3.2.5 Status dos Dados
- **Dependência:** Ambientes de projetos históricos classificados e armazenados no banco
- **Estado atual:** ✅ Viável imediatamente com os 5 projetos disponíveis. Nenhuma mudança nas planilhas necessária.

---

### 3.3 Feature E — Central de Inteligência (Dashboard Executivo)

#### 3.3.1 Visão
Tela dedicada no menu lateral do sistema, separada do Configurador. Não é para orçar — é para **entender o histórico e o comportamento real de custos** do negócio NOHA.

#### 3.3.2 Seções do Dashboard

**KPIs do Topo**
| KPI | Descrição |
| :--- | :--- |
| CMV Médio por projeto | Média do custo total dos projetos históricos |
| Taxa de acurácia | % dos projetos dentro de ±10% do orçado vs. real |
| Desvio médio | Quanto os projetos costumam sair acima do orçado |
| Custo médio — Quarto Temático | Valor médio real por unidade deste cômodo |

**CMV Orçado vs. Real por Projeto**
- Gráfico de barras comparando Price Cost vs. Actual Cost por projeto
- Evidencia visualmente quais projetos tiveram o maior desvio

**Mapa de Risco por Tipo de Ambiente**
- Indicador de "confiabilidade" (%) por tipo de cômodo
- Calculado pela variância dos custos reais em relação ao orçado
- Cor: 🔴 abaixo de 60% · 🟡 60–80% · 🟢 acima de 80%

**Desvio por Categoria**
- Ranking das categorias pelo desvio médio (Price Cost vs. Actual Cost)
- Identificação de qual categoria representa maior risco sistêmico

**Top Itens que Mais Estouram**
- Lista dos produtos/serviços com maior gap entre orçado e real
- Referência para calibrar preços base na próxima revisão da tabela

#### 3.3.3 Status dos Dados
- KPIs de CMV e comparação entre projetos: ✅ disponíveis com Price Cost atual
- Taxa de acurácia e desvio real: ⚠️ dependem do Actual Cost preenchido nas planilhas
- **Estratégia de lançamento:** KPIs com dados reais disponíveis + indicadores de Actual Cost mockados com valores realistas, marcados visualmente como "estimado"

---

## 4. Base de Dados Históricos

### 4.1 Projetos na Base
| Projeto | CMV Total (Price Cost) | Quartos | Temáticos | Ambientes |
| :--- | :--- | :--- | :--- | :--- |
| Jaqueline | $120,373 | 9 | 6 | 17 |
| Angela | $22,532 | 0 | 0 | 2 |
| Lilian | $184,886 | 9 | 4 | 22 |
| Debora Secco | $105,181 | 6 | 0 | 14 |
| MaFe | $218,450 | 15 | 6 | 21 |

### 4.2 Estrutura das Planilhas (Formato Técnico)
Cada projeto é importado via arquivo `.xlsx`. O sistema lê a aba principal de compras (ex: `V5-COMPRA`, `V3 - COMPRAS`) com a seguinte estrutura de colunas:

| Col | Campo | Tipo | Status |
| :--- | :--- | :--- | :--- |
| B | Company | Texto (fornecedor ou nome do ambiente) | ✅ Sempre preenchido |
| C | Product | Texto (nome do item) | ✅ Sempre preenchido |
| D | Category | Texto (`CONSTRUCAO`, `MOVEIS`, etc.) | ✅ Padronizado em todos |
| E | SKU | Texto / URL | Opcional |
| F | Qty | Número | Opcional |
| G | Unit Cost Price | Número | Opcional |
| H | Price Cost | **Número — custo orçado** | ✅ Sempre preenchido |
| I | Budget | Número | Opcional |
| J | Actual Cost | **Número — custo real pago** | ⚠️ Preenchimento incompleto |
| K | Comments | Texto | Opcional |
| L | Order Number | Texto | Opcional |
| M | Date of Order | **Data — data da compra** | ⚠️ Vazio em todos os projetos |
| N | Backorder until | Data | Opcional |
| O | Date on Warehouse | Data | Opcional |

> **Ação necessária da equipe:** Preencher as colunas `Actual Cost` (J) e `Date of Order` (M) em todos os projetos concluídos. Isso destrava as features C (Radar de Desvio) e a análise temporal.

### 4.3 Detecção de Ambiente no Parser
O ambiente ao qual cada item pertence é identificado pela linha de cabeçalho de seção: quando a coluna `Company` (B) contém o nome do ambiente em maiúsculas e a coluna `Category` (D) está vazia, o sistema interpreta como início de um novo ambiente.

---

## 5. Roadmap de Evolução

### 5.1 Fase Atual: MVP (v1.0)
O que já está implementado e funcional:
- Configurador de projeto com cômodos e quantidades
- Três tiers de acabamento por cômodo (Basic, Padrão, Premium)
- Override financeiro (Custom Price por cômodo)
- Decoração automática (5%)
- **Módulo Lanai Integrado (Passo 1):** Seleção de amenities externas inline
- **Wizard Otimizado (3 Passos):** Fluxo reduzido para Configuração → Políticas → Aprovação
- Comissões e markup ativáveis com percentuais editáveis
- Painel Histórico (M3) cruzando médias com valores em tempo real
- Sistema de combos (criar, editar, carregar, excluir)
- Cálculo de margens com dedução reversa em tempo real

### 5.2 Fase 2: Importação de Projetos + Feature D — DNA do Projeto
**Prioridade: Alta**

Implementação da base de importação de planilhas e do primeiro diferencial de inteligência:

1. **Tela de Importação:** Upload de `.xlsx`, leitura automática da aba de compras
2. **Parser de Ambientes:** Classificação automática por regras de nome (seção 3.2.4) com opção de ajuste manual
3. **Armazenamento:** Projetos históricos persistidos no banco com dados por ambiente e categoria
4. **Feature D — DNA do Projeto:** Card de similaridade no Configurador comparando o projeto atual com o histórico

**100% viável com os dados existentes nas planilhas.**

### 5.3 Fase 3: Feature E — Central de Inteligência
**Prioridade: Alta**

Tela separada de Dashboard Executivo com:
- KPIs de CMV médio, acurácia e desvio por projeto
- Mapa de risco por tipo de ambiente
- Desvio por categoria (mockado inicialmente, substituído com Actual Cost real)
- Top itens com maior desvio histórico
- Comparativo visual CMV Orçado vs. Real por projeto

**Lançamento com mix de dados reais (Price Cost) + mock marcado (Actual Cost estimado).**

### 5.4 Fase 4: Feature C — Radar de Desvio + Substituição dos Mocks
**Prioridade: Média (depende de dados)**

- Radar de Desvio no rodapé de cada cômodo no Configurador
- Buffer Sugerido calculado por categoria e injetável com 1 clique
- Substituição progressiva dos mocks pelos dados reais conforme equipe preenche planilhas
- Tela auxiliar "Completar Dados" para agilizar o preenchimento do Actual Cost retroativo

### 5.5 Fase 5: Exportação e Relatórios
- Exportar orçamento em PDF para apresentação ao cliente
- Histórico de versões de orçamento por projeto
- Comparativo real vs. orçado por projeto concluído
- Atualização automática dos valores base da tabela conforme histórico cresce

---

## 6. Glossário
| Termo | Definição |
| :--- | :--- |
| **CMV** | Custo da Mercadoria Vendida. Soma de todos os custos diretos do projeto (cômodos + decoração + lanai). |
| **Markup** | Percentual adicionado sobre o CMV para cobrir custos operacionais e gerar lucro. |
| **Tier** | Nível de acabamento de um cômodo: Basic (-15%), Padrão (base), Premium (+15%). |
| **Combo** | Configuração pré-definida de projeto que pode ser salva e reutilizada como template. |
| **Lanai** | Área externa da casa. Inclui telão, summer kitchen e tela de privacidade. |
| **Price Cost** | Custo previsto/orçado de um item antes da compra. |
| **Actual Cost** | Custo real pago pelo item após a compra. |
| **Delphino** | Tipo específico de ambiente/espaço nos projetos NOHA. |
| **Vacation Rental** | Imóvel destinado a aluguel de curta temporada para turistas. |
| **Fingerprint** | Perfil numérico de um projeto (nº de cômodos, temáticos, ambientes especiais) usado para calcular similaridade com projetos históricos. |
| **Buffer** | Valor percentual adicional sugerido pelo sistema para proteger a margem com base no desvio histórico da categoria. |
| **Radar de Desvio** | Painel por cômodo que mostra o desvio histórico entre Price Cost e Actual Cost por categoria. |
| **DNA do Projeto** | Feature que compara o projeto atual com projetos históricos e exibe os mais similares. |
| **Central de Inteligência** | Dashboard executivo com visão consolidada do histórico de projetos e métricas de acurácia de orçamento. |

---

## 7. Notas Importantes
- **Uso interno:** Este sistema é exclusivo para a equipe NOHA Concept.
- **Valores de referência:** Os valores base da tabela são em dólares americanos (USD). Devem ser revisados periodicamente com base em novos projetos importados.
- **Histórico:** A base atual conta com 5 projetos com dados de Price Cost completos. O Actual Cost está completo apenas em Debora Secco.
- **Mock vs. Real:** Features das Fases 3 e 4 serão lançadas com dados mockados onde o Actual Cost não estiver disponível. Indicadores visuais ("estimado") deixarão claro ao usuário o que é dado histórico real vs. projeção calculada.
- **Prioridade de enriquecimento de dados:** A equipe deve preencher `Actual Cost` (col. J) e `Date of Order` (col. M) nas planilhas de projetos concluídos para desbloquear as features de desvio e análise temporal.
