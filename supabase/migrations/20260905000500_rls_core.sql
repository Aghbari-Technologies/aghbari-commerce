-- Supabase RLS boundary. This migration requires a Supabase Auth runtime.
-- Security-definer helpers live in a non-exposed schema and use an empty search_path.

create schema if not exists private;

create or replace function private.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from public.users u
  where u.external_auth_id = (select auth.uid())
    and u.active
  limit 1
$$;

create or replace function private.current_app_org_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.organization_id
  from public.users u
  where u.id = (select private.current_app_user_id())
$$;

create or replace function private.current_app_role(role_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id and r.organization_id = ur.organization_id
    where ur.user_id = (select private.current_app_user_id())
      and ur.organization_id = (select private.current_app_org_id())
      and r.code = role_code
  )
$$;

create or replace function private.can_access_branch(target_branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.current_app_role('system_admin'))
      or exists (
        select 1 from public.user_roles ur
        where ur.user_id = (select private.current_app_user_id())
          and ur.organization_id = (select private.current_app_org_id())
          and (ur.branch_id = target_branch_id or ur.branch_id is null)
      )
$$;

create or replace function private.can_access_warehouse(target_warehouse_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.current_app_role('system_admin'))
      or exists (
        select 1 from public.user_roles ur
        where ur.user_id = (select private.current_app_user_id())
          and ur.organization_id = (select private.current_app_org_id())
          and (ur.warehouse_id = target_warehouse_id or ur.warehouse_id is null)
      )
$$;

revoke execute on function private.current_app_user_id() from public, anon;
revoke execute on function private.current_app_org_id() from public, anon;
revoke execute on function private.current_app_role(text) from public, anon;
revoke execute on function private.can_access_branch(uuid) from public, anon;
revoke execute on function private.can_access_warehouse(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.current_app_user_id() to authenticated;
grant execute on function private.current_app_org_id() to authenticated;
grant execute on function private.current_app_role(text) to authenticated;
grant execute on function private.can_access_branch(uuid) to authenticated;
grant execute on function private.can_access_warehouse(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.customers enable row level security;
alter table public.categories enable row level security;
alter table public.units enable row level security;
alter table public.products enable row level security;
alter table public.product_identifiers enable row level security;
alter table public.price_lists enable row level security;
alter table public.product_prices enable row level security;
alter table public.inventory_balances enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.outbox_events enable row level security;
alter table public.audit_events enable row level security;

-- Explicit policies: no policy means no access. Every policy applies to authenticated
-- callers and derives organization/scope from trusted Auth → application-user mapping.
create policy users_self_or_admin on public.users
  for select to authenticated using (
    id = (select private.current_app_user_id())
    or (organization_id = (select private.current_app_org_id()) and (select private.current_app_role('system_admin')))
  );

create policy customers_self_or_staff on public.customers
  for select to authenticated using (
    organization_id = (select private.current_app_org_id())
    and (user_id = (select private.current_app_user_id()) or (select private.current_app_role('system_admin'))
      or (select private.current_app_role('sales_manager')) or (select private.current_app_role('sales_employee'))
      or (select private.current_app_role('moderator')) or (select private.current_app_role('accountant')))
  );
create policy customers_staff_mutate on public.customers
  for all to authenticated using (
    organization_id = (select private.current_app_org_id())
    and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager')) or (select private.current_app_role('moderator')))
  ) with check (organization_id = (select private.current_app_org_id()));

create policy categories_org_read on public.categories
  for select to authenticated using (organization_id = (select private.current_app_org_id()));
create policy units_org_read on public.units
  for select to authenticated using (organization_id = (select private.current_app_org_id()));
create policy products_org_read on public.products
  for select to authenticated using (organization_id = (select private.current_app_org_id()));
create policy identifiers_org_read on public.product_identifiers
  for select to authenticated using (organization_id = (select private.current_app_org_id()));

create policy categories_staff_mutate on public.categories
  for all to authenticated using (organization_id = (select private.current_app_org_id()) and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))))
  with check (organization_id = (select private.current_app_org_id()));
create policy products_staff_mutate on public.products
  for all to authenticated using (organization_id = (select private.current_app_org_id()) and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))))
  with check (organization_id = (select private.current_app_org_id()));
create policy identifiers_staff_mutate on public.product_identifiers
  for all to authenticated using (organization_id = (select private.current_app_org_id()) and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))))
  with check (organization_id = (select private.current_app_org_id()));

create policy price_lists_org_read on public.price_lists
  for select to authenticated using (organization_id = (select private.current_app_org_id()));
create policy product_prices_authorized_read on public.product_prices
  for select to authenticated using (
    organization_id = (select private.current_app_org_id())
    and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))
      or (select private.current_app_role('sales_employee'))
      or exists (
        select 1 from public.customers c
        join public.price_lists pl on pl.id = product_prices.price_list_id and pl.organization_id = product_prices.organization_id
        where c.user_id = (select private.current_app_user_id())
          and c.organization_id = product_prices.organization_id
          and c.tier_id = pl.tier_id
          and c.status = 'APPROVED'
      ))
  );
