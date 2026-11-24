do $$
declare
  constraint_name text;
begin
  select c.conname into constraint_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'funquiz_links'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%kind%';
  if constraint_name is not null then
    execute format('alter table public.funquiz_links drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.funquiz_links
  add constraint funquiz_links_kind_check
  check (kind in ('podcast', 'music', 'book', 'movie', 'tv'));

notify pgrst, 'reload schema';
