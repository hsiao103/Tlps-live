-- Tlps-live 題庫（雲端）與全校週排行：在 Supabase「SQL Editor」執行一次即可（可重複執行）
-- 前置：已執行過 supabase-mp.sql（需要 tl_is_admin()）。
-- 1) tlps_live_quiz：老師在管理後台（admin.html）編修題目；玩家進遊戲時載入（雲端有題就用雲端，沒有就用內建題庫）。
-- 2) tlps_live_weekly：全校週排行（只存暱稱與分數，不存信箱）。
create table if not exists public.tlps_live_quiz (
  id         text primary key check (char_length(id) between 1 and 40),
  bank       text not null check (bank in ('greet','bike','ped','gen')),
  cat        text not null default '' check (char_length(cat) <= 20),
  kind       text not null check (kind in ('tf','mc')),
  q          text not null check (char_length(q) between 1 and 200),
  a          text not null check (char_length(a) between 1 and 100),
  w          text[] not null default '{}',
  ex         text not null default '' check (char_length(ex) <= 300),
  active     boolean not null default true,
  updated_by text,
  updated_at timestamptz not null default now()
);
create index if not exists tlps_live_quiz_bank on public.tlps_live_quiz (bank);
alter table public.tlps_live_quiz enable row level security;
drop policy if exists "quiz read all"    on public.tlps_live_quiz;
drop policy if exists "quiz admin write" on public.tlps_live_quiz;
create policy "quiz read all"    on public.tlps_live_quiz for select to authenticated using (true);
create policy "quiz admin write" on public.tlps_live_quiz for all    to authenticated using (public.tl_is_admin()) with check (public.tl_is_admin());

create table if not exists public.tlps_live_weekly (
  week       text not null check (char_length(week) = 10),
  user_id    uuid not null,
  nick       text not null check (char_length(nick) between 1 and 12),
  tf         smallint not null default 0 check (tf between 0 and 12),
  gq         smallint not null default 0 check (gq between 0 and 40),
  total      smallint not null default 0 check (total between 0 and 52),
  updated_at timestamptz not null default now(),
  primary key (week, user_id)
);
create index if not exists tlps_live_weekly_rank on public.tlps_live_weekly (week, total desc, updated_at);
alter table public.tlps_live_weekly enable row level security;
drop policy if exists "wk read all"   on public.tlps_live_weekly;
drop policy if exists "wk own insert" on public.tlps_live_weekly;
drop policy if exists "wk own update" on public.tlps_live_weekly;
drop policy if exists "wk admin del"  on public.tlps_live_weekly;
create policy "wk read all"   on public.tlps_live_weekly for select to authenticated using (true);
create policy "wk own insert" on public.tlps_live_weekly for insert to authenticated with check (user_id = auth.uid());
create policy "wk own update" on public.tlps_live_weekly for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wk admin del"  on public.tlps_live_weekly for delete to authenticated using (public.tl_is_admin());
