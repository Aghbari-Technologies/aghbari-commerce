-- R6 durable delivery primitives. Claiming is atomic; external delivery is never performed inside the business transaction.
create table app.integration_deliveries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references app.organizations(id) on delete cascade,
  outbox_event_id uuid not null references app.outbox_events(id) on delete restrict, provider text not null, provider_operation_key text not null,
  status text not null default 'pending' check (status in ('pending','delivered','retrying','terminal_failure')), attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text, provider_reference text, next_attempt_at timestamptz, delivered_at timestamptz, created_at timestamptz not null default now(),
  unique (organization_id, provider, provider_operation_key)
);
create index integration_delivery_retry_idx on app.integration_deliveries (organization_id,status,next_attempt_at,created_at);
alter table app.integration_deliveries enable row level security;
create policy integration_delivery_select on app.integration_deliveries for select to public using (organization_id=app.current_organization_id() and app.is_org_member(organization_id));
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant select on app.integration_deliveries to authenticated'; end if; end $$;

create or replace function app.claim_outbox_batch(p_limit integer default 20)
returns setof app.outbox_events
language sql security definer set search_path=app,public as $$
  with authorized as (select app.current_organization_id() as organization_id),
  claimed as (
    select e.id from app.outbox_events e join authorized a on a.organization_id=e.organization_id
    where e.published_at is null and e.terminal_failure=false and (e.next_attempt_at is null or e.next_attempt_at<=now())
      and exists(select 1 from app.user_roles ur join app.roles r on r.id=ur.role_id where ur.user_id=app.current_actor_id() and ur.organization_id=e.organization_id and r.code in ('admin','integration_worker'))
    order by e.created_at for update skip locked limit greatest(1,least(p_limit,100))
  )
  update app.outbox_events e set attempts=e.attempts+1,next_attempt_at=now()+interval '1 minute' where e.id in (select id from claimed) returning e.*;
$$;
revoke execute on function app.claim_outbox_batch(integer) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.claim_outbox_batch(integer) to authenticated'; end if; end $$;

create or replace function app.mark_outbox_delivered(p_event_id uuid)
returns void language sql security definer set search_path=app,public as $$
  update app.outbox_events e set published_at=now(),next_attempt_at=null where e.id=p_event_id and e.organization_id=app.current_organization_id() and e.published_at is null and e.terminal_failure=false
    and exists(select 1 from app.user_roles ur join app.roles r on r.id=ur.role_id where ur.user_id=app.current_actor_id() and ur.organization_id=e.organization_id and r.code in ('admin','integration_worker'));
$$;
revoke execute on function app.mark_outbox_delivered(uuid) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.mark_outbox_delivered(uuid) to authenticated'; end if; end $$;
