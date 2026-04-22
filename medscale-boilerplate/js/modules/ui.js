// ============================================================
//  UI — Helpers de interface reutilizáveis
// ============================================================

// ── Toast ─────────────────────────────────────────────────
// Uso: toast('Salvo com sucesso!', 'ok')
// Tipos: 'ok' | 'err' | 'info'
export function toast(message, type = 'info') {
  const container = document.getElementById('toasts');
  if (!container) return;

  const colors = {
    ok:   { bg: 'rgba(45,212,160,.12)', border: 'rgba(45,212,160,.3)',   text: '#2dd4a0', icon: '✓' },
    err:  { bg: 'rgba(240,106,106,.12)', border: 'rgba(240,106,106,.3)', text: '#f06a6a', icon: '✕' },
    info: { bg: 'rgba(79,142,247,.12)',  border: 'rgba(79,142,247,.3)',   text: '#4f8ef7', icon: 'ℹ' },
  };
  const c = colors[type] || colors.info;

  const el = document.createElement('div');
  el.className = 'toast';
  el.style.cssText = `
    background:${c.bg}; border:1px solid ${c.border}; color:${c.text};
    padding:11px 16px; border-radius:10px; font-size:14px; font-weight:500;
    display:flex; align-items:center; gap:8px;
    box-shadow:0 4px 20px rgba(0,0,0,.4);
    animation:toastIn .2s ease;
  `;
  el.innerHTML = `<span>${c.icon}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Loading state em botão ────────────────────────────────
// Uso: setLoading(btn, true) / setLoading(btn, false, 'Salvo!')
export function setLoading(btn, loading, label) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Aguarde…';
    btn.style.opacity = '0.7';
  } else {
    btn.disabled = false;
    btn.textContent = label ?? btn.dataset.originalText ?? 'OK';
    btn.style.opacity = '';
  }
}

// ── Mostrar/esconder elemento ─────────────────────────────
export function show(id)  { const el = document.getElementById(id); if (el) el.style.display = ''; }
export function hide(id)  { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

// ── Mensagem de erro inline ───────────────────────────────
export function setError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.style.display = message ? '' : 'none';
}
