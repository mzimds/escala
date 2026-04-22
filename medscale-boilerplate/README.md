# MedScale — Boilerplate

Sistema de gestão de escalas médicas.
Stack: HTML + CSS + JavaScript + Supabase + Vercel.

---

## 📁 Estrutura de pastas

```
/medscale
  /css
    tokens.css        → Design tokens e reset global
    components.css    → Botões, inputs, toasts, cards
    layout.css        → Shell do app (sidebar, topbar, bottom nav)
    login.css         → Estilos da página de login
  /js
    /modules
      auth.js         → Login, logout, proteção de rota
      api.js          → Chamadas ao banco de dados
      ui.js           → Helpers de interface (toast, loading)
    /services
      supabase.js     → Configuração do cliente Supabase
    login.js          → Controlador da página de login
    app.js            → Controlador principal do app
  index.html          → Redireciona para /login.html
  login.html          → Página de autenticação
  app.html            → Aplicação protegida
  vercel.json         → Configuração de deploy
  README.md           → Este arquivo
```

---

## ⚡ Como rodar localmente

Você precisa de um servidor HTTP local (não abre direto no navegador por causa dos módulos JS).

### Opção 1 — VS Code + Live Server (recomendado)
1. Instale a extensão **Live Server** no VS Code
2. Abra a pasta do projeto no VS Code
3. Clique em **Go Live** no canto inferior direito
4. Acesse `http://localhost:5500`

### Opção 2 — Node.js
```bash
npx serve .
```
Acesse `http://localhost:3000`

### Opção 3 — Python
```bash
python3 -m http.server 8080
```
Acesse `http://localhost:8080`

---

## 🔧 Como conectar ao Supabase

### Passo 1 — Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project** e dê um nome

### Passo 2 — Copie suas credenciais
1. No painel do projeto, vá em **Settings → API**
2. Copie:
   - **Project URL** → algo como `https://xyzxyz.supabase.co`
   - **anon public** → chave longa começando com `eyJ...`

### Passo 3 — Cole no projeto
Abra o arquivo `/js/services/supabase.js` e substitua:

```js
const SUPABASE_URL      = 'https://SEU-PROJETO.supabase.co'; // ← cole aqui
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui';               // ← cole aqui
```

### Passo 4 — Crie as tabelas no Supabase
No painel do Supabase, vá em **SQL Editor** e rode:

```sql
-- Habilita autenticação por e-mail (já está ativa por padrão)

-- Tabela de perfis de usuário (opcional, mas recomendado)
create table profiles (
  id         uuid references auth.users primary key,
  email      text,
  updated_at timestamptz default now()
);

-- Política de segurança: usuário só vê seus próprios dados
alter table profiles enable row level security;

create policy "Usuário vê apenas seus dados"
  on profiles for all
  using (auth.uid() = id);
```

---

## 🚀 Como fazer deploy na Vercel

### Opção 1 — Via GitHub (recomendado)
1. Crie um repositório no GitHub e suba o projeto:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git remote add origin https://github.com/seu-usuario/medscale.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em **Add New → Project**
4. Importe o repositório do GitHub
5. Clique em **Deploy** — pronto!

### Opção 2 — Via Vercel CLI
```bash
npm install -g vercel
vercel
```

> ⚠️ O arquivo `vercel.json` já está configurado corretamente.

---

## 🔐 Como funciona a autenticação

| Arquivo              | Responsabilidade                                  |
|----------------------|---------------------------------------------------|
| `js/modules/auth.js` | Login, logout, verificar sessão, proteger rotas   |
| `js/login.js`        | Controlador dos formulários de login/cadastro     |
| `js/app.js`          | Chama `requireAuth()` ao carregar → redireciona   |

**Fluxo:**
1. Usuário acessa `/app.html`
2. `app.js` chama `requireAuth()`
3. Se não logado → redireciona para `/login.html`
4. Após login → redireciona para `/app.html`
5. Logout → limpa sessão → volta para `/login.html`

---

## 🛠 Como adicionar novas funcionalidades

### Nova seção no app
1. Adicione em `app.html` dentro de `#content`:
   ```html
   <section id="section-nova" class="section">
     <!-- seu conteúdo -->
   </section>
   ```
2. Adicione o botão na sidebar e no bottom nav com `onclick="mobNav('nova')"`

### Nova chamada ao banco
Adicione em `/js/modules/api.js`:
```js
export async function getMinhaTabela() {
  const { data, error } = await db.from('minha_tabela').select('*');
  if (error) throw error;
  return data;
}
```
Depois importe e use em `app.js`:
```js
import { getMinhaTabela } from './modules/api.js';
const itens = await getMinhaTabela();
```

---

## 📦 Dependências (todas via CDN, sem npm)

| Pacote          | Versão | Uso                        |
|-----------------|--------|----------------------------|
| Supabase JS     | v2     | Auth + banco de dados       |
| Google Fonts    | —      | DM Sans (tipografia)        |

Nenhum build necessário. Nenhum `npm install`. Abre e funciona.
