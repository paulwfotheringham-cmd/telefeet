-- Quiz length chosen after the play mode: 25 or 50 questions.
alter table public.funquiz_rooms
  add column if not exists question_count integer not null default 50;

alter table public.funquiz_rooms
  drop constraint if exists funquiz_rooms_question_count_check;

alter table public.funquiz_rooms
  add constraint funquiz_rooms_question_count_check
  check (question_count in (25, 50));
