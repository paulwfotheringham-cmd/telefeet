create or replace function public.funquiz_list_players_json(p_room_code text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    json_agg(
      json_build_object(
        'room_code', room_code,
        'player_id', player_id,
        'name', name,
        'score', score,
        'answer', answer
      )
      order by player_id
    ),
    '[]'::json
  )
  from public.funquiz_players
  where room_code = upper(p_room_code);
$$;

grant execute on function public.funquiz_list_players_json(text) to service_role;

notify pgrst, 'reload schema';
