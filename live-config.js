/* ===== Tlps-live 雲端存檔設定（Firebase：Authentication＋Firestore，免費額度即可）=====
   不設定也能玩：進度只存在這台裝置的瀏覽器（右下角顯示「本機存檔」）。
   要跨裝置保存：
   1. Firebase 主控台（console.firebase.google.com）建立專案（或「新增 Firebase 到現有 Google Cloud 專案」）。
   2. Build → Authentication → 登入方式：啟用「Google」。
      在 Google 設定裡的「Web SDK 設定」→「允許的外部用戶端 ID」加入 auth-config.js 的 clientId。
   3. Build → Firestore Database：建立資料庫（正式版模式），到「規則」貼上 firestore.rules 並發布。
   4. 專案設定 → 一般 →「你的應用程式」新增 Web 應用程式，複製 apiKey 與 projectId 填在下面。
      （apiKey 本來就是公開用的，真正的保護靠 Firestore 規則。）
   5. Authentication → 設定 →「已授權的網域」確認有 hsiao103.github.io。 */
window.TL_LIVE_CONFIG = {
  apiKey: '',        // 例：AIzaSy...
  projectId: '',     // 例：tlps-live-12345
  collection: 'tlps_live_saves'
};
