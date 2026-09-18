-- Order payment-method authority: persist customer payment intent server-side.
-- The payment method is part of the idempotent command payload; changing it under the same key is a conflict.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'credit';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND conname = 'orders_payment_method_chk'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_method_chk
      CHECK (payment_method IN ('credit','cash','transfer'));
  END IF;
END;
$$;

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

  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'order',v_order.id,'order.created',pg_catalog.jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'payment_method',v_requested_payment));

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'order.create','order',v_order.id,'success',
         pg_catalog.jsonb_build_object('order_number',v_order.order_number,'cart_converted',v_cart_id IS NOT NULL,'payment_method',v_requested_payment));

  RETURN QUERY SELECT v_order.id,v_order.order_number,v_order.status,v_order.total;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_order(text, uuid, jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order(text, uuid, jsonb, text) FROM PUBLIC, anon;

-- Backward-compatible caller contract: three-argument create_order means explicit legacy default 'credit'.
CREATE OR REPLACE FUNCTION public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb
)
RETURNS TABLE (order_id uuid, order_number bigint, status public.order_status, total numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT * FROM public.create_order(p_idempotency_key, p_warehouse_id, p_lines, 'credit');
$function$;

GRANT EXECUTE ON FUNCTION public.create_order(text, uuid, jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order(text, uuid, jsonb) FROM PUBLIC, anon;

COMMENT ON COLUMN public.orders.payment_method IS 'Customer payment intent captured as part of the authoritative idempotent create-order command.';
