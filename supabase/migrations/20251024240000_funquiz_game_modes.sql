alter table public.funquiz_rooms
  add column if not exists game_mode text not null default 'play_together'
    check (game_mode in ('take_turns', 'play_together')),
  add column if not exists session_id text not null default gen_random_uuid()::text,
  add column if not exists turn_index int not null default 0 check (turn_index >= 0),
  add column if not exists active_player_id text,
  add column if not exists host_question_order int[],
  add column if not exists guest_question_order int[],
  add column if not exists joint_score int not null default 0 check (joint_score >= 0),
  add column if not exists answer_log jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
