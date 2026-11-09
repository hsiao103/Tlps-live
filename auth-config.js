/* ===== Google 登入設定（兩個頁面共用；直接在 GitHub 上編輯本檔即可，不必重新建置）=====
   1. clientId：到 Google Cloud Console →「API 和服務」→「憑證」→ 建立「OAuth 用戶端 ID」（類型：網頁應用程式），
      「已授權的 JavaScript 來源」填你的網站網址（例如 https://帳號.github.io），把產生的用戶端 ID 貼在下面。
   2. allowSuffixes / allowDomains / allowEmails：限制誰能使用完整功能。三者都留空＝任何 Google 帳號都可登入。
      allowSuffixes：網域後綴，例 ['edu.tw'] ＝ 所有 *.edu.tw 的教育單位信箱（含 tmail.ilc.edu.tw、smail.ilc.edu.tw、各校自有網域、大專院校）都可登入。
      allowDomains：精確的信箱網域（例 'tlps.ilc.edu.tw'）；allowEmails 可額外加入個別信箱（網域之外的特例，例如私人 Gmail）。
   3. sessionHours：登入後有效時數（逾時需重新登入）。
   注意：這是「前端把關」，足以阻擋一般使用者，但不是強式保護（見 README「安全性說明」）。 */
window.TL_AUTH_CONFIG = {
  clientId: '722996358883-9njfo7jq18sbmhcl4g70mulnasgltdnc.apps.googleusercontent.com',
  allowSuffixes: ['edu.tw'],   /* 所有 *.edu.tw 教育單位信箱皆可加入 */
  allowDomains: [],            /* 精確網域（已由 edu.tw 後綴涵蓋，保留備用） */
  allowEmails: ['blurwater@gmail.com', 'hsiao103@gmail.com', 'hsiao103@cges.ilc.edu.tw'],   /* 白名單：網域之外的個別信箱 */
  adminEmails: ['hsiao103@gmail.com'],   /* 管理後台（admin.html）可進入的信箱；真正的資料權限請同步修改 supabase-mp.sql 的 tl_is_admin() */
  sessionHours: 12,
  fullPage: 'play.html',        // 遊戲頁面
  visitorPage: 'index.html'     // 登入頁（未登入會被送回這裡）
};
