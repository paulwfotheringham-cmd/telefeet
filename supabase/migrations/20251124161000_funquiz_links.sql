create table if not exists public.funquiz_links (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.funquiz_accounts (id) on delete cascade,
  kind text not null check (kind in ('podcast', 'music')),
  name text not null,
  url text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.funquiz_links enable row level security;

notify pgrst, 'reload schema';
