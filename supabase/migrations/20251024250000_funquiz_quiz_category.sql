alter table public.funquiz_rooms
  add column if not exists quiz_category text not null default 'general_knowledge'
    check (
      quiz_category in (
        'general_knowledge',
        'space',
        'history',
        'military_battles',
        'general_military',
        'capital_cities',
        'country_outlines',
        'geography'
      )
    );

notify pgrst, 'reload schema';
