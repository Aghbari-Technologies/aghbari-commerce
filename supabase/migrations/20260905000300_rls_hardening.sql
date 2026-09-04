drop policy if exists customer_scope_read on customers;
create policy customer_own_read on customers
  for select using (account_user_id = auth.uid());

drop policy if exists inventory_scope_read on inventory_balances;
create policy inventory_no_direct_read on inventory_balances
  for select using (false);

drop policy if exists inventory_movement_scope_read on inventory_movements;
create policy inventory_movement_no_direct_read on inventory_movements
  for select using (false);

drop policy if exists order_scope_read on orders;
create policy order_customer_read on orders
  for select using (customer_id in (select c.id from customers c where c.account_user_id = auth.uid()));

drop policy if exists order_item_scope_read on order_items;
create policy order_item_customer_read on order_items
  for select using (order_id in (select o.id from orders o where o.customer_id in (select c.id from customers c where c.account_user_id = auth.uid())));

drop policy if exists order_history_scope_read on order_status_history;
create policy order_history_customer_read on order_status_history
  for select using (order_id in (select o.id from orders o where o.customer_id in (select c.id from customers c where c.account_user_id = auth.uid())));

drop policy if exists outbox_admin_read on outbox_events;
drop policy if exists audit_admin_read on audit_events;

-- Staff/admin read policies are deliberately deferred until the permission matrix
-- is implemented. Absence of a policy is deny-by-default for direct API access.
