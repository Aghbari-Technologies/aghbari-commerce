-- R4 order state machine with transactional reservation release on cancellation.
create or replace function app.transition_order_status(p_order_id uuid, p_to_status app.order_status)
returns app.order_status
language plpgsql security definer set search_path=app,public as $$
declare
  v_order app.orders%rowtype;
  v_actor uuid:=app.current_actor_id();
  v_org uuid:=app.current_organization_id();
  v_role boolean:=false;
  v_allowed boolean:=false;
  v_reserved numeric(14,3):=0;
begin
  if v_actor is null or v_org is null then raise exception 'authentication context required' using errcode='28000'; end if;
  select * into v_order from app.orders where id=p_order_id and organization_id=v_org for update;
  if not found then raise exception 'order not found' using errcode='P0002'; end if;

  -- Customers may cancel only their own still-pending order.
  if v_order.customer_id=app.current_customer_id() and p_to_status='cancelled' and v_order.status='pending' then v_allowed:=true; end if;

  select exists(select 1 from app.user_roles ur join app.roles r on r.id=ur.role_id where ur.user_id=v_actor and ur.organization_id=v_org and r.code in ('admin','order_manager','warehouse_manager')) into v_role;
  if v_role and ((v_order.status='draft' and p_to_status='pending') or (v_order.status='pending' and p_to_status in ('confirmed','cancelled')) or (v_order.status='confirmed' and p_to_status in ('processing','cancelled')) or (v_order.status='processing' and p_to_status='ready') or (v_order.status='ready' and p_to_status='delivered')) then v_allowed:=true; end if;
  if not v_allowed then raise exception 'invalid or unauthorized order transition' using errcode='42501'; end if;

  -- Orders currently consume available stock as a reservation. Cancelling before fulfillment atomically releases it.
  if p_to_status='cancelled' and v_order.status in ('pending','confirmed') then
    select coalesce(sum(quantity),0) into v_reserved from app.order_items where order_id=v_order.id and organization_id=v_org;
    if v_reserved > 0 then
      perform 1 from app.inventory_balances where organization_id=v_org and warehouse_id=v_order.warehouse_id and product_id=(select product_id from app.order_items where order_id=v_order.id order by id limit 1) for update;
      if (select count(*) from app.order_items where order_id=v_order.id) <> 1 then raise exception 'multi-line cancellation release requires allocation implementation' using errcode='0A000'; end if;
      update app.inventory_balances set quantity=quantity+v_reserved,updated_at=now() where organization_id=v_org and warehouse_id=v_order.warehouse_id and product_id=(select product_id from app.order_items where order_id=v_order.id order by id limit 1);
      insert into app.inventory_movements(organization_id,warehouse_id,product_id,movement_type,quantity_delta,source_type,source_id,actor_id,reason)
      values(v_org,v_order.warehouse_id,(select product_id from app.order_items where order_id=v_order.id order by id limit 1),'release',v_reserved,'order',v_order.id,v_actor,'cancelled order reservation release');
    end if;
  end if;

  update app.orders set status=p_to_status where id=p_order_id;
  insert into app.order_status_history(organization_id,order_id,from_status,to_status,actor_id) values(v_org,p_order_id,v_order.status,p_to_status,v_actor);
  insert into app.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,metadata) values(v_org,v_actor,'order.status_changed','order',p_order_id,jsonb_build_object('from',v_order.status,'to',p_to_status));
  insert into app.outbox_events(organization_id,event_type,aggregate_type,aggregate_id,correlation_id,payload) values(v_org,'order.status_changed.v1','order',p_order_id,gen_random_uuid(),jsonb_build_object('order_id',p_order_id,'from',v_order.status,'to',p_to_status));
  return p_to_status;
end;
$$;
revoke execute on function app.transition_order_status(uuid,app.order_status) from public;
do $$ begin if exists(select 1 from pg_roles where rolname='authenticated') then execute 'grant execute on function app.transition_order_status(uuid,app.order_status) to authenticated'; end if; end $$;
