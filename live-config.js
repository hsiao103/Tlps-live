/* ===== Tlps-live 雲端存檔設定（Supabase）=====
   不設定也能玩：進度只存在這台裝置的瀏覽器（右下角顯示「本機存檔」）。
   要跨裝置保存：
   1. Supabase → Project Settings → API：複製 Project URL 與 anon public key 貼在下面。
      （anon key 本來就是公開用的，真正的保護靠資料表的 RLS 規則，見 supabase.sql。）
   2. Supabase → Authentication → Providers → Google：啟用，Client ID 填與 auth-config.js 相同的值，
      並開啟「Skip nonce checks」（本專案用 Google 一鍵登入的 ID token 換 Supabase 登入）。
   3. 到 SQL Editor 執行 supabase.sql 建立資料表與權限。 */
window.TL_LIVE_CONFIG = {
  supabaseUrl: 'https://jqzmbeqrsidnqaqvsuaj.supabase.co',        // 例：https://xxxxxxxx.supabase.co
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxem1iZXFyc2lkbnFhcXZzdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NTA4MDEsImV4cCI6MjEwOTAyNjgwMX0.geShwvDZherAuM_4totCeAxwOHfojI3Vwy0Fo_3Niqo',    // 例：eyJhbGciOi...
  table: 'tlps_live_saves'
};
