-- Hollywood faces rooms. Separate from the movie quote game.

create table if not exists public.name_that_star_rooms (
  code text primary key check (char_length(code) = 6),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists name_that_star_rooms_expires_at_idx
  on public.name_that_star_rooms (expires_at);

alter table public.name_that_star_rooms enable row level security;

comment on table public.name_that_star_rooms is
  'Ephemeral Name That Movie match state; writes via service role API only.';
