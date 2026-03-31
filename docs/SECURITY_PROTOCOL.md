# Protocolo de Segurança: NOHA System Lockdown

O sistema NOHA foi trancado para garantir que apenas usuários autorizados tenham acesso aos orçamentos e à inteligência competitiva.

## 🔑 Autenticação (Login)

### 1. Sistema de Entrada
O sistema utiliza o **Supabase Auth** para gerenciamento de sessões.
- **Formulário Premium:** O componente `src/components/auth/LoginPage.tsx` gerencia o acesso.
- **Cadastro Fechado:** O botão de "Sign Up" público foi removido. Novos usuários devem ser criados manualmente ou via convite no painel administrativo.

### 2. Guardas de Rota
No `App.tsx`, o sistema verifica a sessão do usuário antes de renderizar qualquer componente. Se não houver sessão ativa, o usuário é redirecionado para a tela de login.

---

## 🔒 Proteção de Dados: Row Level Security (RLS)

O banco de dados PostgreSQL do Supabase possui RLS ativado. Isso significa que mesmo que alguém descubra a sua URL da API, não conseguirá ler os dados sem um Token de Autenticação válido.

### Regras Aplicadas:
- **`projects`**: Apenas usuários logados (`authenticated`) podem ler, inserir, atualizar ou apagar projetos.
- **`rooms`**: Sincronizado com os projetos, também exige autenticação.
- **`items`**: Sincronizado com os quartos, também exige autenticação.

---

## 👥 Gestão de Usuários (Administrador)

### Como criar um novo vendedor ou colaborador:
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **Authentication -> Users**.
3. Clique em **Invite User** ou **Add User**.
4. Informe o e-mail e defina uma senha.

### Como desativar um acesso:
Na lista de usuários do Supabase, você pode suspender ou deletar qualquer conta instantaneamente. O acesso ao portal será cortado no próximo refresh do navegador.
bau
