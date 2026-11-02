/* ===== 完整版：右上選單加入帳號與登出 ===== */
(function () {
  const A = window.TLAUTH, s = A && A.session(); if (!s) return;
  const m = document.getElementById('modes'); if (!m) return;
  const b = document.createElement('button'); b.type = 'button'; b.id = 'bOut'; b.title = s.email;
  const first = String(s.name || s.email).split(/[\s@]/)[0];
  b.textContent = '登出・' + first; b.style.maxWidth = '9em'; b.style.overflow = 'hidden'; b.style.textOverflow = 'ellipsis';
  b.onclick = () => { A.signOut(); location.href = (A.cfg.visitorPage || 'index.html'); };
  const t = m.querySelector('#gearT'); m.insertBefore(b, t ? t.nextSibling : m.firstChild);   /* 登出放最上面 */
  if (((A.cfg.adminEmails || []).map(x => x.toLowerCase())).indexOf(String(s.email).toLowerCase()) >= 0) { const ad = document.createElement('button'); ad.type = 'button'; ad.id = 'bAdm'; ad.textContent = '🛠 管理後台'; ad.onclick = () => { location.href = 'admin.html'; }; b.after(ad); }   /* 管理後台入口緊接在登出下方（手機免捲到底） */
})();
