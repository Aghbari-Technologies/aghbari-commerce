-- Keep one authoritative customer notification source for status transitions.
-- order_status_history already emits one notification for real status changes.
-- The initial NULL -> pending row is suppressed by the prior migration.
CREATE OR REPLACE FUNCTION public.transition_order(
  p_order_id uuid,
  p_to_status public.order_status
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_order public.orders%rowtype;
  v_from public.order_status;
  v_allowed boolean:=false;
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_item record;
BEGIN
  IF v_org IS NULL THEN
    RAISE EXCEPTION USING errcode='42501',message='authenticated organization context required';
  END IF;
  SELECT * INTO v_order FROM public.orders
  WHERE id=p_order_id AND organization_id=v_org FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode='P0002',message='order not found';
  END IF;
  v_from:=v_order.status;

  v_allowed:=case
    when v_from='pending' and p_to_status='confirmed' then v_role in('owner','admin','sales')
    when v_from='confirmed' and p_to_status='preparing' then v_role in('owner','admin','warehouse')
    when v_from='preparing' and p_to_status='ready' then v_role in('owner','admin','warehouse')
    when v_from='ready' and p_to_status='completed' then v_role in('owner','admin','warehouse','sales')
    when v_from in('pending','confirmed','preparing') and p_to_status='cancelled' then v_role in('owner','admin','sales','warehouse')
    else false
  end;
  IF NOT v_allowed THEN
    RAISE EXCEPTION USING errcode='42501',message='order transition not authorized';
  END IF;

  IF p_to_status='cancelled' THEN
    FOR v_item IN
      SELECT oi.product_id,oi.quantity
      FROM public.order_items oi
      WHERE oi.organization_id=v_org AND oi.order_id=p_order_id
    LOOP
      UPDATE public.inventory_balances
      SET quantity=quantity+v_item.quantity,updated_at=now()
      WHERE organization_id=v_org AND warehouse_id=v_order.warehouse_id AND product_id=v_item.product_id;
      IF NOT FOUND THEN
        RAISE EXCEPTION USING errcode='P0001',message='inventory balance missing during cancellation';
      END IF;
      INSERT INTO public.inventory_movements(
        organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id
      ) VALUES(v_org,v_order.warehouse_id,v_item.product_id,v_item.quantity,'order_cancel',p_order_id,auth.uid());
    END LOOP;
  END IF;

  UPDATE public.orders
  SET status=p_to_status,updated_at=now()
  WHERE id=p_order_id
  RETURNING * INTO v_order;

  INSERT INTO public.order_status_history(
    organization_id,order_id,from_status,to_status,actor_id
  ) VALUES(v_org,p_order_id,v_from,p_to_status,auth.uid());

  INSERT INTO public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  ) VALUES(
    v_org,auth.uid(),'order.transition','order',p_order_id,'success',
    pg_catalog.jsonb_build_object('from',v_from,'to',p_to_status)
  );

  INSERT INTO public.outbox_events(
    organization_id,aggregate_type,aggregate_id,event_type,payload
  ) VALUES(
    v_org,'order',p_order_id,'order.status_changed',
    pg_catalog.jsonb_build_object('order_id',p_order_id,'from',v_from,'to',p_to_status)
  );

  RETURN v_order;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.transition_order(uuid,public.order_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_order(uuid,public.order_status) TO authenticated;

COMMENT ON FUNCTION public.transition_order(uuid,public.order_status) IS 'Authorized order state transition with inventory cancellation compensation, status history, audit and outbox. Customer status notification is emitted once by the status-history notification boundary.';
