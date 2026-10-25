-- Game 3: Shared Millionaire — extended phases, game mode, persisted state

alter table public.funquiz_rooms drop constraint if exists funquiz_rooms_phase_check;
alter table public.funquiz_rooms
  add constraint funquiz_rooms_phase_check
  check (phase in (
    'lobby', 'question', 'discussion', 'reveal', 'finished', 'won', 'lost', 'walkaway'
  ));

alter table public.funquiz_rooms drop constraint if exists funquiz_rooms_game_mode_check;
alter table public.funquiz_rooms
  add constraint funquiz_rooms_game_mode_check
  check (game_mode in ('take_turns', 'play_together', 'shared_millionaire'));

alter table public.funquiz_rooms
  add column if not exists millionaire_state jsonb;

alter table public.funquiz_players drop constraint if exists funquiz_players_answer_check;
alter table public.funquiz_players
  add constraint funquiz_players_answer_check
  check (answer is null or (answer >= 0 and answer <= 3));

notify pgrst, 'reload schema';
