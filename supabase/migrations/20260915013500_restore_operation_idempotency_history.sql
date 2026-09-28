-- Restore the canonical operation idempotency table to migration history.
-- Production already has this table, so all DDL is replay-safe.
-- This migration must run before any RPC migration that references
-- public.operation_idempotency (notably apply_quick_order).

create table if not exists public.operation_idempotency (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  idempotency_key text not null,
  request_hash text not null,
  operation_type text not null,
  response_reference uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'processing',
  unique (organization_id, idempotency_key, operation_type)
);

create index if not exists operation_idempotency_expiry_idx
  on public.operation_idempotency(organization_id, expires_at);

alter table public.operation_idempotency enable row level security;

revoke all on public.operation_idempotency from anon;
revoke all on public.operation_idempotency from public;
grant select, insert, update, delete on public.operation_idempotency to authenticated;

drop policy if exists operation_idempotency_staff_read on public.operation_idempotency;
create policy operation_idempotency_staff_read
  on public.operation_idempotency
  for select
  to authenticated
  using (
    organization_id = (select public.current_organization_id())
    and (select public.current_role()) in ('owner','admin')
  );

comment on table public.operation_idempotency is
  'Canonical tenant-scoped idempotency state for atomic operational commands.';
