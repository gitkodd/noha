# Guia: Como Rodar o NOHA Localmente

Este guia rápido ajuda você a iniciar o projeto no seu computador sem erros de diretório ou conexão.

## 🚀 Passo-a-Passo: Abrindo o Projeto

O código do NOHA está organizado em uma pasta principal e uma subpasta chamada `frontend`.

### 1. Entre na pasta correta:
Sempre abra o seu terminal e certifique-se de que está na pasta `frontend`:
```bash
cd frontend
```

### 2. Inicie o servidor:
Comando para abrir o site no navegador (geralmente em `http://localhost:5173` ou `3000`):
```bash
npm run dev
```

---

## 🛠️ Configuração de Ambiente (.env.local)

O seu arquivo `.env.local` fica dentro da pasta `frontend`. Ele deve conter os prefixos `VITE_` para funcionar.

### Exemplo de arquivo correto:
```env
VITE_SUPABASE_URL=seu_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

---

## 🏗️ Estrutura de Pastas

- **`/docs`**: Documentação detalhada do sistema (onde estamos agora!).
- **`/frontend/src/components`**: Peças visuais do site.
- **`/frontend/src/store`**: Onde o "cérebro" (Zustand) gerencia os dados.
- **`/frontend/src/lib`**: Clientes e conexões externas (Supabase).

---

## 💾 Comandos Úteis

- **`npm install`**: Instala novas bibliotecas se você baixar o código pela primeira vez.
- **`npm run build`**: Gera a versão final do site que vai para a Vercel.
- **`git push origin main`**: Envia suas alterações para o GitHub e lança o novo deploy automático.
bau
