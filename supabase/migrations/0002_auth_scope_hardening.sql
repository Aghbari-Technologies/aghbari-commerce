-- R1 security hardening: bind authenticated actors to customer identities and make
-- the transactional command executable without granting direct table mutation.
create table app.customer_users (
  organization_id uuid not null references app.organizations(id) on delete cascade,
  customer_id uuid not null references app.customers(id) on delete cascade,
  user_id uuid not null references app.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, customer_id, user_id),
  unique (organization_id, user_id)
);
create index customer_users_customer_idx on app.customer_users (organization_id, customer_id);
alter table app.customer_users enable row level security;
create policy customer_user_self_select on app.customer_users for select to public using (organization_id=app.current_organization_id() and user_id=app.current_actor_id());

create or replace function app.create_order(p_operation_id uuid,p_product_id uuid,p_quantity numeric,p_warehouse_id uuid)
returns table(order_id uuid,order_number bigint,total numeric(14,2),replayed boolean)
language plpgsql security definer set search_path=app,public as $$
declare v_org uuid:=app.current_organization_id(); v_actor uuid:=app.current_actor_id(); v_customer uuid:=app.current_customer_id(); v_price record; v_stock numeric(14,3); v_existing app.orders%rowtype; v_hash text;
begin
  if v_org is null or v_actor is null or v_customer is null then raise exception 'authentication context required' using errcode='28000'; end if;
  if not exists(select 1 from app.customer_users cu where cu.organization_id=v_org and cu.customer_id=v_customer and cu.user_id=v_actor) then raise exception 'forbidden' using errcode='42501'; end if;
  if p_quantity<=0 then raise exception 'invalid quantity' using errcode='22023'; end if;
  if not exists(select 1 from app.warehouses w where w.id=p_warehouse_id and w.organization_id=v_org and w.active) then raise exception 'warehouse not found' using errcode='P0002'; end if;
  if not exists(select 1 from app.products p where p.id=p_product_id and p.organization_id=v_org and p.status='active') then raise exception 'product not found' using errcode='P0002'; end if;
  v_hash:=encode(digest(format('%s|%s|%s',p_product_id,p_quantity,p_warehouse_id),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  select * into v_existing from app.orders where organization_id=v_org and operation_id=p_operation_id;
  if found then if v_existing.payload_hash<>v_hash then raise exception 'operation_id replay payload conflict' using errcode='23505'; end if; return query select v_existing.id,v_existing.order_number,v_existing.total,true; return; end if;
  select * into v_price from app.resolve_price(p_product_id);
  if not found then raise exception 'authorized price not found' using errcode='P0002'; end if;
  select quantity into v_stock from app.inventory_balances where organization_id=v_org and warehouse_id=p_warehouse_id and product_id=p_product_id for update;
  if not found or v_stock<p_quantity then raise exception 'insufficient inventory' using errcode='P0001'; end if;
  insert into app.orders(organization_id,customer_id,warehouse_id,status,currency,subtotal,total,operation_id,payload_hash,created_by)
  values(v_org,v_customer,p_warehouse_id,'pending',v_price.currency,round(p_quantity*v_price.unit_price,2),round(p_quantity*v_price.unit_price,2),p_operation_id,v_hash,v_actor)
  returning id,orders.order_number,orders.total into order_id,order_number,total;
  insert into app.order_items(organization_id,order_id,product_id,quantity,unit_price,pricing_context) values(v_org,order_id,p_product_id,p_quantity,v_price.unit_price,jsonb_build_object('customer_tier_id',v_price.tier_id));
  update app.inventory_balances set quantity=quantity-p_quantity,updated_at=now() where organization_id=v_org and warehouse_id=p_warehouse_id and product_id=p_product_id;
  insert into app.inventory_movements(organization_id,warehouse_id,product_id,movement_type,quantity_delta,source_type,source_id,actor_id,reason) values(v_org,p_warehouse_id,p_product_id,'sale',-p_quantity,'order',order_id,v_actor,'order creation');
  insert into app.order_status_history(organization_id,order_id,from_status,to_status,actor_id) values(v_org,order_id,null,'pending',v_actor);
  insert into app.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,correlation_id,metadata) values(v_org,v_actor,'order.created','order',order_id,p_operation_id,jsonb_build_object('quantity',p_quantity,'unit_price',v_price.unit_price,'total',total));
  insert into app.outbox_events(organization_id,event_type,aggregate_type,aggregate_id,correlation_id,payload) values(v_org,'order.created.v1','order',order_id,p_operation_id,jsonb_build_object('order_id',order_id,'order_number',order_number));
  replayed:=false; return next;
end; $$;

revoke execute on function app.create_order(uuid,uuid,numeric,uuid) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant usage on schema app to authenticated'; execute 'grant execute on function app.create_order(uuid,uuid,numeric,uuid) to authenticated'; end if; end $$;
