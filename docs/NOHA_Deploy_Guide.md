# 🚀 Guia de Deploy Oficial - Noha

Este documento descreve o procedimento correto para realizar o deploy do sistema Noha na Vercel, evitando conflitos de escopo ou permissões.

## 📦 Comando de Deploy
Sempre execute o comando a partir da pasta `frontend`.

```bash
# 1. Entre na pasta do frontend
cd frontend

# 2. Execute o deploy de produção
npx vercel deploy --prod --yes
```

### Por que esse comando?
-   `--prod`: Garante que as variáveis de ambiente de produção sejam aplicadas e o domínio principal seja atualizado.
-   `--yes`: Pula perguntas interativas, ideal para o ambiente do Noha.

## 🛠️ Solução de Problemas Comuns

### "Project Settings could not be retrieved"
Se a Vercel reclamar que não consegue encontrar as configurações, limpe o cache local e refaça o link:

```bash
cd frontend
rm -rf .vercel
npx vercel link --yes --project noha --scope henriques-projects-39fa5e8e
npx vercel deploy --prod --yes
```

### Como verificar o status?
Você pode ver o progresso do build diretamente no painel da Vercel ou usando o comando:
`npx vercel inspect <id_do_deploy> --logs`

## 🔗 Links Úteis
-   **Produção:** [Link da Produção]
-   **Painel Vercel:** [Link do Projeto na Vercel]
