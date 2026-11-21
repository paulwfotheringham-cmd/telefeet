-- Name That Tune rooms. Separate from Fun Quiz and Name That Movie.

create table if not exists public.name_that_tune_rooms (
  code text primary key check (char_length(code) = 6),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists name_that_tune_rooms_expires_at_idx
  on public.name_that_tune_rooms (expires_at);

alter table public.name_that_tune_rooms enable row level security;

comment on table public.name_that_tune_rooms is
  'Ephemeral Name That Tune match state; writes via service role API only.';
