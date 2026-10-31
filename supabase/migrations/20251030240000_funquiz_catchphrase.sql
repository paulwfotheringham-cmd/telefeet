alter table public.funquiz_rooms drop constraint if exists funquiz_rooms_game_mode_check;
alter table public.funquiz_rooms
  add constraint funquiz_rooms_game_mode_check
  check (game_mode in (
    'take_turns',
    'play_together',
    'shared_millionaire',
    'parallel_millionaire',
    'texas_holdem',
    'catchphrase'
  ));

alter table public.funquiz_rooms add column if not exists catchphrase_state jsonb;
