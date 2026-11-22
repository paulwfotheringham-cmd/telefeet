-- Fun Quiz friends accounts. Separate from care-home profiles. No email verification.

create table if not exists public.funquiz_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  last_seen timestamptz,
  current_path text not null default '',
  room_code text not null default ''
);

create table if not exists public.funquiz_sessions (
  token_hash text primary key,
  account_id uuid not null references public.funquiz_accounts (id) on delete cascade,
  expires_at timestamptz not null
);

create table if not exists public.funquiz_scores (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.funquiz_accounts (id) on delete cascade,
  game text not null,
  match_key text not null,
  score integer not null,
  won boolean not null default false,
  weekly boolean not null default false,
  played_at timestamptz not null default now(),
  unique (account_id, match_key)
);

create table if not exists public.funquiz_challenges (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.funquiz_accounts (id) on delete cascade,
  to_id uuid not null references public.funquiz_accounts (id) on delete cascade,
  game text not null,
  path text not null,
  room_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.funquiz_weekly_rooms (
  room_code text primary key,
  game text not null,
  week_start date not null
);

alter table public.funquiz_accounts enable row level security;
alter table public.funquiz_sessions enable row level security;
alter table public.funquiz_scores enable row level security;
alter table public.funquiz_challenges enable row level security;
alter table public.funquiz_weekly_rooms enable row level security;
