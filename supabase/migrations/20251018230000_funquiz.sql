-- Fun Quiz multiplayer rooms (TeleFeet Supabase project — separate from clinical tables)

create table if not exists public.funquiz_rooms (
  code text primary key check (char_length(code) = 6),
  host_id text not null,
  phase text not null check (phase in ('lobby', 'question', 'reveal', 'finished')),
  question_index int not null default 0 check (question_index >= 0),
  question_order int[] not null,
  reveal_started_at bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists funquiz_rooms_expires_at_idx on public.funquiz_rooms (expires_at);

create table if not exists public.funquiz_players (
  room_code text not null references public.funquiz_rooms (code) on delete cascade,
  player_id text not null,
  name text not null check (char_length(name) between 1 and 24),
  score int not null default 0 check (score >= 0),
  answer smallint check (answer is null or answer between 0 and 2),
  primary key (room_code, player_id)
);

create index if not exists funquiz_players_room_code_idx on public.funquiz_players (room_code);

alter table public.funquiz_rooms enable row level security;
alter table public.funquiz_players enable row level security;

-- No policies: quiz clients use Next.js API routes with the service role only.

create or replace function public.funquiz_purge_expired_rooms()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.funquiz_rooms where expires_at < now();
$$;

comment on table public.funquiz_rooms is 'Ephemeral Fun Quiz match state; writes via service role API only.';
comment on table public.funquiz_players is 'Players per Fun Quiz room; answers cleared each question on server.';
