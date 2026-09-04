alter table organizations enable row level security;
alter table branches enable row level security;
alter table warehouses enable row level security;
alter table users enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table customer_tiers enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table categories enable row level security;
alter table units enable row level security;
alter table products enable row level security;
alter table product_identifiers enable row level security;
alter table price_lists enable row level security;
alter table product_prices enable row level security;
alter table inventory_balances enable row level security;
alter table inventory_movements enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table outbox_events enable row level security;
alter table audit_events enable row level security;

create policy organization_member_read on organizations
  for select using (id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy branch_member_read on branches
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy warehouse_member_read on warehouses
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy user_self_read on users
  for select using (id = auth.uid());

create policy customer_scope_read on customers
  for select using (
    organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active')
    and (account_user_id = auth.uid() or branch_id is null or branch_id in (
      select u.branch_id from users u where u.id = auth.uid() and u.status = 'active'
    ))
  );

create policy product_scope_read on products
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy category_scope_read on categories
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy unit_scope_read on units
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy identifier_scope_read on product_identifiers
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy price_scope_read on price_lists
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy product_price_scope_read on product_prices
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy inventory_scope_read on inventory_balances
  for select using (warehouse_id in (
    select w.id from warehouses w
    join users u on u.organization_id = w.organization_id
    where u.id = auth.uid() and u.status = 'active'
      and (u.branch_id is null or u.branch_id = w.branch_id)
  ));

create policy inventory_movement_scope_read on inventory_movements
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy cart_scope_read on carts
  for select using (
    organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active')
    and customer_id in (select c.id from customers c where c.account_user_id = auth.uid())
  );

create policy cart_item_scope_read on cart_items
  for select using (cart_id in (select c.id from carts c where c.customer_id in (select cu.id from customers cu where cu.account_user_id = auth.uid())));

create policy order_scope_read on orders
  for select using (
    customer_id in (select c.id from customers c where c.account_user_id = auth.uid())
    or organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active')
  );

create policy order_item_scope_read on order_items
  for select using (order_id in (select o.id from orders o where o.customer_id in (select c.id from customers c where c.account_user_id = auth.uid()) or o.organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active')));

create policy order_history_scope_read on order_status_history
  for select using (order_id in (select o.id from orders o where o.customer_id in (select c.id from customers c where c.account_user_id = auth.uid()) or o.organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active')));

create policy supplier_scope_read on suppliers
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy outbox_admin_read on outbox_events
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

create policy audit_admin_read on audit_events
  for select using (organization_id in (select u.organization_id from users u where u.id = auth.uid() and u.status = 'active'));

-- No client INSERT/UPDATE/DELETE policies are intentionally created here.
-- Canonical mutations must go through authorized server/domain operations.
