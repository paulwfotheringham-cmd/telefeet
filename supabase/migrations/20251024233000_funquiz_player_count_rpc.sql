create or replace function public.funquiz_player_count(p_room_code text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.funquiz_players
  where room_code = upper(p_room_code);
$$;

grant execute on function public.funquiz_player_count(text) to service_role;

notify pgrst, 'reload schema';
