-- Allow Easy rooms. Easy draws the familiar question set.
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'funquiz_rooms'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%quiz_difficulty%'
  loop
    execute format('alter table public.funquiz_rooms drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.funquiz_rooms
  add constraint funquiz_rooms_quiz_difficulty_check
  check (quiz_difficulty in ('easy', 'intermediate', 'hard'));

notify pgrst, 'reload schema';
