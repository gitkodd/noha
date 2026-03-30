# Algoritmo Base de Custos e Precificação

O coração matemático do **NOHA** reside no painel de configurações (Admin) e no `SummaryPanel.tsx`. O fluxo financeiro da venda possui três etapas de soma e dedução.

## 1. Composição do CMV (Custo de Mercadoria Vendida)

Cada ambiente (Ex: "Quarto Adulto", "Lanai Premium", etc.) possui:
- **Módulo Base ($):** Exemplo $8,000.
- **Taxa de Decoração (%):** Exemplo 5%. (Valor agregado sobre a base do cômodo próprio).

O $ CMV total é a soma de todos os Ambientes (Módulo + Taxa Decoração de cada um) + Módulo de área externa (Lanai).

## 2. Precificação (Margens Somadas)

Uma vez alcançado o valor do CMV, são engatilhadas as políticas comerciais de `Markup` para engordar o preço antes de exibir o *Sell Price* final ao cliente.

- **Markup Corporativo:** Exemplo 40% (calculado sobre o CMV). Lucro principal da casa.
- **Indicação Projeto:** Exemplo 5% (calculado sobre o CMV ou sobre a soma total, dependendo da configuração comercial). Reservada para stakeholders parceiros e leads.

## 3. Repasses e Deduções (Take-Outs)

Do valor cobrado ao cliente Final (*Sell Price*), o painel tira fatias do bolo em formato de deduções para remunerar os prestadores e *stakeholders* do projeto. Elas **não** aumentam o preço para o cliente, elas apenas tiram o lucro do CMV/Markup.

- **Fee de Projeto:** Autoria de Arquitetura e Modelagem de Interiores.
- **Fee Operacional:** Stakeholder Administrativo e gerenciador do pipeline.
- **Corretagem Base:** Divisão imobiliária ou fechamento da venda de terreno.

## Painel de Configurações (Mock de Machine Learning)

O sistema conta com um botão administrativo (engrenagem) para calibrar os juros, base em dinheiro das tabelas e as porcentagens globais de comissionamento. Esse painel atua definindo o "limite" de cada verba, que pode ser simplesmente ligada ou desligada (ON/OFF) na etapa 3 do orçamento pelo operador que montar a proposta.
