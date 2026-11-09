-- Tlps-live 雲端存檔：在 Supabase「SQL Editor」執行一次即可
create table if not exists public.tlps_live_saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tlps_live_saves enable row level security;

-- 每位使用者只能讀寫自己的存檔
create policy "own select" on public.tlps_live_saves for select using (auth.uid() = user_id);
create policy "own insert" on public.tlps_live_saves for insert with check (auth.uid() = user_id);
create policy "own update" on public.tlps_live_saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- （選用）讓指定老師帳號可以查看全班進度；把信箱換成實際老師帳號再取消註解
-- create policy "teacher read" on public.tlps_live_saves for select
--   using ((auth.jwt() ->> 'email') in ('teacher1@tmail.ilc.edu.tw'));
