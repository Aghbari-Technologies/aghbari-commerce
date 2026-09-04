drop policy if exists price_scope_read on price_lists;
drop policy if exists product_price_scope_read on product_prices;

create or replace function public.get_customer_catalog(
  p_search text default null,
  p_limit integer default 50,
  p_after uuid default null
)
returns table(
  product_id uuid,
  sku text,
  product_name text,
  category_name text,
  unit_code text,
  unit_price numeric,
  currency text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_customer customers%rowtype;
  v_price_list_id uuid;
begin
  if v_actor_id is null then
    raise exception using errcode = '28000', message = 'AUTHENTICATION_REQUIRED';
  end if;
  if p_limit < 1 or p_limit > 100 then
    raise exception using errcode = '22023', message = 'VALIDATION_FAILED: limit must be between 1 and 100';
  end if;

  select * into v_customer from customers where account_user_id = v_actor_id and status = 'active' limit 1;
  if not found then
    raise exception using errcode = '42501', message = 'FORBIDDEN';
  end if;

  select id into v_price_list_id
  from price_lists
  where organization_id = v_customer.organization_id
    and customer_tier_id = v_customer.tier_id
    and status = 'active'
  order by id
  limit 1;
  if v_price_list_id is null then
    raise exception using errcode = '22023', message = 'VALIDATION_FAILED: authorized price list not configured';
  end if;

  return query
  select p.id, p.sku, p.name, c.name, u.code, pp.unit_price, pl.currency
  from products p
  join units u on u.id = p.unit_id
  left join categories c on c.id = p.category_id
  join price_lists pl on pl.id = v_price_list_id
  join lateral (
    select price.unit_price
    from product_prices price
    where price.organization_id = v_customer.organization_id
      and price.price_list_id = v_price_list_id
      and price.product_id = p.id
      and price.effective_from <= now()
      and (price.effective_to is null or price.effective_to > now())
    order by price.effective_from desc
    limit 1
  ) pp on true
  where p.organization_id = v_customer.organization_id
    and p.status = 'active'
    and (p_after is null or p.id > p_after)
    and (p_search is null or p_search = '' or p.sku ilike '%' || p_search || '%' or p.name ilike '%' || p_search || '%')
  order by p.id
  limit p_limit;
end;
$$;

revoke all on function public.get_customer_catalog(text, integer, uuid) from public;
grant execute on function public.get_customer_catalog(text, integer, uuid) to authenticated;
