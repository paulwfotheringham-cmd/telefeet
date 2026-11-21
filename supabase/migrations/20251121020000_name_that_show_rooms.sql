-- Name That Show rooms. Separate from Fun Quiz, Name That Movie, and Name That Tune.

create table if not exists public.name_that_show_rooms (
  code text primary key check (char_length(code) = 6),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists name_that_show_rooms_expires_at_idx
  on public.name_that_show_rooms (expires_at);

alter table public.name_that_show_rooms enable row level security;

comment on table public.name_that_show_rooms is
  'Ephemeral Name That Show match state; writes via service role API only.';
