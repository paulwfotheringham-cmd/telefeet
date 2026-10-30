alter table public.funquiz_rooms
  add column if not exists played_bank_ids_by_topic jsonb not null default '{}'::jsonb;

comment on column public.funquiz_rooms.played_bank_ids_by_topic is
  'Per-topic bank question IDs already used in this room (prevents repeats on new games).';

notify pgrst, 'reload schema';
