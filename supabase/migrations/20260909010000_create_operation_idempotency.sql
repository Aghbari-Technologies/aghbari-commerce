-- Canonical idempotency ledger must exist before any later migration/function that
-- references it. This timestamp intentionally sorts before the 20260909 hardening
-- migrations that depend on the relation.
create table if not exists public.operation_idempotency (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation_type text not null,
  idempotency_key text not null,
  request_hash text not null,
  status text not null default 'processing' check (status in ('processing','completed','failed')),
  response_reference uuid,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, operation_type, idempotency_key)
);

create index if not exists operation_idempotency_expiry_idx
  on public.operation_idempotency(expires_at);
create index if not exists operation_idempotency_org_status_idx
  on public.operation_idempotency(organization_id, status, created_at desc);

alter table public.operation_idempotency enable row level security;
revoke all on table public.operation_idempotency from anon;
grant select on table public.operation_idempotency to authenticated;

-- Mutations are intentionally performed only by SECURITY DEFINER server commands.
drop policy if exists operation_idempotency_read_staff on public.operation_idempotency;
create policy operation_idempotency_read_staff
  on public.operation_idempotency
  for select to authenticated
  using (organization_id = public.current_organization_id() and public.is_staff());
