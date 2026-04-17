-- Residents / patients linked to a care home (nurse-facing records)

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  care_home_id uuid not null,
  full_name text not null,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists patients_care_home_id_idx on public.patients (care_home_id);
create index if not exists patients_created_at_idx on public.patients (created_at desc);

alter table public.patients enable row level security;

-- Client nurses: rows for their own care home only
drop policy if exists "patients_select_same_home" on public.patients;
create policy "patients_select_same_home"
  on public.patients for select
  to authenticated
  using (
    care_home_id in (
      select p.care_home_id
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.care_home_id is not null
    )
  );

drop policy if exists "patients_insert_same_home" on public.patients;
create policy "patients_insert_same_home"
  on public.patients for insert
  to authenticated
  with check (
    care_home_id in (
      select p.care_home_id
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.care_home_id is not null
    )
  );

drop policy if exists "patients_update_same_home" on public.patients;
create policy "patients_update_same_home"
  on public.patients for update
  to authenticated
  using (
    care_home_id in (
      select p.care_home_id
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.care_home_id is not null
    )
  )
  with check (
    care_home_id in (
      select p.care_home_id
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.care_home_id is not null
    )
  );

drop policy if exists "patients_delete_same_home" on public.patients;
create policy "patients_delete_same_home"
  on public.patients for delete
  to authenticated
  using (
    care_home_id in (
      select p.care_home_id
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.care_home_id is not null
    )
  );
