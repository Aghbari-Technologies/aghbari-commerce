-- Restore the canonical notifications table required by customer order commands.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  kind text not null check (kind in ('order','inventory','security','system','task')),
  title text not null,
  body text not null,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_check check (customer_id is not null or recipient_user_id is not null)
);

create index if not exists notifications_org_created_idx
  on public.notifications(organization_id, created_at desc);

create index if not exists notifications_customer_created_idx
  on public.notifications(organization_id, customer_id, created_at desc);

create index if not exists notifications_recipient_created_idx
  on public.notifications(organization_id, recipient_user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_read on public.notifications;
create policy notifications_read
on public.notifications
for select to authenticated
using (
  organization_id = (select public.current_organization_id())
  and (
    customer_id = (select public.current_customer_id())
    or recipient_user_id = (select auth.uid())
    or (select public.is_staff())
  )
);

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self
on public.notifications
for update to authenticated
using (
  organization_id = (select public.current_organization_id())
  and (
    customer_id = (select public.current_customer_id())
    or recipient_user_id = (select auth.uid())
  )
)
with check (
  organization_id = (select public.current_organization_id())
  and (
    customer_id = (select public.current_customer_id())
    or recipient_user_id = (select auth.uid())
  )
);

comment on table public.notifications is
  'Tenant-scoped operational notifications for customer/staff workflows; visibility is enforced by RLS.';
