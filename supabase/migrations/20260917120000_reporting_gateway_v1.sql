-- Reporting Gateway V1: one-way, tenant-bound publication request boundary.
-- This migration records governed analytical publication requests only. It does not
-- grant analytical consumers operational write capabilities and never mutates business truth.

create table if not exists public.reporting_exports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  dataset_id text not null unique,
  source_system text not null default 'aghbari-commerce',
  source_dataset_id text not null,
  source_version text not null,
  contract_version text not null default '1.0',
  schema_version text not null default '1.0',
  tenant_id uuid not null references public.organizations(id) on delete restrict,
  idempotency_key text not null,
  data_period_start date,
  data_period_end date,
  record_count integer not null default 0 check (record_count >= 0),
  accepted_record_count integer not null default 0 check (accepted_record_count >= 0),
  rejected_record_count integer not null default 0 check (rejected_record_count >= 0),
  data_quality_score numeric(5,2),
  provenance_ref text not null,
  processing_status text not null default 'RECEIVED' check (processing_status in ('RECEIVED','VALIDATING','NORMALIZING','TENANT_BOUND','QUALITY_CHECKED','READY','ACTIVE','ANALYZED','REJECTED','PROCESSING_FAILED','QUARANTINED')),
  activation_status text not null default 'PENDING' check (activation_status in ('PENDING','ACTIVE','INACTIVE','REJECTED')),
  storage_path text,
  correlation_id text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  constraint reporting_exports_tenant_match check (organization_id = tenant_id),
  constraint reporting_exports_counts_reconcile check (record_count = accepted_record_count + rejected_record_count),
  constraint reporting_exports_quality_range check (data_quality_score is null or (data_quality_score >= 0 and data_quality_score <= 100)),
  constraint reporting_exports_active_activation check (processing_status <> 'ACTIVE' or activation_status = 'ACTIVE'),
  unique (organization_id, idempotency_key)
);

create index if not exists reporting_exports_org_created_idx
  on public.reporting_exports (organization_id, created_at desc);

alter table public.reporting_exports enable row level security;

revoke all on public.reporting_exports from anon;
revoke all on public.reporting_exports from authenticated;
grant select on public.reporting_exports to authenticated;

drop policy if exists reporting_exports_select_own_org on public.reporting_exports;
create policy reporting_exports_select_own_org
on public.reporting_exports
for select
to authenticated
using (organization_id = (select p.organization_id from public.profiles p where p.id = auth.uid() limit 1));

create or replace function public.request_reporting_export(
  p_source_dataset_id text,
  p_source_version text,
  p_schema_version text,
  p_idempotency_key text,
  p_data_period_start date default null,
  p_data_period_end date default null
)
returns public.reporting_exports
language plpgsql
security definer
set search_path = ''
set row_security = on
as $function$
declare
  v_org_id uuid;
  v_existing public.reporting_exports;
  v_new_id uuid;
  v_dataset_id text;
  v_correlation_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select p.organization_id into v_org_id
  from public.profiles p
  where p.id = auth.uid();

  if v_org_id is null then
    raise exception 'Organization context required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role::text in ('owner','admin')
  ) then
    raise exception 'Reporting publication requires owner or admin role' using errcode = '42501';
  end if;

  if nullif(trim(p_source_dataset_id), '') is null or length(p_source_dataset_id) > 128 then
    raise exception 'Invalid source dataset identity' using errcode = '22023';
  end if;
  if nullif(trim(p_source_version), '') is null or length(p_source_version) > 64 then
    raise exception 'Invalid source version' using errcode = '22023';
  end if;
  if p_schema_version <> '1.0' then
    raise exception 'Unsupported reporting schema version' using errcode = '22023';
  end if;
  if nullif(trim(p_idempotency_key), '') is null or length(p_idempotency_key) > 128 then
    raise exception 'Invalid idempotency key' using errcode = '22023';
  end if;
  if p_data_period_start is not null and p_data_period_end is not null and p_data_period_start > p_data_period_end then
    raise exception 'Invalid data period' using errcode = '22023';
  end if;

  select * into v_existing
  from public.reporting_exports
  where organization_id = v_org_id and idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.source_dataset_id = p_source_dataset_id
       and v_existing.source_version = p_source_version
       and v_existing.schema_version = p_schema_version then
      return v_existing;
    end if;
    raise exception 'Reporting idempotency key payload conflict' using errcode = '40001';
  end if;

  v_new_id := gen_random_uuid();
  v_dataset_id := 'DS-' || replace(v_new_id::text, '-', '');
  v_correlation_id := 'corr-' || replace(gen_random_uuid()::text, '-', '');

  insert into public.reporting_exports (
    id, organization_id, dataset_id, source_dataset_id, source_version,
    contract_version, schema_version, tenant_id, idempotency_key,
    data_period_start, data_period_end, provenance_ref, processing_status,
    activation_status, correlation_id, created_by
  ) values (
    v_new_id, v_org_id, v_dataset_id, trim(p_source_dataset_id), trim(p_source_version),
    '1.0', p_schema_version, v_org_id, p_idempotency_key,
    p_data_period_start, p_data_period_end,
    'aghbari://commerce/reporting/' || v_dataset_id,
    'RECEIVED', 'PENDING', v_correlation_id, auth.uid()
  ) returning * into v_existing;

  return v_existing;
end;
$function$;

revoke all on function public.request_reporting_export(text,text,text,text,date,date) from public;
revoke all on function public.request_reporting_export(text,text,text,text,date,date) from anon;
grant execute on function public.request_reporting_export(text,text,text,text,date,date) to authenticated;
