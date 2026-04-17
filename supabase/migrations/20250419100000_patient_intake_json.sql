-- Structured guided intake (chat-captured fields) as JSON on patients

alter table public.patients
  add column if not exists intake_json jsonb;

comment on column public.patients.intake_json is
  'Guided intake answers: demographics, clinical, podiatric (see app types).';
