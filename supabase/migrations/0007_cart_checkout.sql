-- R4 transactional cart checkout: multi-line atomic order creation with deterministic locking.
create or replace function app.create_order_from_cart(p_operation_id uuid,p_warehouse_id uuid,p_items jsonb)
returns table(order_id uuid,order_number bigint,total numeric(14,2),replayed boolean)
language plpgsql security definer set search_path=app,public as $$
declare
  v_org uuid:=app.current_organization_id(); v_actor uuid:=app.current_actor_id(); v_customer uuid:=app.current_customer_id();
  v_existing app.orders%rowtype; v_hash text; v_total numeric(14,2):=0; v_currency char(3); v_price record; v_stock numeric(14,3); v_lines integer:=0; v_product uuid;
  v_qty numeric(14,3); v_line_total numeric(14,2);
begin
  if v_org is null or v_actor is null or v_customer is null then raise exception 'authentication context required' using errcode='28000'; end if;
  if not exists(select 1 from app.customer_users cu where cu.organization_id=v_org and cu.customer_id=v_customer and cu.user_id=v_actor) then raise exception 'forbidden' using errcode='42501'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>100 then raise exception 'invalid cart' using errcode='22023'; end if;
  if exists(select 1 from jsonb_to_recordset(p_items) x(product_id uuid,quantity numeric) where x.product_id is null or x.quantity is null or x.quantity<=0) then raise exception 'invalid cart line' using errcode='22023'; end if;
  if (select count(*) from jsonb_to_recordset(p_items) x(product_id uuid,quantity numeric)) <> (select count(distinct x.product_id) from jsonb_to_recordset(p_items) x(product_id uuid,quantity numeric)) then raise exception 'duplicate product in cart' using errcode='23505'; end if;
  if not exists(select 1 from app.warehouses w where w.id=p_warehouse_id and w.organization_id=v_org and w.active) then raise exception 'warehouse not found' using errcode='P0002'; end if;

  v_hash:=encode(digest(p_items::text||'|'||p_warehouse_id::text,'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  select * into v_existing from app.orders where organization_id=v_org and operation_id=p_operation_id;
  if found then
    if v_existing.payload_hash<>v_hash then raise exception 'operation_id replay payload conflict' using errcode='23505'; end if;
    return query select v_existing.id,v_existing.order_number,v_existing.total,true; return;
  end if;

  -- First pass: lock inventory rows in product-id order, validate stock and calculate server-authoritative prices.
  for v_product,v_qty in select x.product_id,x.quantity from jsonb_to_recordset(p_items) x(product_id uuid,quantity numeric) order by x.product_id loop
    select p.unit_price,p.currency,p.tier_id into v_price from app.resolve_price(v_product) p;
    if not found then raise exception 'authorized price not found for product %',v_product using errcode='P0002'; end if;
    if v_currency is null then v_currency:=v_price.currency; elsif v_currency<>v_price.currency then raise exception 'mixed currencies are not allowed' using errcode='22023'; end if;
    select ib.quantity into v_stock from app.inventory_balances ib where ib.organization_id=v_org and ib.warehouse_id=p_warehouse_id and ib.product_id=v_product for update;
    if not found or v_stock<v_qty then raise exception 'insufficient inventory for product %',v_product using errcode='P0001'; end if;
    v_line_total:=round(v_qty*v_price.unit_price,2); v_total:=v_total+v_line_total; v_lines:=v_lines+1;
  end loop;

  insert into app.orders(organization_id,customer_id,warehouse_id,status,currency,subtotal,total,operation_id,payload_hash,created_by)
  values(v_org,v_customer,p_warehouse_id,'pending',v_currency,v_total,v_total,p_operation_id,v_hash,v_actor)
  returning id,orders.order_number,orders.total into order_id,order_number,total;

  for v_product,v_qty in select x.product_id,x.quantity from jsonb_to_recordset(p_items) x(product_id uuid,quantity numeric) order by x.product_id loop
    select p.unit_price,p.currency,p.tier_id into v_price from app.resolve_price(v_product) p;
    v_line_total:=round(v_qty*v_price.unit_price,2);
    insert into app.order_items(organization_id,order_id,product_id,quantity,unit_price,pricing_context) values(v_org,order_id,v_product,v_qty,v_price.unit_price,jsonb_build_object('customer_tier_id',v_price.tier_id));
    update app.inventory_balances set quantity=quantity-v_qty,updated_at=now() where organization_id=v_org and warehouse_id=p_warehouse_id and product_id=v_product;
    insert into app.inventory_movements(organization_id,warehouse_id,product_id,movement_type,quantity_delta,source_type,source_id,actor_id,reason) values(v_org,p_warehouse_id,v_product,'reservation',-v_qty,'order',order_id,v_actor,'order reservation');
  end loop;

  insert into app.order_status_history(organization_id,order_id,from_status,to_status,actor_id) values(v_org,order_id,null,'pending',v_actor);
  insert into app.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,correlation_id,metadata) values(v_org,v_actor,'order.created','order',order_id,p_operation_id,jsonb_build_object('line_count',v_lines,'total',v_total,'currency',v_currency));
  insert into app.outbox_events(organization_id,event_type,aggregate_type,aggregate_id,correlation_id,payload) values(v_org,'order.created.v1','order',order_id,p_operation_id,jsonb_build_object('order_id',order_id,'order_number',order_number));
  replayed:=false; return next;
end;
$$;
revoke execute on function app.create_order_from_cart(uuid,uuid,jsonb) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.create_order_from_cart(uuid,uuid,jsonb) to authenticated'; end if; end $$;

-- Preserve the one-line contract as a strict wrapper around the multi-line transactional implementation.
create or replace function app.create_order(p_operation_id uuid,p_product_id uuid,p_quantity numeric,p_warehouse_id uuid)
returns table(order_id uuid,order_number bigint,total numeric(14,2),replayed boolean)
language sql security definer set search_path=app,public as $$
  select * from app.create_order_from_cart(p_operation_id,p_warehouse_id,jsonb_build_array(jsonb_build_object('product_id',p_product_id,'quantity',p_quantity)));
$$;
revoke execute on function app.create_order(uuid,uuid,numeric,uuid) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.create_order(uuid,uuid,numeric,uuid) to authenticated'; end if; end $$;
