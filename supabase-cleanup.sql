-- Tlps-live 資料整理（選用）：使用者變多時，用來控制雲端資料量。在 Supabase「SQL Editor」手動執行，或排程。
-- 1) 清除超過 90 天的聊天紀錄、超過 30 天未更新的上線紀錄（天數依需求調整）
delete from public.tlps_live_chat     where created_at < now() - interval '90 days';
delete from public.tlps_live_sessions where last_seen  < now() - interval '30 days';

-- 2) 查看各資料表目前的列數與大小
select relname as table_name, n_live_tup as approx_rows, pg_size_pretty(pg_total_relation_size(relid)) as total_size
from pg_stat_user_tables where relname like 'tlps_live_%' order by pg_total_relation_size(relid) desc;

-- 3) 自動排程（需在 Supabase → Database → Extensions 啟用 pg_cron）：每天凌晨 3 點（UTC 19:00）自動清除
-- select cron.schedule('tlps-live-cleanup', '0 19 * * *', $$
--   delete from public.tlps_live_chat     where created_at < now() - interval '90 days';
--   delete from public.tlps_live_sessions where last_seen  < now() - interval '30 days';
-- $$);

-- 4) 依使用者要求刪除其所有資料（把信箱換成當事人的；存檔、聊天、上線紀錄一併刪除）
-- delete from public.tlps_live_saves    where email = 'someone@example.edu.tw';
-- delete from public.tlps_live_chat     where email = 'someone@example.edu.tw';
-- delete from public.tlps_live_sessions where email = 'someone@example.edu.tw';
