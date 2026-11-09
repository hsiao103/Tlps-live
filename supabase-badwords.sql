-- Tlps-live 聊天禁用語（雲端）：在 Supabase「SQL Editor」執行一次即可（可重複執行）
-- 前置：已執行過 supabase-mp.sql（需要 tl_is_admin()）。
-- 效果：管理後台（admin.html）新增／刪除的禁用語會存在這張表；所有登入的玩家會讀取並在聊天室遮蔽（進遊戲時載入，之後每 5 分鐘更新）。
create table if not exists public.tlps_live_badwords (
  word       text primary key check (char_length(word) between 1 and 20),
  added_by   text,
  created_at timestamptz not null default now()
);
alter table public.tlps_live_badwords enable row level security;
drop policy if exists "bad read all"    on public.tlps_live_badwords;
drop policy if exists "bad admin write" on public.tlps_live_badwords;
create policy "bad read all"    on public.tlps_live_badwords for select to authenticated using (true);
create policy "bad admin write" on public.tlps_live_badwords for all    to authenticated using (public.tl_is_admin()) with check (public.tl_is_admin());
