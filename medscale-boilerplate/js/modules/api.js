// ============================================================
//  API — Todas as chamadas ao banco de dados (Supabase)
//  Adicione aqui novas funções conforme seu sistema crescer
// ============================================================
import db from '../services/supabase.js';

// ── Exemplo: buscar dados do usuário logado ───────────────
export async function getUserProfile(userId) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// ── Exemplo: salvar ou atualizar dados ────────────────────
export async function upsertProfile(userId, fields) {
  const { data, error } = await db
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() });

  if (error) throw error;
  return data;
}

// ── Template para buscar uma coleção ─────────────────────
// Copie e adapte para suas tabelas:
//
// export async function getItems() {
//   const { data, error } = await db.from('items').select('*').order('created_at');
//   if (error) throw error;
//   return data;
// }