create policy price_lists_staff_mutate on public.price_lists
  for all to authenticated using (organization_id = (select private.current_app_org_id()) and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))))
  with check (organization_id = (select private.current_app_org_id()));
create policy product_prices_staff_mutate on public.product_prices
  for all to authenticated using (organization_id = (select private.current_app_org_id()) and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))))
  with check (organization_id = (select private.current_app_org_id()));

create policy inventory_scoped_read on public.inventory_balances
  for select to authenticated using (organization_id = (select private.current_app_org_id()) and (select private.can_access_warehouse(warehouse_id)));
create policy inventory_scoped_mutate on public.inventory_balances
  for all to authenticated using (
    organization_id = (select private.current_app_org_id())
    and ((select private.current_app_role('system_admin')) or (select private.current_app_role('warehouse_manager')) or (select private.current_app_role('warehouse_keeper')))
    and (select private.can_access_warehouse(warehouse_id))
  ) with check (organization_id = (select private.current_app_org_id()) and (select private.can_access_warehouse(warehouse_id)));

create policy inventory_movements_scoped_read on public.inventory_movements
  for select to authenticated using (organization_id = (select private.current_app_org_id()) and (select private.can_access_warehouse(warehouse_id)));
create policy inventory_movements_scoped_insert on public.inventory_movements
  for insert to authenticated with check (
    organization_id = (select private.current_app_org_id())
    and ((select private.current_app_role('system_admin')) or (select private.current_app_role('warehouse_manager')) or (select private.current_app_role('warehouse_keeper')))
    and (select private.can_access_warehouse(warehouse_id))
  );

create policy carts_customer_scope on public.carts
  for all to authenticated using (
    organization_id = (select private.current_app_org_id())
    and customer_id = (select c.id from public.customers c where c.user_id = (select private.current_app_user_id()) limit 1)
  ) with check (
    organization_id = (select private.current_app_org_id())
    and customer_id = (select c.id from public.customers c where c.user_id = (select private.current_app_user_id()) limit 1)
  );
create policy cart_items_customer_scope on public.cart_items
  for all to authenticated using (exists (select 1 from public.carts c where c.id = cart_items.cart_id))
  with check (exists (select 1 from public.carts c where c.id = cart_items.cart_id));

create policy orders_customer_or_staff_read on public.orders
  for select to authenticated using (
    organization_id = (select private.current_app_org_id())
    and (customer_id = (select c.id from public.customers c where c.user_id = (select private.current_app_user_id()) limit 1)
      or (select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager'))
      or (select private.current_app_role('sales_employee')) or (select private.current_app_role('warehouse_manager'))
      or (select private.current_app_role('warehouse_keeper')) or (select private.current_app_role('moderator'))
      or (select private.current_app_role('accountant')))
  );
create policy orders_staff_mutate on public.orders
  for all to authenticated using (
    organization_id = (select private.current_app_org_id())
    and ((select private.current_app_role('system_admin')) or (select private.current_app_role('sales_manager')) or (select private.current_app_role('sales_employee')) or (select private.current_app_role('moderator')))
    and (select private.can_access_branch(branch_id))
  ) with check (organization_id = (select private.current_app_org_id()) and (select private.can_access_branch(branch_id)));

create policy order_items_authorized_read on public.order_items
  for select to authenticated using (exists (select 1 from public.orders o where o.id = order_items.order_id));
create policy order_status_history_authorized_read on public.order_status_history
  for select to authenticated using (organization_id = (select private.current_app_org_id()) and exists (select 1 from public.orders o where o.id = order_status_history.order_id));

-- Side-effect records are server/worker owned; clients have no direct mutation policy.
create policy outbox_admin_read on public.outbox_events
  for select to authenticated using (organization_id = (select private.current_app_org_id()) and (select private.current_app_role('system_admin')));
create policy audit_privileged_read on public.audit_events
  for select to authenticated using (organization_id = (select private.current_app_org_id()) and ((select private.current_app_role('system_admin')) or (select private.current_app_role('accountant'))));

-- Supabase API grants are opt-in for the exposed public schema.
revoke all on table public.users, public.user_roles, public.customers, public.categories, public.units,
  public.products, public.product_identifiers, public.price_lists, public.product_prices,
  public.inventory_balances, public.inventory_movements, public.carts, public.cart_items,
  public.orders, public.order_items, public.order_status_history, public.outbox_events, public.audit_events
  from anon;

grant select on public.categories, public.units, public.products, public.product_identifiers, public.price_lists, public.product_prices to authenticated;
grant select, insert, update on public.carts, public.cart_items to authenticated;
grant select on public.orders, public.order_items, public.order_status_history to authenticated;
grant select on public.inventory_balances, public.inventory_movements to authenticated;
grant select, insert, update on public.customers to authenticated;
grant select on public.users to authenticated;
