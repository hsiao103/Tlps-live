# Tlps-live｜同樂小志工・校園生活

宜蘭縣員山鄉同樂國小的 3D 校園生活遊戲。學生在校園裡當「小志工」：每日任務（種花、澆水、打掃）、週活動（資源回收）、幫校護／愛心志工／工友的忙。之後會從「時光門」開啟回到過去、前往未來的任務與闖關。

以「同樂3D校園 v286」為基底（人物、場景、導航沿用）。

## 網站內容
| 檔案 | 用途 |
|---|---|
| `index.html` | 登入頁：說明遊戲、Google 登入（限 `@tmail.ilc.edu.tw`、`@smail.ilc.edu.tw`），登入後按「進入遊戲」 |
| `play.html` | 遊戲本體（未登入會被送回 `index.html`） |
| `auth-config.js` | Google 登入設定（Client ID、允許網域） |
| `live-config.js` | 雲端存檔設定（Supabase；不填也能玩，進度只存在本機瀏覽器） |
| `auth.js` `gate.js` `acct.js` `sb.js` `save.js` | 登入、把關、登出鈕、Supabase 連線、存檔同步（不必修改） |
| `supabase.sql` | 在 Supabase 執行一次，建立存檔資料表與權限 |

## 遊玩規則（第一版）
- **視角**：預設第三人稱；右上可切第一人稱／鳥瞰。電腦 WASD 移動、Shift 跑、空白鍵跳、**F 互動**；手機左搖桿，靠近目標出現橘色互動鈕。
- **每日任務**（每天換新）
  - 🌱 種花：到菜園花圃種 1 株（6 種花，澆水 3 天開花，開花後可採收進花冊）
  - 💧 澆水：到水龍頭裝水（一次 3 桶），替 3 個花圃澆水
  - 🧹 打掃：撿起校園裡 5 件垃圾（每天 7 件，位置每天不同）
  - 💚 小志工：幫校護（急救包）、愛心志工（愛心餐籃）、工友（水龍頭漏水）其中一位完成請託，每天輪替
  - 全部完成：額外加分並累計連續天數；點數累積可升級稱號（小小志工 → 校園之星 → 同樂小英雄）
- **週活動：資源回收週**（每週一換新）：撿 10 件回收物（含 2 件不可回收的），到資源回收站分到「紙類／塑膠／金屬／玻璃／一般垃圾」，答對 10 件獲得週徽章。
- **時光門**（梅花廣場）：目前顯示「回到過去／前往未來」的預告，內容建置中。

## 上線步驟（GitHub Pages）
1. 建立新的 repository（例如 `tlps-live`），把本資料夾**全部檔案**上傳到根目錄。
2. Settings → Pages → Branch：`main` / `(root)`。網址：`https://hsiao103.github.io/tlps-live/`。
3. **Google 登入**：沿用 `auth-config.js` 內已設好的 Client ID 即可——「已授權的 JavaScript 來源」是網域層級（`https://hsiao103.github.io`），同一網域下的新 repo 不必再改。
4. （選用）**雲端存檔**：
   1. Supabase → SQL Editor：貼上並執行 `supabase.sql`。
   2. Authentication → Providers → Google：啟用；Client ID 填與 `auth-config.js` 相同；開啟「Skip nonce checks」。
   3. Project Settings → API：把 Project URL 與 anon public key 填進 `live-config.js` 後重新上傳。
   4. 玩家登入後，進度會自動同步；右下角顯示「☁ 已同步」。未設定時顯示「本機存檔」。

## 安全性與限制（請務必了解）
- 登入是**純前端把關**：能擋一般使用者，但 `play.html` 檔案本身是公開網址，懂技術者可繞過登入直接遊玩。遊戲內容不含機密，影響有限。
- 點數與進度存在使用者端，**無法防止同學自行修改**；若要用來正式評量或競賽，需改成由伺服器（Supabase Edge Function／資料庫規則）計分。
- 雲端存檔有 RLS：每個人只能讀寫自己的資料。若要讓老師看全班進度，見 `supabase.sql` 末段的選用規則（請只列特定老師帳號）。
- Google 登入無法在 claude.ai 預覽網域使用，需在自己的 GitHub Pages 網址測試。

## 之後可擴充
- 時光門：回到過去（老校舍、老照片、歷史小記者）、前往未來（智慧農場、機器人回收員）。
- 班級排行榜、老師儀表板、更多校園人員（廚工、警衛、圖書館志工）、季節活動。
- 原始碼（見「原始碼」資料夾）：`part9.js` 是遊戲層（任務、NPC、互動、存檔），其餘為 3D 校園引擎；執行 `bash build.sh` 後再執行 `python3 make-live.py`，即可重新產生網站檔。

## 致謝
3D 校園與人物基底：瓦特老師 water64.tw；人物模型 Quaternius（CC0）。
