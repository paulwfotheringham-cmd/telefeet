alter table public.funquiz_rooms drop constraint if exists funquiz_rooms_game_mode_check;
alter table public.funquiz_rooms
  add constraint funquiz_rooms_game_mode_check
  check (game_mode in (
    'take_turns',
    'play_together',
    'single',
    'shared_millionaire',
    'parallel_millionaire',
    'texas_holdem',
    'catchphrase',
    'blockbusters'
  ));

alter table public.funquiz_links alter column account_id drop not null;
alter table public.funquiz_links add column if not exists saved_by text not null default '';

notify pgrst, 'reload schema';
