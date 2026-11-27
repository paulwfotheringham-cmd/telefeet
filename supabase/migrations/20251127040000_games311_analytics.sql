-- Games311 anonymous engagement analytics + feedback (service-role API only)

create table if not exists public.games311_visitors (
  visitor_id uuid primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  visit_count int not null default 1 check (visit_count >= 1),
  total_active_ms bigint not null default 0 check (total_active_ms >= 0),
  feedback_status text not null default 'pending'
    check (feedback_status in ('pending', 'eligible', 'shown', 'submitted', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games311_visitors_last_seen_at_idx
  on public.games311_visitors (last_seen_at desc);

create table if not exists public.games311_sessions (
  session_id uuid primary key,
  visitor_id uuid not null references public.games311_visitors (visitor_id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_active_at timestamptz not null default now(),
  active_ms bigint not null default 0 check (active_ms >= 0),
  visit_number int not null check (visit_number >= 1),
  landing_path text not null default '/' check (char_length(landing_path) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games311_sessions_visitor_id_idx
  on public.games311_sessions (visitor_id, started_at desc);

create table if not exists public.games311_game_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.games311_visitors (visitor_id) on delete cascade,
  session_id uuid not null references public.games311_sessions (session_id) on delete cascade,
  event_type text not null check (event_type in ('game_launch', 'game_end', 'page_view')),
  game_id text not null check (char_length(game_id) between 1 and 80),
  active_ms int check (active_ms is null or active_ms >= 0),
  created_at timestamptz not null default now()
);

create index if not exists games311_game_events_game_id_idx
  on public.games311_game_events (game_id, created_at desc);

create index if not exists games311_game_events_session_id_idx
  on public.games311_game_events (session_id, created_at);

create table if not exists public.games311_feedback (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.games311_visitors (visitor_id) on delete cascade,
  session_id uuid references public.games311_sessions (session_id) on delete set null,
  would_pay boolean not null,
  feedback_text text check (feedback_text is null or char_length(feedback_text) <= 2000),
  game_id text check (game_id is null or char_length(game_id) between 1 and 80),
  visit_number int check (visit_number is null or visit_number >= 1),
  created_at timestamptz not null default now()
);

create index if not exists games311_feedback_created_at_idx
  on public.games311_feedback (created_at desc);

alter table public.games311_feedback
  add constraint games311_feedback_visitor_id_key unique (visitor_id);

alter table public.games311_visitors enable row level security;
alter table public.games311_sessions enable row level security;
alter table public.games311_game_events enable row level security;
alter table public.games311_feedback enable row level security;

-- No policies: clients write only through Next.js API routes using the service role.

comment on table public.games311_visitors is 'Anonymous Games311 browsers; no PII; service-role API only.';
comment on table public.games311_sessions is 'Anonymous visit sessions with active engagement ms; service-role API only.';
comment on table public.games311_game_events is 'Anonymous game launch/end events; service-role API only.';
comment on table public.games311_feedback is 'Anonymous $4.99/mo willingness feedback; one row per visitor; service-role API only.';
