-- Draw the Organ rooms. Separate from the other TeleFeet quiz tables.

create table if not exists public.draw_the_organ_rooms (
  code text primary key check (char_length(code) = 6),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists draw_the_organ_rooms_expires_at_idx
  on public.draw_the_organ_rooms (expires_at);

alter table public.draw_the_organ_rooms enable row level security;

comment on table public.draw_the_organ_rooms is
  'Ephemeral Draw the Organ match state; writes via service role API only.';
