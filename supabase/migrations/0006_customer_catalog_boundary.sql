-- R2 security boundary: customers receive an authorized catalog projection, never raw tier-price or warehouse rows.
create or replace function app.actor_has_staff_role()
returns boolean language sql stable security invoker set search_path=app,public as $$
  select exists(select 1 from app.user_roles ur join app.roles r on r.id=ur.role_id where ur.user_id=app.current_actor_id() and ur.organization_id=app.current_organization_id() and r.code in ('admin','catalog_manager','pricing_manager','warehouse_manager','order_manager','import_manager'));
$$;

-- Raw pricing and stock are staff-only; customer clients use get_product_catalog().
drop policy if exists tier_select on app.customer_tiers;
drop policy if exists price_list_select on app.price_lists;
drop policy if exists product_price_select on app.product_prices;
drop policy if exists inventory_select on app.inventory_balances;
drop policy if exists movement_select on app.inventory_movements;
create policy tier_staff_select on app.customer_tiers for select to public using (organization_id=app.current_organization_id() and app.actor_has_staff_role());
create policy price_list_staff_select on app.price_lists for select to public using (organization_id=app.current_organization_id() and app.actor_has_staff_role());
create policy product_price_staff_select on app.product_prices for select to public using (organization_id=app.current_organization_id() and app.actor_has_staff_role());
create policy inventory_staff_select on app.inventory_balances for select to public using (organization_id=app.current_organization_id() and app.actor_has_staff_role());
create policy movement_staff_select on app.inventory_movements for select to public using (organization_id=app.current_organization_id() and app.actor_has_staff_role());

create or replace function app.get_product_catalog(p_search text default null, p_limit integer default 100)
returns table(id uuid, sku text, name text, description text, unit text, image_path text, available_quantity numeric(14,3), unit_price numeric(14,2), currency char(3))
language sql stable security definer set search_path=app,public as $$
  select p.id,p.sku,p.name,p.description,p.unit,p.image_path,
         coalesce((select sum(ib.quantity) from app.inventory_balances ib join app.warehouses w on w.id=ib.warehouse_id where ib.organization_id=p.organization_id and ib.product_id=p.id and w.active),0)::numeric(14,3),
         rp.unit_price,rp.currency
  from app.products p
  left join lateral app.resolve_price(p.id) rp on true
  where p.organization_id=app.current_organization_id() and p.status='active'
    and exists(select 1 from app.customer_users cu where cu.organization_id=p.organization_id and cu.customer_id=app.current_customer_id() and cu.user_id=app.current_actor_id())
    and (p_search is null or p.name ilike '%'||p_search||'%' or p.sku ilike '%'||p_search||'%')
  order by p.name
  limit greatest(1,least(coalesce(p_limit,100),100));
$$;
revoke execute on function app.get_product_catalog(text,integer) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.get_product_catalog(text,integer) to authenticated'; end if; end $$;
