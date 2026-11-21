-- Name That Movie rooms. Separate from Fun Quiz so the two games do not share match state.

create table if not exists public.name_that_movie_rooms (
  code text primary key check (char_length(code) = 6),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists name_that_movie_rooms_expires_at_idx
  on public.name_that_movie_rooms (expires_at);

alter table public.name_that_movie_rooms enable row level security;

comment on table public.name_that_movie_rooms is
  'Ephemeral Name That Movie match state; writes via service role API only.';
