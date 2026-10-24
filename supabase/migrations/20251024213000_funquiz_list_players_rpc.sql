-- Consistent lobby player reads for Fun Quiz API (security definer, service role only via API)

create or replace function public.funquiz_list_players(p_room_code text)
returns setof public.funquiz_players
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.funquiz_players
  where room_code = upper(p_room_code);
$$;

comment on function public.funquiz_list_players(text) is
  'Returns all players for a Fun Quiz room; used by TeleFeet API loadRoom.';

grant execute on function public.funquiz_list_players(text) to service_role;

notify pgrst, 'reload schema';
