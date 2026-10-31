/* ===== 遊戲存檔：本機＋（可選）Supabase 雲端同步 ===== */
(function () {
  const L = window.__live, A = window.TLAUTH, B = window.TLSB; if (!L || !A) return;
  const s = A.session(); L.loadFor(s ? s.email : 'guest');
  const st = () => L.getState();
  if (!B || !B.configured()) { L.setCloudLabel('本機存檔（尚未啟用雲端）'); return; }
  let timer = 0, busy = false, dirty = false, ok = false;
  async function flush() {
    if (busy) { dirty = true; return; } busy = true; dirty = false;
    try { await B.push(st(), s && s.email); L.setCloudLabel('☁ 已同步'); } catch (e) { L.setCloudLabel('☁ 同步失敗，已存在本機'); }
    busy = false; if (dirty) flush();
  }
  async function start() {
    L.setCloudLabel('☁ 連線中…');
    try {
      const row = await B.pull();
      if (row === undefined) { L.setCloudLabel('本機存檔（重新登入即可同步雲端）'); return; }
      const mine = st(), t0 = +mine.t || 0, t1 = row && row.data ? (+row.data.t || Date.parse(row.updated_at) || 0) : 0;
      if (row && row.data && t1 > t0) { L.setState(row.data); L.setCloudLabel('☁ 已載入雲端進度'); } else { L.setCloudLabel('☁ 已連線'); if (t0) flush(); }
      ok = true;
    } catch (e) { L.setCloudLabel('本機存檔（雲端暫時無法連線）'); }
  }
  L.onSave(() => { if (!ok) return; clearTimeout(timer); timer = setTimeout(flush, 2500); });
  addEventListener('pagehide', () => { if (ok && dirty) flush(); });
  start();
})();
