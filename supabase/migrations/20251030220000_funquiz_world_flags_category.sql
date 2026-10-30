alter table public.funquiz_rooms drop constraint if exists funquiz_rooms_quiz_category_check;

alter table public.funquiz_rooms
  add constraint funquiz_rooms_quiz_category_check
  check (
    quiz_category in (
      'general_knowledge',
      'space',
      'history',
      'military_battles',
      'general_military',
      'capital_cities',
      'country_outlines',
      'geography',
      'movies_pop_culture',
      'world_flags'
    )
  );

notify pgrst, 'reload schema';
