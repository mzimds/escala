// ============================================================
//  login.js — Controlador da página de login
// ============================================================
import { login, signup, redirectIfLoggedIn } from './modules/auth.js';
import { toast, setLoading, setError }        from './modules/ui.js';

// Se já estiver logado, vai direto para o app
redirectIfLoggedIn('/app.html');

// ── Referências aos elementos do DOM ─────────────────────
const tabLogin  = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const formLogin = document.getElementById('form-login');
const formSignup= document.getElementById('form-signup');

// ── Alternar entre Login e Cadastro ──────────────────────
export function switchTab(tab) {
  const isLogin = tab === 'login';
  tabLogin.classList.toggle('active', isLogin);
  tabSignup.classList.toggle('active', !isLogin);
  formLogin.classList.toggle('active', isLogin);
  formSignup.classList.toggle('active', !isLogin);
  setError('login-error', '');
  setError('signup-error', '');
}

// ── Submit: Login ─────────────────────────────────────────
document.getElementById('btn-login')?.addEventListener('click', async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  const btn      = document.getElementById('btn-login');

  if (!email || !password) {
    setError('login-error', 'Preencha e-mail e senha.');
    return;
  }

  setLoading(btn, true);
  try {
    await login(email, password);
    window.location.href = '/app.html';
  } catch (err) {
    setError('login-error', 'E-mail ou senha incorretos.');
    setLoading(btn, false, 'Entrar');
  }
});

// ── Submit: Cadastro ──────────────────────────────────────
document.getElementById('btn-signup')?.addEventListener('click', async () => {
  const email  = document.getElementById('signup-email').value.trim();
  const pass   = document.getElementById('signup-pass').value;
  const pass2  = document.getElementById('signup-pass2').value;
  const btn    = document.getElementById('btn-signup');

  if (!email || !pass) { setError('signup-error', 'Preencha todos os campos.'); return; }
  if (pass !== pass2)  { setError('signup-error', 'As senhas não coincidem.'); return; }
  if (pass.length < 6) { setError('signup-error', 'Senha deve ter ao menos 6 caracteres.'); return; }

  setLoading(btn, true);
  try {
    await signup(email, pass);
    toast('Conta criada! Verifique seu e-mail.', 'ok');
    switchTab('login');
    setLoading(btn, false, 'Criar conta');
  } catch (err) {
    setError('signup-error', err.message || 'Erro ao criar conta.');
    setLoading(btn, false, 'Criar conta');
  }
});

// ── Enter nos campos ──────────────────────────────────────
document.getElementById('login-pass')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-login')?.click();
});
document.getElementById('signup-pass2')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-signup')?.click();
});

// Expõe switchTab para uso inline no HTML
window.switchTab = switchTab;
