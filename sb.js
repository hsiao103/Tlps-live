/* ===== Supabase 精簡用戶端（只用 fetch；不需外部套件）===== */
(function () {
  const C = window.TL_LIVE_CONFIG || {}, KEY = 'tl_sb_v1';
  const base = () => String(C.supabaseUrl || '').replace(/\/+$/, '');
  const B = window.TLCLOUD = {
    configured() { return !!(C.supabaseUrl && C.supabaseAnonKey) && /^https:\/\//.test(C.supabaseUrl); },
    session() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } },
    clear() { try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ } },
    _put(j) { const s = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user && j.user.id, email: j.user && j.user.email }; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 忽略 */ } return s; },
    async exchange(idToken) {   // Google ID token → Supabase 登入
      if (!B.configured() || !idToken) return null;
      const r = await fetch(base() + '/auth/v1/token?grant_type=id_token', { method: 'POST', headers: { apikey: C.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'google', id_token: idToken }) });
      if (!r.ok) { let t = ''; try { t = (await r.text()).slice(0, 200); } catch (e) { /* 忽略 */ } try { localStorage.setItem('tl_sb_err', r.status + ' ' + t); } catch (e) { /* 忽略 */ } throw new Error('exchange ' + r.status); }
      try { localStorage.removeItem('tl_sb_err'); } catch (e) { /* 忽略 */ } return B._put(await r.json());
    },
    async token() {   // 取得可用的 access token（必要時用 refresh token 更新）
      let s = B.session(); if (!s) return null;
      if (s.exp - Date.now() > 60000) return s;
      const r = await fetch(base() + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: C.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh }) });
      if (!r.ok) { B.clear(); return null; } return B._put(await r.json());
    },
    async pull() {
      const s = await B.token(); if (!s) return undefined;
      const r = await fetch(base() + '/rest/v1/' + C.table + '?select=data,updated_at&user_id=eq.' + s.uid, { headers: { apikey: C.supabaseAnonKey, Authorization: 'Bearer ' + s.access } });
      if (!r.ok) throw new Error('pull ' + r.status); const a = await r.json(); return a[0] || null;
    },
    async push(data, email) {
      const s = await B.token(); if (!s) return false;
      const r = await fetch(base() + '/rest/v1/' + C.table + '?on_conflict=user_id', { method: 'POST', headers: { apikey: C.supabaseAnonKey, Authorization: 'Bearer ' + s.access, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: s.uid, email: email || s.email, data: data, updated_at: new Date().toISOString() }) });
      if (!r.ok) throw new Error('push ' + r.status); return true;
    }
  };
})();
