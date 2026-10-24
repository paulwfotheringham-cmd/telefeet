alter table public.funquiz_rooms
  add column if not exists quiz_difficulty text not null default 'intermediate'
    check (quiz_difficulty in ('intermediate', 'hard'));

notify pgrst, 'reload schema';
