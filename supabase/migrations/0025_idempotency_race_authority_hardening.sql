-- Race-safe follow-up for create_order.
-- The unique_violation fallback must enforce the same customer and warehouse
-- binding as the normal idempotency lookup. Otherwise a concurrent insert can
-- cause a second caller to receive the first caller's order metadata.

CREATE OR REPLACE FUNCTION public.create_order(
  p_idempotency_key text,
  p_warehouse_id uuid,
  p_lines jsonb
)
RETURNS TABLE (order_id uuid, order_number bigint, status public.order_status, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_order public.orders%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_price numeric(18,2);
  v_tier public.customer_tier;
  v_currency text;
  v_subtotal numeric(18,2) := 0;
  v_existing public.orders%rowtype;
  v_available integer;
BEGIN
  IF v_org IS NULL OR v_customer IS NULL THEN
    RAISE EXCEPTION USING errcode='42501', message='authenticated customer context required';
  END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) < 16 THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid idempotency key';
  END IF;
  IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION USING errcode='22023', message='order lines required';
  END IF;

  SELECT c.tier INTO v_tier FROM public.customers c
  WHERE c.id = v_customer AND c.organization_id = v_org AND c.is_active;
  IF v_tier IS NULL THEN
    RAISE EXCEPTION USING errcode='42501', message='active customer required';
  END IF;

  SELECT * INTO v_existing FROM public.orders
  WHERE organization_id=v_org AND idempotency_key=p_idempotency_key;
  IF FOUND THEN
    IF v_existing.customer_id <> v_customer OR v_existing.warehouse_id <> p_warehouse_id THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.order_number, v_existing.status, v_existing.total;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.warehouses
    WHERE id=p_warehouse_id AND organization_id=v_org AND is_active
  ) THEN
    RAISE EXCEPTION USING errcode='42501', message='warehouse not available';
  END IF;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION USING errcode='22023', message='invalid quantity';
    END IF;

    SELECT pp.amount, pl.currency INTO v_price, v_currency
    FROM public.product_prices pp
    JOIN public.price_lists pl ON pl.id=pp.price_list_id
    WHERE pp.organization_id=v_org AND pp.product_id=v_product
      AND pl.organization_id=v_org AND pl.tier=v_tier AND pl.is_active
      AND pp.valid_from <= now() AND (pp.valid_to IS NULL OR pp.valid_to > now())
    ORDER BY pp.valid_from DESC LIMIT 1;
    IF v_price IS NULL THEN
      RAISE EXCEPTION USING errcode='P0001', message='authorized price unavailable';
    END IF;

    SELECT quantity INTO v_available FROM public.inventory_balances
    WHERE organization_id=v_org AND warehouse_id=p_warehouse_id AND product_id=v_product
    FOR UPDATE;
    IF NOT FOUND OR v_available < v_qty THEN
      RAISE EXCEPTION USING errcode='P0001', message='insufficient stock';
    END IF;
    v_subtotal := v_subtotal + (v_price * v_qty);
  END LOOP;

  INSERT INTO public.orders(organization_id, customer_id, warehouse_id, status, currency, subtotal, total, idempotency_key, created_by)
  VALUES(v_org, v_customer, p_warehouse_id, 'pending', coalesce(v_currency,'YER'), v_subtotal, v_subtotal, p_idempotency_key, auth.uid())
  RETURNING * INTO v_order;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    v_product := (v_line->>'product_id')::uuid;
    v_qty := (v_line->>'quantity')::integer;
    SELECT pp.amount INTO v_price
    FROM public.product_prices pp JOIN public.price_lists pl ON pl.id=pp.price_list_id
    WHERE pp.organization_id=v_org AND pp.product_id=v_product
      AND pl.organization_id=v_org AND pl.tier=v_tier AND pl.is_active
      AND pp.valid_from <= now() AND (pp.valid_to IS NULL OR pp.valid_to > now())
    ORDER BY pp.valid_from DESC LIMIT 1;

    UPDATE public.inventory_balances
    SET quantity = quantity - v_qty, updated_at = now()
    WHERE organization_id=v_org AND warehouse_id=p_warehouse_id AND product_id=v_product AND quantity >= v_qty;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING errcode='P0001', message='inventory changed; retry order';
    END IF;

    INSERT INTO public.inventory_movements(organization_id, warehouse_id, product_id, delta, source_type, source_id, actor_id)
    VALUES(v_org, p_warehouse_id, v_product, -v_qty, 'order', v_order.id, auth.uid());
    INSERT INTO public.order_items(organization_id, order_id, product_id, quantity, unit_price, pricing_tier)
    VALUES(v_org, v_order.id, v_product, v_qty, v_price, v_tier);
  END LOOP;

  INSERT INTO public.order_status_history(organization_id, order_id, from_status, to_status, actor_id)
  VALUES(v_org, v_order.id, NULL, 'pending', auth.uid());
  INSERT INTO public.outbox_events(organization_id, aggregate_type, aggregate_id, event_type, payload)
  VALUES(v_org, 'order', v_order.id, 'order.created', jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number));
  INSERT INTO public.audit_events(organization_id, actor_id, action, target_type, target_id, result, metadata)
  VALUES(v_org, auth.uid(), 'order.create', 'order', v_order.id, 'success', jsonb_build_object('order_number', v_order.order_number));

  RETURN QUERY SELECT v_order.id, v_order.order_number, v_order.status, v_order.total;
EXCEPTION WHEN unique_violation THEN
  SELECT * INTO v_existing FROM public.orders
  WHERE organization_id=v_org AND idempotency_key=p_idempotency_key;
  IF FOUND THEN
    IF v_existing.customer_id <> v_customer OR v_existing.warehouse_id <> p_warehouse_id THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.order_number, v_existing.status, v_existing.total;
    RETURN;
  END IF;
  RAISE;
END;
$$;

COMMENT ON FUNCTION public.create_order(text,uuid,jsonb) IS 'Atomic customer order command with server-authoritative pricing, stock locking, idempotency, and race-safe customer binding.';
