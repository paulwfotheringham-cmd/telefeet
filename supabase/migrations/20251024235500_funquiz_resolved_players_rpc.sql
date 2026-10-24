create or replace function public.funquiz_resolved_players_json(p_room_code text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with snap as (
    select coalesce(r.players_snapshot, '[]'::jsonb) as s
    from public.funquiz_rooms r
    where r.code = upper(p_room_code)
  ),
  merged as (
    select distinct on (player_id)
      upper(p_room_code) as room_code,
      player_id,
      name,
      score,
      answer
    from (
      select
        (e->>'player_id') as player_id,
        (e->>'name') as name,
        coalesce((e->>'score')::int, 0) as score,
        case
          when e->>'answer' is null or e->>'answer' = 'null' then null
          else (e->>'answer')::smallint
        end as answer,
        0 as src_ord
      from snap, lateral jsonb_array_elements(snap.s) as e
      union all
      select
        p.player_id,
        p.name,
        p.score,
        p.answer,
        1 as src_ord
      from public.funquiz_players p
      where p.room_code = upper(p_room_code)
    ) u
    order by player_id, src_ord desc
  )
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
  from merged;
$$;

grant execute on function public.funquiz_resolved_players_json(text) to service_role;

notify pgrst, 'reload schema';
