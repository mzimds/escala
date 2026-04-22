// ============================================================
//  SUPABASE — Configuração e cliente
//  ⚠️  ALTERE APENAS as duas linhas abaixo com seus dados
// ============================================================

// 1. Acesse https://supabase.com → seu projeto → Settings → API
// 2. Copie "Project URL"  → cole em SUPABASE_URL
// 3. Copie "anon public"  → cole em SUPABASE_ANON_KEY

const SUPABASE_URL      = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui';

// ── Inicializa o cliente Supabase (CDN importado no HTML) ──
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default db;
