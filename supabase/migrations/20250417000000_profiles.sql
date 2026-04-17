-- TeleFeet: profiles + RLS + trigger for auth signups

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('client', 'company', 'affiliate')),
  full_name text,
  care_home_id uuid,
  affiliate_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_care_home_id_idx on public.profiles (care_home_id);
create index if not exists profiles_affiliate_id_idx on public.profiles (affiliate_id);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Optional: allow authenticated users to insert their own row (if not using trigger only)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- New user: create profile from auth metadata (role, full_name, ids)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
  ch uuid;
  af uuid;
begin
  r := coalesce(new.raw_user_meta_data->>'role', 'client');
  if r not in ('client', 'company', 'affiliate') then
    r := 'client';
  end if;
  begin
    ch := (new.raw_user_meta_data->>'care_home_id')::uuid;
  exception when others then
    ch := null;
  end;
  begin
    af := (new.raw_user_meta_data->>'affiliate_id')::uuid;
  exception when others then
    af := null;
  end;

  insert into public.profiles (id, role, full_name, care_home_id, affiliate_id)
  values (
    new.id,
    r,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    ch,
    af
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
