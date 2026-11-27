-- Blackjack multiplayer rooms (host + guest + AI fill).

create table if not exists public.blackjack_rooms (
  code text primary key check (char_length(code) = 6),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists blackjack_rooms_expires_at_idx
  on public.blackjack_rooms (expires_at);

alter table public.blackjack_rooms enable row level security;

comment on table public.blackjack_rooms is
  'Ephemeral Blackjack match state; writes via service role API only.';
