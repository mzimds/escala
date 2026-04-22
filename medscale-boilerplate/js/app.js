// ============================================================
//  app.js — Controlador principal do app
// ============================================================
import { requireAuth, logout } from './modules/auth.js';
import { toast }               from './modules/ui.js';

// ── Inicialização ─────────────────────────────────────────
async function init() {
  // Verifica sessão — redireciona para login se não logado
  const user = await requireAuth();
  if (!user) return;

  // Preenche info do usuário na UI
  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = user.email;

  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) avatarEl.textContent = user.email.slice(0, 2).toUpperCase();

  // Carrega dados iniciais do app
  await loadDashboard(user);
}

// ── Carrega dados do dashboard ────────────────────────────
async function loadDashboard(user) {
  // TODO: substitua por chamadas reais da sua api.js
  // Exemplo:
  // const items = await getItems();
  // renderItems(items);
  console.log('App carregado para:', user.email);
}

// ── Logout ────────────────────────────────────────────────
// Chamado pelo botão no HTML
window.handleLogout = async function () {
  try {
    await logout(); // já redireciona para /login.html
  } catch {
    toast('Erro ao sair. Tente novamente.', 'err');
  }
};

// ── Navegação mobile: bottom nav ─────────────────────────
window.mobNav = function (section) {
  // Esconde todas as seções
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.bn-btn').forEach(el => el.classList.remove('active'));

  // Mostra a seção selecionada
  const target = document.getElementById(`section-${section}`);
  const btn    = document.getElementById(`bn-${section}`);
  if (target) target.classList.add('active');
  if (btn)    btn.classList.add('active');
};

// Roda ao carregar a página
init();
