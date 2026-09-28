create or replace function public.remove_cart_item(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_cart uuid;
begin
  if v_org is null or v_customer is null then
    raise exception using errcode='42501', message='authenticated customer context required';
  end if;
  select id into v_cart from public.carts
  where organization_id=v_org and customer_id=v_customer and status='active'
  for update;
  if v_cart is null then return; end if;
  delete from public.cart_items
  where organization_id=v_org and cart_id=v_cart and product_id=p_product_id;
  update public.carts set updated_at=now() where id=v_cart;
end;
$$;

grant execute on function public.remove_cart_item(uuid) to authenticated;
revoke execute on function public.remove_cart_item(uuid) from anon,public;
