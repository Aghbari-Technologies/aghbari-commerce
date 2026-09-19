begin;

-- Read-only staff scope for the viewer role. Keep is_staff() write-sensitive and unchanged.
create or replace function public.is_staff_reader()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select public.current_role() in ('owner','admin','sales','warehouse','viewer');
$function$;

revoke execute on function public.is_staff_reader() from public, anon;
grant execute on function public.is_staff_reader() to authenticated;

-- The viewer may read operational dashboard scope, but remains excluded from staff write policies.
alter policy customers_read on public.customers
  using (
    organization_id = current_organization_id()
    and (id = current_customer_id() or public.is_staff_reader())
  );

alter policy orders_customer_read on public.orders
  using (
    organization_id = current_organization_id()
    and (customer_id = current_customer_id() or public.is_staff_reader())
  );

alter policy inventory_read_staff on public.inventory_balances
  using (
    organization_id = current_organization_id()
    and public.is_staff_reader()
  );

commit;
