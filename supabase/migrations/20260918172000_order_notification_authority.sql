-- Make customer order notifications part of the authoritative command transaction.
-- The previous trigger path is removed because the command itself is the single source of truth.
DROP TRIGGER IF EXISTS orders_customer_notifications ON public.orders;
DROP FUNCTION IF EXISTS public.notify_order_customer();

CREATE OR REPLACE FUNCTION public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb,
  p_payment_method text
)
RETURNS TABLE (order_id uuid, order_number bigint, status public.order_status, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_order public.orders%rowtype;
  v_existing public.orders%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_qty_numeric numeric;
  v_price numeric(18,2);
  v_tier public.customer_tier;
  v_currency text;
  v_subtotal numeric(18,2) := 0;
  v_available integer;
  v_line_count integer;
  v_existing_count integer;
  v_cart_id uuid;
  v_requested_key text := trim(coalesce(p_idempotency_key, ''));
  v_requested_payment text := lower(trim(coalesce(p_payment_method, '')));
BEGIN
  IF v_org IS NULL OR v_customer IS NULL THEN
    RAISE EXCEPTION USING errcode='42501', message='authenticated customer context required';
  END IF;
  IF length(v_requested_key) < 16 OR length(v_requested_key) > 128 THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid idempotency key';
  END IF;
  IF v_requested_payment NOT IN ('credit','cash','transfer') THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid payment method';
  END IF;
  IF p_warehouse_id IS NULL THEN
    RAISE EXCEPTION USING errcode='22023', message='warehouse required';
  END IF;
  IF p_lines IS NULL OR pg_catalog.jsonb_typeof(p_lines) <> 'array' THEN
    RAISE EXCEPTION USING errcode='22023', message='order lines required';
  END IF;

  v_line_count := pg_catalog.jsonb_array_length(p_lines);
  IF v_line_count = 0 OR v_line_count > 100 THEN
    RAISE EXCEPTION USING errcode='22023', message='order must contain between 1 and 100 lines';
  END IF;

  SELECT c.tier INTO v_tier
  FROM public.customers c
  WHERE c.id = v_customer AND c.organization_id = v_org AND c.is_active;
  IF v_tier IS NULL THEN
    RAISE EXCEPTION USING errcode='42501', message='active customer required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_org::text || ':' || v_requested_key, 0));

  FOR v_line IN SELECT value FROM pg_catalog.jsonb_array_elements(p_lines) LOOP
    IF nullif(pg_catalog.btrim(v_line->>'product_id'), '') IS NULL THEN
      RAISE EXCEPTION USING errcode='22023', message='product_id required';
    END IF;
    BEGIN
      v_product := (v_line->>'product_id')::uuid;
      v_qty_numeric := (v_line->>'quantity')::numeric;
    EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION USING errcode='22023', message='invalid product or quantity';
    END;
    IF v_qty_numeric IS NULL OR v_qty_numeric <> pg_catalog.trunc(v_qty_numeric)
       OR v_qty_numeric <= 0 OR v_qty_numeric > 10000 THEN
      RAISE EXCEPTION USING errcode='22023', message='quantity must be a positive integer not exceeding 10000';
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM (SELECT value->>'product_id' AS product_id FROM pg_catalog.jsonb_array_elements(p_lines)) lines
    GROUP BY product_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION USING errcode='22023', message='duplicate product line';
  END IF;

  SELECT * INTO v_existing
  FROM public.orders
  WHERE organization_id = v_org AND idempotency_key = v_requested_key;
  IF FOUND THEN
    IF v_existing.customer_id <> v_customer OR v_existing.warehouse_id <> p_warehouse_id
       OR v_existing.payment_method <> v_requested_payment THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;

    SELECT count(*) INTO v_existing_count
    FROM public.order_items oi
    WHERE oi.organization_id = v_org AND oi.order_id = v_existing.id;
    IF v_existing_count <> v_line_count OR EXISTS (
      SELECT 1
      FROM pg_catalog.jsonb_array_elements(p_lines) line
      WHERE NOT EXISTS (
        SELECT 1 FROM public.order_items oi
        WHERE oi.organization_id = v_org
          AND oi.order_id = v_existing.id
          AND oi.product_id = (line->>'product_id')::uuid
          AND oi.quantity = (line->>'quantity')::integer
      )
    ) THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;

    RETURN QUERY SELECT v_existing.id, v_existing.order_number, v_existing.status, v_existing.total;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.warehouses w
    WHERE w.id = p_warehouse_id AND w.organization_id = v_org AND w.is_active
  ) THEN
    RAISE EXCEPTION USING errcode='42501', message='warehouse not available';
  END IF;

  FOR v_line IN
    SELECT value FROM pg_catalog.jsonb_array_elements(p_lines)
    ORDER BY value->>'product_id'
  LOOP
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    IF NOT EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = v_product AND p.organization_id = v_org AND p.status = 'active'
    ) THEN
      RAISE EXCEPTION USING errcode='P0001', message='product unavailable';
    END IF;

    SELECT pp.amount, pl.currency INTO v_price, v_currency
    FROM public.product_prices pp
    JOIN public.price_lists pl ON pl.id = pp.price_list_id
    WHERE pp.organization_id = v_org
      AND pp.product_id = v_product
      AND pl.organization_id = v_org
      AND pl.tier = v_tier
      AND pl.is_active
      AND pp.valid_from <= pg_catalog.now()
      AND (pp.valid_to IS NULL OR pp.valid_to > pg_catalog.now())
    ORDER BY pp.valid_from DESC
    LIMIT 1;
    IF v_price IS NULL THEN
      RAISE EXCEPTION USING errcode='P0001', message='authorized price unavailable';
    END IF;

    SELECT ib.quantity INTO v_available
    FROM public.inventory_balances ib
    WHERE ib.organization_id = v_org AND ib.warehouse_id = p_warehouse_id AND ib.product_id = v_product
    FOR UPDATE;
    IF NOT FOUND OR v_available < v_qty THEN
      RAISE EXCEPTION USING errcode='P0001', message='insufficient stock';
    END IF;
    v_subtotal := v_subtotal + (v_price * v_qty);
  END LOOP;

  INSERT INTO public.orders(
    organization_id, customer_id, warehouse_id, status, currency,
    subtotal, total, idempotency_key, created_by, payment_method
  ) VALUES(
    v_org, v_customer, p_warehouse_id, 'pending', coalesce(v_currency, 'YER'),
    v_subtotal, v_subtotal, v_requested_key, auth.uid(), v_requested_payment
  ) RETURNING * INTO v_order;

  FOR v_line IN
    SELECT value FROM pg_catalog.jsonb_array_elements(p_lines)
    ORDER BY value->>'product_id'
  LOOP
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;

    SELECT pp.amount INTO v_price
    FROM public.product_prices pp
    JOIN public.price_lists pl ON pl.id=pp.price_list_id
    WHERE pp.organization_id=v_org
      AND pp.product_id=v_product
      AND pl.organization_id=v_org
      AND pl.tier=v_tier
      AND pl.is_active
      AND pp.valid_from<=pg_catalog.now()
      AND (pp.valid_to IS NULL OR pp.valid_to>pg_catalog.now())
    ORDER BY pp.valid_from DESC
    LIMIT 1;

    UPDATE public.inventory_balances ib
    SET quantity=ib.quantity-v_qty,updated_at=pg_catalog.now()
    WHERE ib.organization_id=v_org
      AND ib.warehouse_id=p_warehouse_id
      AND ib.product_id=v_product
      AND ib.quantity>=v_qty;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING errcode='P0001', message='inventory changed; retry order';
    END IF;

    INSERT INTO public.inventory_movements(
      organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id
    ) VALUES(v_org,p_warehouse_id,v_product,-v_qty,'order',v_order.id,auth.uid());

    INSERT INTO public.order_items(
      organization_id,order_id,product_id,quantity,unit_price,pricing_tier
    ) VALUES(v_org,v_order.id,v_product,v_qty,v_price,v_tier);
  END LOOP;

  SELECT c.id INTO v_cart_id
  FROM public.carts c
  WHERE c.organization_id=v_org AND c.customer_id=v_customer AND c.status='active'
  FOR UPDATE;

  IF v_cart_id IS NOT NULL THEN
    DELETE FROM public.cart_items ci
    WHERE ci.organization_id=v_org AND ci.cart_id=v_cart_id;
    UPDATE public.carts c
    SET status='converted',updated_at=pg_catalog.now()
    WHERE c.id=v_cart_id AND c.organization_id=v_org;
  END IF;

  INSERT INTO public.order_status_history(organization_id,order_id,from_status,to_status,actor_id)
  VALUES(v_org,v_order.id,NULL,'pending',auth.uid());

  INSERT INTO public.notifications(
    organization_id, customer_id, kind, title, body, entity_type, entity_id
  )
  VALUES(
    v_org, v_customer, 'order', 'تم استلام طلبك',
    pg_catalog.format('تم استلام الطلب #%s بقيمة %s %s وهو بانتظار المعالجة.', v_order.order_number, v_order.total, v_order.currency),
    'order', v_order.id
  );

  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'order',v_order.id,'order.created',pg_catalog.jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'payment_method',v_requested_payment));

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'order.create','order',v_order.id,'success',
         pg_catalog.jsonb_build_object('order_number',v_order.order_number,'cart_converted',v_cart_id IS NOT NULL,'payment_method',v_requested_payment));

  RETURN QUERY SELECT v_order.id,v_order.order_number,v_order.status,v_order.total;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.create_order(text,uuid,jsonb,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(text,uuid,jsonb,text) TO authenticated;

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

  INSERT INTO public.notifications(
    organization_id, customer_id, kind, title, body, entity_type, entity_id
  )
  VALUES(
    v_org, v_order.customer_id, 'order',
    'تحديث حالة الطلب #' || v_order.order_number,
    CASE p_to_status::text
      WHEN 'confirmed' THEN 'تم تأكيد طلبك وسيبدأ التجهيز.'
      WHEN 'preparing' THEN 'بدأ تجهيز طلبك.'
      WHEN 'ready' THEN 'طلبك جاهز للتسليم أو الشحن.'
      WHEN 'completed' THEN 'تم إكمال طلبك.'
      WHEN 'cancelled' THEN 'تم إلغاء الطلب.'
      ELSE 'تم تحديث حالة طلبك إلى: ' || p_to_status::text
    END,
    'order', p_order_id
  );

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

COMMENT ON FUNCTION public.create_order(text,uuid,jsonb,text) IS 'Atomic customer order command: resolves price server-side, locks stock, persists payment, notification, outbox and audit records, and enforces idempotency.';
COMMENT ON FUNCTION public.transition_order(uuid,public.order_status) IS 'Authorized order state transition with inventory cancellation compensation, customer notification, audit and outbox event.';
