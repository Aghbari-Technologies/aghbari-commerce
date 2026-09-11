-- Fix the production-critical PL/pgSQL ambiguity in create_order.
-- The RETURNS TABLE(status ...) output parameter collides with products.status when
-- the latter is left unqualified. Keep the public return contract while qualifying
-- the relation column. The function is security-definer and uses an empty search_path.

create or replace function public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb
)
returns table (order_id uuid, order_number bigint, status public.order_status, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_order public.orders%rowtype;
  v_existing public.orders%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_price numeric(18,2);
  v_tier public.customer_tier;
  v_currency text;
  v_subtotal numeric(18,2) := 0;
  v_available integer;
  v_line_count integer;
  v_existing_count integer;
  v_requested_key text := pg_catalog.trim(pg_catalog.coalesce(p_idempotency_key,''));
begin
  if v_org is null or v_customer is null then raise exception using errcode='42501',message='authenticated customer context required'; end if;
  if pg_catalog.length(v_requested_key)<16 then raise exception using errcode='22023',message='invalid idempotency key'; end if;
  if p_warehouse_id is null then raise exception using errcode='22023',message='warehouse required'; end if;
  if p_lines is null or pg_catalog.jsonb_typeof(p_lines)<>'array' then raise exception using errcode='22023',message='order lines required'; end if;
  v_line_count:=pg_catalog.jsonb_array_length(p_lines); if v_line_count=0 or v_line_count>100 then raise exception using errcode='22023',message='order must contain between 1 and 100 lines'; end if;
  select c.tier into v_tier from public.customers c where c.id=v_customer and c.organization_id=v_org and c.is_active;
  if v_tier is null then raise exception using errcode='42501',message='active customer required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_org::text||':'||v_requested_key,0));
  for v_line in select value from pg_catalog.jsonb_array_elements(p_lines) loop
    if pg_catalog.nullif(pg_catalog.trim(v_line->>'product_id'),'') is null then raise exception using errcode='22023',message='product_id required'; end if;
    begin v_product:=(v_line->>'product_id')::uuid; exception when invalid_text_representation then raise exception using errcode='22023',message='invalid product_id'; end;
    if v_line->>'quantity' is null or v_line->>'quantity' !~ '^[0-9]+$' then raise exception using errcode='22023',message='invalid quantity'; end if;
    begin v_qty:=(v_line->>'quantity')::integer; exception when numeric_value_out_of_range then raise exception using errcode='22023',message='invalid quantity'; end;
    if v_qty<=0 or v_qty>10000 then raise exception using errcode='22023',message='invalid quantity'; end if;
  end loop;
  if exists(select 1 from(select value->>'product_id' as product_id from pg_catalog.jsonb_array_elements(p_lines)) lines group by product_id having count(*)>1) then raise exception using errcode='22023',message='duplicate product line'; end if;
  select * into v_existing from public.orders where organization_id=v_org and idempotency_key=v_requested_key;
  if found then
    if v_existing.customer_id<>v_customer or v_existing.warehouse_id<>p_warehouse_id then raise exception using errcode='40001',message='idempotency key payload conflict'; end if;
    select count(*) into v_existing_count from public.order_items where organization_id=v_org and order_id=v_existing.id;
    if v_existing_count<>v_line_count or exists(select 1 from pg_catalog.jsonb_array_elements(p_lines) line where not exists(select 1 from public.order_items oi where oi.organization_id=v_org and oi.order_id=v_existing.id and oi.product_id=(line->>'product_id')::uuid and oi.quantity=(line->>'quantity')::integer)) then raise exception using errcode='40001',message='idempotency key payload conflict'; end if;
    return query select v_existing.id,v_existing.order_number,v_existing.status,v_existing.total; return;
  end if;
  if not exists(select 1 from public.warehouses w where w.id=p_warehouse_id and w.organization_id=v_org and w.is_active) then raise exception using errcode='42501',message='warehouse not available'; end if;
  for v_line in select value from pg_catalog.jsonb_array_elements(p_lines) order by value->>'product_id' loop
    v_product:=(v_line->>'product_id')::uuid; v_qty:=(v_line->>'quantity')::integer;
    if not exists(select 1 from public.products p where p.id=v_product and p.organization_id=v_org and p.status='active') then raise exception using errcode='P0001',message='product unavailable'; end if;
    select pp.amount,pl.currency into v_price,v_currency from public.product_prices pp join public.price_lists pl on pl.id=pp.price_list_id where pp.organization_id=v_org and pp.product_id=v_product and pl.organization_id=v_org and pl.tier=v_tier and pl.is_active and pp.valid_from<=pg_catalog.now() and(pp.valid_to is null or pp.valid_to>pg_catalog.now()) order by pp.valid_from desc limit 1;
    if v_price is null then raise exception using errcode='P0001',message='authorized price unavailable'; end if;
    select ib.quantity into v_available from public.inventory_balances ib where ib.organization_id=v_org and ib.warehouse_id=p_warehouse_id and ib.product_id=v_product for update;
    if not found or v_available<v_qty then raise exception using errcode='P0001',message='insufficient stock'; end if;
    v_subtotal:=v_subtotal+(v_price*v_qty);
  end loop;
  insert into public.orders(organization_id,customer_id,warehouse_id,status,currency,subtotal,total,idempotency_key,created_by) values(v_org,v_customer,p_warehouse_id,'pending',pg_catalog.coalesce(v_currency,'YER'),v_subtotal,v_subtotal,v_requested_key,auth.uid()) returning * into v_order;
  for v_line in select value from pg_catalog.jsonb_array_elements(p_lines) order by value->>'product_id' loop
    v_product:=(v_line->>'product_id')::uuid; v_qty:=(v_line->>'quantity')::integer;
    select pp.amount into v_price from public.product_prices pp join public.price_lists pl on pl.id=pp.price_list_id where pp.organization_id=v_org and pp.product_id=v_product and pl.organization_id=v_org and pl.tier=v_tier and pl.is_active and pp.valid_from<=pg_catalog.now() and(pp.valid_to is null or pp.valid_to>pg_catalog.now()) order by pp.valid_from desc limit 1;
    update public.inventory_balances ib set quantity=ib.quantity-v_qty,updated_at=pg_catalog.now() where ib.organization_id=v_org and ib.warehouse_id=p_warehouse_id and ib.product_id=v_product and ib.quantity>=v_qty;
    if not found then raise exception using errcode='P0001',message='inventory changed; retry order'; end if;
    insert into public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) values(v_org,p_warehouse_id,v_product,-v_qty,'order',v_order.id,auth.uid());
    insert into public.order_items(organization_id,order_id,product_id,quantity,unit_price,pricing_tier) values(v_org,v_order.id,v_product,v_qty,v_price,v_tier);
  end loop;
  insert into public.order_status_history(organization_id,order_id,from_status,to_status,actor_id) values(v_org,v_order.id,null,'pending',auth.uid());
  insert into public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload) values(v_org,'order',v_order.id,'order.created',pg_catalog.jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number));
  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) values(v_org,auth.uid(),'order.create','order',v_order.id,'success',pg_catalog.jsonb_build_object('order_number',v_order.order_number));
  return query select v_order.id,v_order.order_number,v_order.status,v_order.total;
exception when unique_violation then raise;
end;
$$;

grant execute on function public.create_order(text,uuid,jsonb) to authenticated;
revoke execute on function public.create_order(text,uuid,jsonb) from anon;
