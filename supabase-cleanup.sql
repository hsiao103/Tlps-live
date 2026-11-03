-- Tlps-live 資料整理（選用）：使用者變多時，用來控制雲端資料量。
-- 在 Supabase「SQL Editor」可整份貼上執行，不會因為沒啟用 pg_cron 而出錯。
-- 要刪除特定當事人的資料，請看最下方「依當事人信箱刪除」（預設是註解，需自行取消註解並改信箱）。

-- ① 清除超過 90 天的聊天紀錄、超過 30 天未更新的上線紀錄（天數依需求調整）
delete from public.tlps_live_chat     where created_at < now() - interval '90 days';
delete from public.tlps_live_sessions where last_seen  < now() - interval '30 days';

-- ② 查看各資料表目前的列數與大小（執行後看下方 Results）
select relname as table_name, n_live_tup as approx_rows, pg_size_pretty(pg_total_relation_size(relid)) as total_size
from pg_stat_user_tables where relname like 'tlps_live_%' order by pg_total_relation_size(relid) desc;

-- ③ 每天自動清除（選用）：需先在 Supabase → Database → Extensions 啟用「pg_cron」。
--    沒啟用時，這段只會顯示提示、不會報錯；啟用後再執行一次整份檔案即可建立排程（每天台灣時間 03:00）。
do $do$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('tlps-live-cleanup', '0 19 * * *', $job$
      delete from public.tlps_live_chat     where created_at < now() - interval '90 days';
      delete from public.tlps_live_sessions where last_seen  < now() - interval '30 days';
    $job$);
    raise notice 'pg_cron 排程已建立：tlps-live-cleanup';
  else
    raise notice '尚未啟用 pg_cron，略過自動排程（可忽略；要自動清除請先到 Database → Extensions 啟用 pg_cron，再重新執行本檔）。';
  end if;
end
$do$;

-- ④ 依當事人要求刪除其所有資料（預設註解；使用時取消註解，並把信箱換成當事人的）
-- delete from public.tlps_live_saves    where email = 'someone@example.edu.tw';
-- delete from public.tlps_live_chat     where email = 'someone@example.edu.tw';
-- delete from public.tlps_live_sessions where email = 'someone@example.edu.tw';
