-- R7/Reliability foundation: media, import/export staging and generic idempotency evidence.
create table app.product_media (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id) on delete cascade,
  product_id uuid not null references app.products(id) on delete cascade,
  storage_path text not null,
  mime_type text not null check (mime_type in ('image/webp','image/jpeg','image/png')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  byte_size integer not null check (byte_size > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (organization_id, storage_path)
);
create index product_media_product_idx on app.product_media (organization_id, product_id, sort_order);

create table app.import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id) on delete cascade,
  import_type text not null check (import_type in ('products','prices','inventory','customers','purchases')),
  source_filename text not null,
  source_fingerprint text not null,
  status text not null default 'quarantined' check (status in ('quarantined','validating','preview_ready','committing','completed','failed')),
  row_count integer not null default 0 check (row_count >= 0),
  valid_row_count integer not null default 0 check (valid_row_count >= 0),
  invalid_row_count integer not null default 0 check (invalid_row_count >= 0),
  error_summary jsonb not null default '{}'::jsonb,
  created_by uuid not null references app.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, import_type, source_fingerprint)
);
create index import_jobs_scope_status_idx on app.import_jobs (organization_id, status, created_at desc);

create table app.import_rows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id) on delete cascade,
  import_job_id uuid not null references app.import_jobs(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  raw_data jsonb not null,
  normalized_data jsonb,
  row_status text not null default 'pending' check (row_status in ('pending','valid','invalid','committed')),
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (import_job_id, row_number)
);
create index import_rows_job_status_idx on app.import_rows (organization_id, import_job_id, row_status, row_number);

create table app.export_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id) on delete cascade,
  export_type text not null,
  contract_version text not null default 'v1',
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  filters jsonb not null default '{}'::jsonb,
  artifact_path text,
  row_count integer not null default 0 check (row_count >= 0),
  created_by uuid not null references app.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index export_jobs_scope_status_idx on app.export_jobs (organization_id, status, created_at desc);

create table app.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app.organizations(id) on delete cascade,
  actor_id uuid not null references app.users(id) on delete restrict,
  operation_type text not null,
  operation_id uuid not null,
  payload_hash text not null,
  state text not null default 'started' check (state in ('started','completed','failed')),
  response jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, operation_type, operation_id)
);
create index idempotency_actor_time_idx on app.idempotency_keys (organization_id, actor_id, created_at desc);

alter table app.product_media enable row level security;
alter table app.import_jobs enable row level security;
alter table app.import_rows enable row level security;
alter table app.export_jobs enable row level security;
alter table app.idempotency_keys enable row level security;
create policy product_media_select on app.product_media for select to public using (organization_id=app.current_organization_id() and app.is_org_member(organization_id));
create policy import_job_select on app.import_jobs for select to public using (organization_id=app.current_organization_id() and app.is_org_member(organization_id));
create policy import_rows_select on app.import_rows for select to public using (organization_id=app.current_organization_id() and app.is_org_member(organization_id));
create policy export_job_select on app.export_jobs for select to public using (organization_id=app.current_organization_id() and app.is_org_member(organization_id));
create policy idempotency_self_select on app.idempotency_keys for select to public using (organization_id=app.current_organization_id() and actor_id=app.current_actor_id());

do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant select on app.product_media,app.import_jobs,app.import_rows,app.export_jobs,app.idempotency_keys to authenticated'; end if; end $$;
