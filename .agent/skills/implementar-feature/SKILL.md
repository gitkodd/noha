---
trigger: always_on
---

---
name: implementar-feature
description: Use esta skill para adicionar ou editar funcionalidades seguindo o fluxo Zod-First e a arquitetura de domínios do projeto.
---

# Workflow: Implementação de Funcionalidade (SOP v2.0)

> **Atualizado em:** 19/01/2026
> **Mudanças:** Adicionados cenários de borda, checklist de verificação e exemplos de código.

Siga estritamente esta ordem de implementação para garantir a consistência do projeto.

---

## Passo 0: Verificação Prévia (OBRIGATÓRIO)

Antes de qualquer código, verifique se a entidade já existe:

```
□ Existe lib/schemas/{entidade}.ts?
□ Existe types/{entidade}.ts?
□ Existe models/{entidade}.ts?
□ Existe hooks/domain/use{Entidade}Form.ts?
□ Existe app/actions/{entidade}.ts?
```

**Se algum arquivo estiver faltando, crie-o ANTES de prosseguir.**

### Cenários de Borda

| Situação | Ação Correta |
|----------|--------------|
| Schema Zod não existe | Criar baseado no Model Mongoose existente |
| Type existe mas Schema não | Inferir Schema do Type, depois validar contra Model |
| Enums divergem entre arquivos | Sincronizar usando o Model como fonte de verdade |
| Hook não existe mas componente sim | Criar hook extraindo lógica do componente |

---

## Passo 1: Modelagem e Validação (A Base)

Antes de criar qualquer tela, defina os dados.

### 1.1 Criar Schema Zod
```typescript
// lib/schemas/{entidade}.ts
import { z } from "zod";

export const EntidadeSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    status: z.enum(["Ativo", "Rascunho", "Oculto"]).default("Ativo"),
});

export type EntidadeInput = z.infer<typeof EntidadeSchema>;
```

### 1.2 Criar/Atualizar Types
```typescript
// types/{entidade}.ts
import { EntidadeInput } from "@/lib/schemas/entidade";

export type { EntidadeInput };

export interface Entidade extends EntidadeInput {
    id: string;
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
```

### 1.3 Verificar Model Mongoose
```typescript
// models/{Entidade}.ts
// Garantir que os campos espelham o Schema Zod
const EntidadeSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    status: { 
        type: String, 
        enum: ["Ativo", "Rascunho", "Oculto"], // Deve bater com Zod!
        default: "Ativo" 
    },
}, { timestamps: true });
```

**✓ Critério de Sucesso:** Os três arquivos (Schema Zod, Type, Model) estão sincronizados?

---

## Passo 2: Lógica de Negócio (Hooks)

Não escreva lógica na UI. Crie um Custom Hook em `hooks/domain`.

### Regra: Quando criar um Hook?
- ✅ Formulário tem 3+ `useState`
- ✅ Formulário tem qualquer `useEffect`
- ✅ Lógica de validação ou transformação
- ✅ Chamadas a Server Actions

### Estrutura do Hook
```typescript
// hooks/domain/use{Entidade}Form.ts
import { useState, useCallback } from "react";
import { EntidadeSchema } from "@/lib/schemas/entidade";
import { createEntidadeAction } from "@/app/actions/entidade";

export function useEntidadeForm({ initialData, onSuccess }) {
    // 1. Estado
    const [formData, setFormData] = useState(initialData || {});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // 2. Validação local
    const validate = useCallback(() => {
        const result = EntidadeSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    }, [formData]);

    // 3. Submissão
    const handleSubmit = useCallback(async () => {
        if (!validate()) return;
        setIsLoading(true);
        const result = await createEntidadeAction(formData);
        setIsLoading(false);
        if (result.success) onSuccess?.();
    }, [formData, validate, onSuccess]);

    return { formData, setFormData, errors, isLoading, handleSubmit };
}
```

---

## Passo 3: Interface de Usuário (Componentes)

Agora construa a visualização em `components/[area]`.

### Regras
1. Use os blocos de construção de `components/ui` (Input, Card, Button)
2. Conecte o componente ao Hook criado no Passo 2
3. **NÃO** importe Models ou Services diretamente no componente
4. **Use APENAS classes de cores semânticas** (Dark Mode automático)

### Classes de Cores (CRÍTICO)

```tsx
// ✅ CORRETO - Classes semânticas
<div className="bg-surface text-foreground border-border rounded-card">
<p className="text-text-muted">Texto secundário</p>
<button className="bg-primary text-white">

// ❌ INCORRETO - Cores fixas (quebra Dark Mode)
<div className="bg-white text-black border-gray-200 rounded-lg">
```

| Classe | Uso |
|--------|-----|
| `bg-background` | Fundo da página |
| `bg-surface` | Cards, Modais |
| `text-foreground` | Texto principal |
| `text-text-muted` | Texto secundário |
| `bg-primary` | Cor da marca |
| `border-border` | Bordas |
| `rounded-card` | Bordas de containers |

