alter table public.funquiz_rooms
  add column if not exists players_snapshot jsonb not null default '[]'::jsonb;

comment on column public.funquiz_rooms.players_snapshot is
  'Authoritative lobby/player list for reads; avoids PostgREST stale multi-row selects after joins.';

notify pgrst, 'reload schema';
