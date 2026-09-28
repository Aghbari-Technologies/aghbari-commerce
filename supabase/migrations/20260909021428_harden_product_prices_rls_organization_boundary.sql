drop policy if exists product_prices_staff_read on public.product_prices;

create policy product_prices_staff_read on public.product_prices
for select to authenticated
using (
  organization_id = current_organization_id()
  and is_staff()
);
