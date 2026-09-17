-- Restore the authoritative purchase receiving outbox contract in a fresh reconstruction.
-- The live function emits one durable purchase.receipt aggregate event after the transaction's
-- receipt, inventory and audit effects are created. Keep the public signature unchanged.

CREATE OR REPLACE FUNCTION public.receive_purchase_order(
  p_purchase_order_id uuid,
  p_idempotency_key text,
  p_lines jsonb,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(
  receipt_id uuid,
  receipt_number bigint,
  purchase_order_id uuid,
  purchase_order_status public.purchase_order_status,
  received_total numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_key text := trim(coalesce(p_idempotency_key, ''));
  v_po public.purchase_orders%rowtype;
  v_receipt public.purchase_receipts%rowtype;
  v_existing public.purchase_receipts%rowtype;
  v_line jsonb;
  v_item public.purchase_order_items%rowtype;
  v_product uuid;
  v_qty integer;
  v_inventory integer;
  v_total numeric(18,2) := 0;
  v_existing_count integer;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','warehouse') THEN
    RAISE EXCEPTION USING errcode='42501', message='receiving access required';
  END IF;

  IF p_purchase_order_id IS NULL
     OR length(v_key) < 16
     OR length(v_key) > 128
     OR p_lines IS NULL
     OR jsonb_typeof(p_lines) <> 'array'
     OR jsonb_array_length(p_lines) = 0
     OR jsonb_array_length(p_lines) > 100 THEN
    RAISE EXCEPTION USING errcode='22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text || ':receipt:' || v_key, 0));

  SELECT * INTO v_existing
  FROM public.purchase_receipts
  WHERE organization_id = v_org
    AND idempotency_key = v_key;

  IF FOUND THEN
    IF v_existing.purchase_order_id <> p_purchase_order_id
       OR coalesce(v_existing.notes, '') <> coalesce(nullif(trim(p_notes), ''), '') THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;

    SELECT count(*) INTO v_existing_count
    FROM public.purchase_receipt_items pri
    WHERE pri.organization_id = v_org
      AND pri.receipt_id = v_existing.id;

    IF v_existing_count <> jsonb_array_length(p_lines) THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p_lines) x
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.purchase_receipt_items pri
        WHERE pri.organization_id = v_org
          AND pri.receipt_id = v_existing.id
          AND pri.purchase_order_item_id = (x->>'purchase_order_item_id')::uuid
          AND pri.product_id = (x->>'product_id')::uuid
          AND pri.quantity_received = (x->>'quantity')::integer
      )
    ) THEN
      RAISE EXCEPTION USING errcode='40001', message='idempotency key payload conflict';
    END IF;

    SELECT * INTO v_po
    FROM public.purchase_orders
    WHERE id = v_existing.purchase_order_id
      AND organization_id = v_org;

    SELECT coalesce(sum(line_total), 0) INTO v_total
    FROM public.purchase_receipt_items
    WHERE organization_id = v_org
      AND receipt_id = v_existing.id;

    RETURN QUERY
    SELECT v_existing.id,
           v_existing.receipt_number,
           v_existing.purchase_order_id,
           v_po.status,
           v_total;
    RETURN;
  END IF;

  SELECT * INTO v_po
  FROM public.purchase_orders po0
  WHERE po0.id = p_purchase_order_id
    AND po0.organization_id = v_org
  FOR UPDATE;

  IF NOT FOUND OR v_po.status NOT IN ('approved','partially_received') THEN
    RAISE EXCEPTION USING errcode='22023', message='purchase order is not receivable';
  END IF;

  INSERT INTO public.purchase_receipts(
    organization_id,
    purchase_order_id,
    warehouse_id,
    idempotency_key,
    received_by,
    notes
  )
  VALUES (
    v_org,
    v_po.id,
    v_po.warehouse_id,
    v_key,
    auth.uid(),
    nullif(trim(p_notes), '')
  )
  RETURNING * INTO v_receipt;

  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    BEGIN
      v_product := (v_line->>'product_id')::uuid;
      v_qty := (v_line->>'quantity')::integer;
    EXCEPTION
      WHEN invalid_text_representation OR numeric_value_out_of_range THEN
        RAISE EXCEPTION USING errcode='22023', message='invalid receipt line';
    END;

    SELECT * INTO v_item
    FROM public.purchase_order_items poi
    WHERE poi.id = (v_line->>'purchase_order_item_id')::uuid
      AND poi.organization_id = v_org
      AND poi.purchase_order_id = v_po.id
      AND poi.product_id = v_product
    FOR UPDATE;

    IF NOT FOUND
       OR v_qty IS NULL
       OR v_qty <= 0
       OR v_qty > v_item.quantity_ordered - v_item.quantity_received THEN
      RAISE EXCEPTION USING errcode='22023';
    END IF;

    INSERT INTO public.inventory_balances(
      organization_id,
      warehouse_id,
      product_id,
      quantity
    )
    VALUES (v_org, v_po.warehouse_id, v_product, 0)
    ON CONFLICT (warehouse_id, product_id) DO NOTHING;

    SELECT ib.quantity INTO v_inventory
    FROM public.inventory_balances ib
    WHERE ib.organization_id = v_org
      AND ib.warehouse_id = v_po.warehouse_id
      AND ib.product_id = v_product
    FOR UPDATE;

    UPDATE public.inventory_balances ib
    SET quantity = coalesce(v_inventory, 0) + v_qty,
        updated_at = now()
    WHERE ib.organization_id = v_org
      AND ib.warehouse_id = v_po.warehouse_id
      AND ib.product_id = v_product;

    UPDATE public.purchase_order_items poi
    SET quantity_received = quantity_received + v_qty
    WHERE poi.id = v_item.id;

    INSERT INTO public.purchase_receipt_items(
      organization_id,
      receipt_id,
      purchase_order_item_id,
      product_id,
      quantity_received,
      unit_cost
    )
    VALUES (
      v_org,
      v_receipt.id,
      v_item.id,
      v_product,
      v_qty,
      v_item.unit_cost
    );

    INSERT INTO public.inventory_movements(
      organization_id,
      warehouse_id,
      product_id,
      delta,
      source_type,
      source_id,
      actor_id
    )
    VALUES (
      v_org,
      v_po.warehouse_id,
      v_product,
      v_qty,
      'purchase_receipt',
      v_receipt.id,
      auth.uid()
    );

    v_total := v_total + v_item.unit_cost * v_qty;
  END LOOP;

  UPDATE public.purchase_orders po0
  SET status = CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.purchase_order_items poi
      WHERE poi.organization_id = v_org
        AND poi.purchase_order_id = v_po.id
        AND poi.quantity_received < poi.quantity_ordered
    ) THEN 'received'::public.purchase_order_status
    ELSE 'partially_received'::public.purchase_order_status
  END,
  updated_at = now()
  WHERE po0.id = v_po.id;

  SELECT * INTO v_po
  FROM public.purchase_orders
  WHERE id = v_po.id;

  INSERT INTO public.audit_events(
    organization_id,
    actor_id,
    action,
    target_type,
    target_id,
    result,
    metadata
  )
  VALUES (
    v_org,
    auth.uid(),
    'purchase.received',
    'purchase_receipt',
    v_receipt.id,
    'success',
    jsonb_build_object(
      'purchase_order_id', v_po.id,
      'received_total', v_total
    )
  );

  INSERT INTO public.outbox_events(
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload
  )
  VALUES (
    v_org,
    'purchase_receipt',
    v_receipt.id,
    'purchase.received',
    jsonb_build_object(
      'receipt_id', v_receipt.id,
      'purchase_order_id', v_po.id,
      'received_total', v_total
    )
  );

  RETURN QUERY
  SELECT v_receipt.id,
         v_receipt.receipt_number,
         v_po.id,
         v_po.status,
         v_total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.receive_purchase_order(uuid, text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.receive_purchase_order(uuid, text, jsonb, text) TO authenticated;
