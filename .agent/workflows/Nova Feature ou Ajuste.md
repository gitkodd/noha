---
description: Use quando pedir para criar ou editar telas e regras.
---

QUANDO: O usuário solicitar uma nova funcionalidade, página, formulário ou alteração de regra de negócio.

AÇÃO OBRIGATÓRIA:
1. NÃO escreva código imediatamente.
2. Invoque e leia a skill localizada em `.agent/skills/implementar-feature/SKILL.md`.
3. Siga estritamente os passos definidos na Skill (1. Modelagem Zod, 2. Hook de Domínio, 3. UI, 4. Server Action).

RESTRIÇÃO:
- Se você tentar pular a etapa de validação (Zod) ou lógica (Hook), pare e reinicie o processo corretamente.
- Sempre explique qual passo da Skill você está executando.