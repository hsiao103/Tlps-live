/* ===== 遊戲存檔：本機＋（可選）Supabase 雲端同步 ===== */
(function () {
  /* 合併規則（修正：換裝置時，空白新裝置不可蓋掉雲端進度）：
     以「累積點數 pts」較高者為底；點數相同才看存檔時間。徽章、日紀錄、花朵等集合取聯集，最佳連勝取最大。 */
  function merge(a, b) {
    const pa = +(a && a.pts) || 0, pb = +(b && b.pts) || 0;
    const baseIsA = pa !== pb ? pa > pb : (+(a && a.t) || 0) >= (+(b && b.t) || 0);
    const base = JSON.parse(JSON.stringify(baseIsA ? a : b)), other = baseIsA ? b : a; if (!other || !base) return base || other;
    const u = (x, y) => { const o = Object.assign({}, y || {}, x || {}); return o; };
    if (Array.isArray(base.badges) || Array.isArray(other.badges)) base.badges = Array.from(new Set([].concat(base.badges || [], other.badges || [])));
    ['days', 'flowers', 'vac'].forEach(k => { if (base[k] || other[k]) base[k] = u(base[k], other[k]); });
    ['islKey', 'islDoor', 'islChest'].forEach(k => { if (a && a[k] || b && b[k]) base[k] = 1; });
    if (base.sp || other.sp) { const A = base.sp || {}, B = other.sp || {}; base.sp = Object.assign({}, B, A); ['shadow', 'song', 'blue', 'portal'].forEach(k => { if (A[k] || B[k]) base.sp[k] = 1; }); base.sp.art = u(A.art, B.art); }
    ['best', 'weeks', 'streak'].forEach(k => { base[k] = Math.max(+base[k] || 0, +other[k] || 0); });
    if (base.wx || other.wx) { const w = base.wx || {}, o = other.wx || {}; ['dq', 'home', 'win'].forEach(k => { if (w[k] || o[k]) w[k] = u(w[k], o[k]); }); if (w.wish || o.wish) w.wish = { days: u((w.wish || {}).days, (o.wish || {}).days) }; base.wx = w; }
    return base;
  }
  window.TLMERGE = merge;
  const L = window.__live, A = window.TLAUTH, B = window.TLCLOUD; if (!L || !A) return;
  const s = A.session(); L.loadFor(s ? s.email : 'guest');
  const st = () => L.getState();
  if (!B || !B.configured()) { L.setCloudLabel('本機存檔（尚未啟用雲端）'); if (L.mpInit) L.mpInit(B, s); return; }
  if (L.mpInit) L.mpInit(B, s);   // 聊天按鈕一律顯示；沒登入雲端時面板會寫出原因
  let timer = 0, busy = false, dirty = false, ok = false;
  async function flush() {
    if (busy) { dirty = true; return; } busy = true; dirty = false;
    try { await B.push(st(), s && s.email); L.setCloudLabel('☁ 已同步'); } catch (e) { L.setCloudLabel('☁ 同步失敗，已存在本機'); }
    busy = false; if (dirty) flush();
  }
  async function sync(first) {
    if (first) L.setCloudLabel('☁ 連線中…');
    try {
      const row = await B.pull();
      if (row === undefined) { if (first) L.setCloudLabel('本機存檔（重新登入即可同步雲端）'); return; }
      const mine = st(), cloud = row && row.data && row.data.v === 1 ? row.data : null;
      if (!cloud) { L.setCloudLabel('☁ 已連線'); if (+mine.pts || +mine.t) flush(); ok = true; if (first && L.mpInit) L.mpInit(B, A.session()); return; }
      const m = merge(mine, cloud), pm = +mine.pts || 0, pc = +cloud.pts || 0;
      if (pc > pm || (pc === pm && (+cloud.t || 0) > (+mine.t || 0))) { L.setState(m); L.setCloudLabel('☁ 已載入雲端進度（LV 與點數與其他裝置一致）'); }
      else { L.setCloudLabel('☁ 已連線'); if (first) L.setState(m); flush(); }
      ok = true; if (first && L.mpInit) L.mpInit(B, A.session());
    } catch (e) { if (first) L.setCloudLabel('本機存檔（雲端暫時無法連線）'); }
  }
  const start = () => sync(true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ok && !busy) sync(false); });
  L.onSave(() => { if (!ok) return; clearTimeout(timer); timer = setTimeout(flush, 2500); });
  addEventListener('pagehide', () => { if (ok && dirty) flush(); });
  start();
})();