### Exemplo de Componente
```tsx
// components/admin/EntidadeForm.tsx
"use client";

import { useEntidadeForm } from "@/hooks/domain/useEntidadeForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EntidadeForm({ initialData, onSuccess }) {
    const { formData, setFormData, errors, isLoading, handleSubmit } = 
        useEntidadeForm({ initialData, onSuccess });

    return (
        <form 
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="bg-surface border-border rounded-card p-6"
        >
            <Input 
                value={formData.name || ""} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name?.[0]}
                className="border-border"
            />
            <Button type="submit" disabled={isLoading} className="bg-primary">
                {isLoading ? "Salvando..." : "Salvar"}
            </Button>
        </form>
    );
}
```

---

## Passo 4: Persistência (Server Actions)

Se houver gravação de dados:

### Regras
1. SEMPRE valide com Zod antes de persistir
2. Use `safeParse` para retornar erros estruturados
3. Revalide caminhos afetados com `revalidatePath`

### Estrutura
```typescript
// app/actions/{entidade}.ts
"use server";

import { revalidatePath } from "next/cache";
import { EntidadeSchema } from "@/lib/schemas/entidade";
import { createEntidade } from "@/services/entidadeService";
import { ZodError } from "zod";

export async function createEntidadeAction(data: unknown) {
    try {
        // 1. Validação Zod
        const result = EntidadeSchema.safeParse(data);
        if (!result.success) {
            return { 
                success: false, 
                error: "Erro de validação",
                validationErrors: result.error.flatten().fieldErrors 
            };
        }
        
        // 2. Persistência
        const entidade = await createEntidade(result.data);
        
        // 3. Revalidação
        revalidatePath("/admin/entidades");
        
        return { success: true, entidade };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: "Erro ao salvar" };
    }
}
```

---

## Checklist de Finalização

Antes de entregar, verifique:

```
□ lib/schemas/{entidade}.ts criado/atualizado
□ types/{entidade}.ts sincronizado com schema
□ models/{Entidade}.ts sincronizado com schema (enums, campos)
□ hooks/domain/use{Entidade}Form.ts criado
□ components/admin/{Entidade}Form.tsx usa o hook
□ app/actions/{entidade}.ts valida com Zod antes de persistir
□ Testei manualmente criar/editar uma entidade
```

---

## Ordem de Entrega de Código

Ao entregar o código, apresente nessa ordem:
1. `lib/schemas/...`
2. `types/...`
3. `hooks/domain/...`
4. `components/...`
5. `app/actions/...`

---

## Referências Rápidas

| Entidade | Schema | Type | Model | Service | Actions | Hook | Form |
|----------|--------|------|-------|---------|---------|------|------|
| Product | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ useProductForm | ✅ |
| Post | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ usePostForm | ✅ |
| Author | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ useAuthorForm | ✅ |
| Project | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Family | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Specifier | ✅ | ⚠️ | ❌ | ❌ | ✅ | ✅ useSpecifierForm | ⚠️ |
| Media | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ useMediaManagement | ✅ |

> **Legenda:** ✅ Completo | ⚠️ Parcial | ❌ Faltando

---

## Constantes Centralizadas

Valores padrão estão em `config/defaults.ts`:

```typescript
import { STONE_TYPES, STONE_ORIGINS, STONE_FINISHES } from "@/config/defaults";
```

| Constante | Descrição | Qtd |
|-----------|-----------|-----|
| `STONE_TYPES` | Tipos de pedra | 18 |
| `STONE_ORIGINS` | Origens | 20 |
| `STONE_FINISHES` | Acabamentos | 11 |
| `STONE_APPLICATIONS` | Aplicações | 18 |
| `POROSITY_LEVELS` | Níveis de porosidade | 3 |
| `RESISTANCE_LEVELS` | Níveis de resistência | 4 |
| `PRODUCT_STATUSES` | Status de produtos | 4 |
| `PRICING_UNITS` | Unidades de preço | 5 |

---

## Arquivos Chave por Camada

### Schemas (`lib/schemas/`)
- `product.ts` - Produtos
- `post.ts` - Posts/Blog
- `author.ts` - Autores
- `project.ts` - Projetos/Portfolio
- `family.ts` - Famílias/Categorias
- `animation.ts` - Animações GSAP

### Hooks de Domínio (`hooks/domain/`)
- `useProductForm.ts` - Formulário de produto
- `useProductList.ts` - Listagem de produtos
- `usePostForm.ts` - Formulário de post
- `useAuthorForm.ts` - Formulário de autor
- `useMediaManagement.ts` - Upload de mídia
- `useSpecifierForm.ts` - Lead de especificador

### Services (`services/`)
- `productService.ts` - CRUD de produtos
- `postService.ts` - CRUD de posts
- `authorService.ts` - CRUD de autores
- `projectService.ts` - CRUD de projetos
- `familyService.ts` - CRUD de famílias