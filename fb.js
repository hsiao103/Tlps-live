/* ===== Firebase 精簡用戶端（只用 REST fetch；不需外部套件）=====
   登入：Google ID token → Firebase Auth（signInWithIdp）；存檔：Firestore 文件 tlps_live_saves/{uid} */
(function () {
  const C = window.TL_LIVE_CONFIG || {}, KEY = 'tl_fb_v1';
  const doc = uid => 'https://firestore.googleapis.com/v1/projects/' + C.projectId + '/databases/(default)/documents/' + (C.collection || 'tlps_live_saves') + '/' + uid;
  const B = window.TLCLOUD = {
    configured() { return !!(C.apiKey && C.projectId); },
    session() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } },
    clear() { try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ } },
    _put(j) { const s = { id: j.idToken || j.id_token, refresh: j.refreshToken || j.refresh_token, exp: Date.now() + (+(j.expiresIn || j.expires_in) || 3600) * 1000, uid: j.localId || j.user_id, email: j.email || (B.session() || {}).email }; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 忽略 */ } return s; },
    async exchange(googleIdToken) {
      if (!B.configured() || !googleIdToken) return null;
      const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=' + encodeURIComponent(C.apiKey), { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postBody: 'id_token=' + googleIdToken + '&providerId=google.com', requestUri: location.origin, returnIdpCredential: true, returnSecureToken: true }) });
      if (!r.ok) throw new Error('exchange ' + r.status); return B._put(await r.json());
    },
    async token() {
      const s = B.session(); if (!s) return null;
      if (s.exp - Date.now() > 60000) return s;
      const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(C.apiKey), { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(s.refresh) });
      if (!r.ok) { B.clear(); return null; } const j = await r.json(); j.email = s.email; return B._put(j);
    },
    async pull() {   // 回傳 {data, t}｜null（尚無存檔）｜undefined（沒有登入）
      const s = await B.token(); if (!s) return undefined;
      const r = await fetch(doc(s.uid), { headers: { Authorization: 'Bearer ' + s.id } });
      if (r.status === 404) return null; if (!r.ok) throw new Error('pull ' + r.status);
      const j = await r.json(), f = j.fields || {};
      let data = null; try { data = JSON.parse((f.json || {}).stringValue || 'null'); } catch (e) { /* 忽略 */ }
      return data ? { data, t: +((f.t || {}).integerValue || 0) } : null;
    },
    async push(data, email) {
      const s = await B.token(); if (!s) return false;
      const r = await fetch(doc(s.uid), { method: 'PATCH', headers: { Authorization: 'Bearer ' + s.id, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { json: { stringValue: JSON.stringify(data) }, t: { integerValue: String(data.t || Date.now()) }, email: { stringValue: email || s.email || '' } } }) });
      if (!r.ok) throw new Error('push ' + r.status); return true;
    }
  };
})();
