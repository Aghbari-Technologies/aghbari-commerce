begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_kind_nonempty check (length(trim(kind)) > 0),
  constraint notifications_title_nonempty check (length(trim(title)) > 0),
  constraint notifications_body_nonempty check (length(trim(body)) > 0)
);

create index if not exists notifications_org_created_idx
  on public.notifications (organization_id, created_at desc);

create index if not exists notifications_customer_created_idx
  on public.notifications (customer_id, created_at desc);

alter table public.notifications enable row level security;

revoke all on public.notifications from anon;
revoke all on public.notifications from authenticated;
grant select on public.notifications to authenticated;

drop policy if exists notifications_read_own_scope on public.notifications;
create policy notifications_read_own_scope
on public.notifications
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and (
    public.is_staff()
    or customer_id = public.current_customer_id()
  )
);

commit;
