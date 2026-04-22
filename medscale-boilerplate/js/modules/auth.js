// ============================================================
//  AUTH — Login, logout, sessão, proteção de rota
// ============================================================
import db from '../services/supabase.js';

// ── Retorna o usuário logado ou null ──────────────────────
export async function getSession() {
  const { data } = await db.auth.getSession();
  return data?.session?.user ?? null;
}

// ── Login com email e senha ───────────────────────────────
export async function login(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// ── Cadastro com email e senha ────────────────────────────
export async function signup(email, password) {
  const { data, error } = await db.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

// ── Logout completo ───────────────────────────────────────
export async function logout() {
  await db.auth.signOut();
  window.location.href = '/login.html';
}

// ── Proteção de rota: redireciona se não estiver logado ───
// Chame no topo de cada página protegida
export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

// ── Proteção inversa: redireciona se já estiver logado ────
// Chame na página de login para evitar re-login desnecessário
export async function redirectIfLoggedIn(dest = '/app.html') {
  const user = await getSession();
  if (user) {
    window.location.href = dest;
  }
}
