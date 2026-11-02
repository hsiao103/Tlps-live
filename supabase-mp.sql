-- Tlps-live 多人連線＋聊天＋管理後台：在 Supabase「SQL Editor」執行一次即可（可重複執行）
-- 前置：已執行過 supabase.sql。Realtime（廣播／Presence）預設已啟用，不需要額外設定。

-- 管理者判斷：把下面的信箱換成實際管理者（可多個）。這是「真正的」權限，auth-config.js 的 adminEmails 只負責顯示。
create or replace function public.tl_is_admin() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() ->> 'email') in ('hsiao103@gmail.com'), false)
$$;

-- 聊天紀錄
create table if not exists public.tlps_live_chat (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  room       text not null default 'lobby',
  user_id    uuid not null references auth.users(id) on delete cascade,
  email      text,
  nick       text,
  msg        text not null
);
create index if not exists tlps_live_chat_time on public.tlps_live_chat (created_at desc);
alter table public.tlps_live_chat enable row level security;
drop policy if exists "chat insert own" on public.tlps_live_chat;
drop policy if exists "chat admin select" on public.tlps_live_chat;
drop policy if exists "chat admin delete" on public.tlps_live_chat;
create policy "chat insert own"   on public.tlps_live_chat for insert with check (auth.uid() = user_id and char_length(msg) <= 80);
create policy "chat admin select" on public.tlps_live_chat for select using (public.tl_is_admin());
create policy "chat admin delete" on public.tlps_live_chat for delete using (public.tl_is_admin());

-- 上線紀錄（每次連線一列；last_seen 每分鐘更新）
create table if not exists public.tlps_live_sessions (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  email      text,
  nick       text,
  room       text,
  lv         int,
  started_at timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);
create index if not exists tlps_live_sessions_seen on public.tlps_live_sessions (last_seen desc);
alter table public.tlps_live_sessions enable row level security;
drop policy if exists "sess insert own" on public.tlps_live_sessions;
drop policy if exists "sess update own" on public.tlps_live_sessions;
drop policy if exists "sess admin select" on public.tlps_live_sessions;
create policy "sess insert own"   on public.tlps_live_sessions for insert with check (auth.uid() = user_id);
create policy "sess update own"   on public.tlps_live_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sess admin select" on public.tlps_live_sessions for select using (public.tl_is_admin());

-- 禁言名單（管理者新增；使用者只能看到自己是否被禁言）
create table if not exists public.tlps_live_mutes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.tlps_live_mutes enable row level security;
drop policy if exists "mute read own or admin" on public.tlps_live_mutes;
drop policy if exists "mute admin write" on public.tlps_live_mutes;
create policy "mute read own or admin" on public.tlps_live_mutes for select using (auth.uid() = user_id or public.tl_is_admin());
create policy "mute admin write"       on public.tlps_live_mutes for all using (public.tl_is_admin()) with check (public.tl_is_admin());

-- （選用）管理者也能看全部存檔的等級：
-- drop policy if exists "save admin select" on public.tlps_live_saves;
-- create policy "save admin select" on public.tlps_live_saves for select using (public.tl_is_admin());
