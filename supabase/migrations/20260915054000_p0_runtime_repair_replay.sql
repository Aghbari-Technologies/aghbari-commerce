-- P0 forward repairs discovered by exact fresh-db replay on 38ddfd.
-- These are runtime fixes, not test-only adjustments.

CREATE OR REPLACE FUNCTION public.transfer_inventory(
  p_source_warehouse_id uuid,
  p_destination_warehouse_id uuid,
  p_idempotency_key text,
  p_lines jsonb,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(transfer_id uuid,transfer_status text,total_quantity bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_key text:=trim(coalesce(p_idempotency_key,''));
  v_notes text:=nullif(trim(p_notes),'');
  v_transfer public.inventory_transfers%rowtype;
  v_existing public.inventory_transfers%rowtype;
  v_line jsonb;
  v_product uuid;
  v_qty integer;
  v_count integer;
  v_existing_count integer;
  v_source integer;
  v_total bigint:=0;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','warehouse') THEN
    RAISE EXCEPTION USING errcode='42501',message='inventory transfer access required';
  END IF;
  IF p_source_warehouse_id=p_destination_warehouse_id THEN
    RAISE EXCEPTION USING errcode='22023',message='source and destination warehouses must differ';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.warehouses WHERE id=p_source_warehouse_id AND organization_id=v_org AND is_active) THEN
    RAISE EXCEPTION USING errcode='P0002',message='source warehouse not found';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.warehouses WHERE id=p_destination_warehouse_id AND organization_id=v_org AND is_active) THEN
    RAISE EXCEPTION USING errcode='P0002',message='destination warehouse not found';
  END IF;
  IF length(v_key)<16 OR length(v_key)>128 THEN
    RAISE EXCEPTION USING errcode='22023',message='invalid idempotency key';
  END IF;
  IF p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' THEN
    RAISE EXCEPTION USING errcode='22023',message='transfer lines required';
  END IF;
  v_count:=jsonb_array_length(p_lines);
  IF v_count=0 OR v_count>100 THEN
    RAISE EXCEPTION USING errcode='22023',message='transfer must contain between 1 and 100 lines';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':transfer:'||v_key,0));
  SELECT * INTO v_existing FROM public.inventory_transfers WHERE organization_id=v_org AND idempotency_key=v_key;
  IF FOUND THEN
    SELECT count(*) INTO v_existing_count
    FROM public.inventory_transfer_items i
    WHERE i.organization_id=v_org AND i.transfer_id=v_existing.id;
    IF v_existing.source_warehouse_id<>p_source_warehouse_id OR v_existing.destination_warehouse_id<>p_destination_warehouse_id
       OR coalesce(v_existing.notes,'')<>coalesce(v_notes,'') OR v_existing_count<>v_count THEN
      RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict';
    END IF;
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_lines) x
      WHERE NOT EXISTS (
        SELECT 1 FROM public.inventory_transfer_items i
        WHERE i.organization_id=v_org AND i.transfer_id=v_existing.id
          AND i.product_id=(x->>'product_id')::uuid
          AND i.quantity=(x->>'quantity')::integer
      )
    ) THEN
      RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict';
    END IF;
    SELECT coalesce(sum(i.quantity),0) INTO v_total
    FROM public.inventory_transfer_items i
    WHERE i.organization_id=v_org AND i.transfer_id=v_existing.id;
    RETURN QUERY SELECT v_existing.id,v_existing.status,v_total;
    RETURN;
  END IF;

  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) ORDER BY value->>'product_id' LOOP
    BEGIN
      v_product:=(v_line->>'product_id')::uuid;
      v_qty:=(v_line->>'quantity')::integer;
    EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION USING errcode='22023',message='invalid transfer line';
    END;
    IF v_product IS NULL OR v_qty IS NULL OR v_qty<=0 OR v_qty>100000 THEN
      RAISE EXCEPTION USING errcode='22023',message='invalid transfer quantity';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.products WHERE id=v_product AND organization_id=v_org AND status='active') THEN
      RAISE EXCEPTION USING errcode='P0002',message='product not found';
    END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) x WHERE x->>'product_id'=v_product::text GROUP BY x->>'product_id' HAVING count(*)>1) THEN
      RAISE EXCEPTION USING errcode='22023',message='duplicate product line';
    END IF;
    INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
    VALUES(v_org,p_source_warehouse_id,v_product,0) ON CONFLICT(warehouse_id,product_id) DO NOTHING;
    INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
    VALUES(v_org,p_destination_warehouse_id,v_product,0) ON CONFLICT(warehouse_id,product_id) DO NOTHING;
  END LOOP;

  PERFORM 1 FROM public.inventory_balances
  WHERE organization_id=v_org
    AND warehouse_id IN (p_source_warehouse_id,p_destination_warehouse_id)
    AND product_id IN (SELECT (value->>'product_id')::uuid FROM jsonb_array_elements(p_lines) value)
  ORDER BY warehouse_id,product_id
  FOR UPDATE;

  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    v_product:=(v_line->>'product_id')::uuid;
    v_qty:=(v_line->>'quantity')::integer;
    SELECT quantity INTO v_source FROM public.inventory_balances
    WHERE organization_id=v_org AND warehouse_id=p_source_warehouse_id AND product_id=v_product;
    IF coalesce(v_source,0)<v_qty THEN
      RAISE EXCEPTION USING errcode='22003',message='insufficient inventory for transfer';
    END IF;
    v_total:=v_total+v_qty;
  END LOOP;

  INSERT INTO public.inventory_transfers(organization_id,source_warehouse_id,destination_warehouse_id,status,idempotency_key,notes,created_by)
  VALUES(v_org,p_source_warehouse_id,p_destination_warehouse_id,'posted',v_key,v_notes,auth.uid()) RETURNING * INTO v_transfer;

  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    v_product:=(v_line->>'product_id')::uuid;
    v_qty:=(v_line->>'quantity')::integer;
    UPDATE public.inventory_balances SET quantity=quantity-v_qty,updated_at=now()
    WHERE organization_id=v_org AND warehouse_id=p_source_warehouse_id AND product_id=v_product;
    UPDATE public.inventory_balances SET quantity=quantity+v_qty,updated_at=now()
    WHERE organization_id=v_org AND warehouse_id=p_destination_warehouse_id AND product_id=v_product;
    INSERT INTO public.inventory_transfer_items(organization_id,transfer_id,product_id,quantity)
    VALUES(v_org,v_transfer.id,v_product,v_qty);
    INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id)
    VALUES(v_org,p_source_warehouse_id,v_product,-v_qty,'inventory_transfer',v_transfer.id,auth.uid()),
          (v_org,p_destination_warehouse_id,v_product,v_qty,'inventory_transfer',v_transfer.id,auth.uid());
  END LOOP;

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'inventory.transfer','inventory_transfer',v_transfer.id,'success',jsonb_build_object(
    'source_warehouse_id',p_source_warehouse_id,'destination_warehouse_id',p_destination_warehouse_id,'total_quantity',v_total
  ));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'inventory_transfer',v_transfer.id,'inventory.transferred',jsonb_build_object(
    'transfer_id',v_transfer.id,'source_warehouse_id',p_source_warehouse_id,'destination_warehouse_id',p_destination_warehouse_id,'total_quantity',v_total
  ));
  RETURN QUERY SELECT v_transfer.id,v_transfer.status,v_total;
END; $$;

GRANT EXECUTE ON FUNCTION public.transfer_inventory(uuid,uuid,text,jsonb,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.transfer_inventory(uuid,uuid,text,jsonb,text) FROM PUBLIC,anon;

-- Receiving is a durable domain event, not merely an inventory mutation.
CREATE OR REPLACE FUNCTION public.receive_purchase_order(
  p_purchase_order_id uuid,p_idempotency_key text,p_lines jsonb,p_notes text DEFAULT NULL
)
RETURNS TABLE(receipt_id uuid,receipt_number bigint,purchase_order_id uuid,purchase_order_status public.purchase_order_status,received_total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_key text:=trim(coalesce(p_idempotency_key,''));
  v_po public.purchase_orders%rowtype;
  v_receipt public.purchase_receipts%rowtype;
  v_existing public.purchase_receipts%rowtype;
  v_line jsonb;
  v_item public.purchase_order_items%rowtype;
  v_product uuid;
  v_qty integer;
  v_inventory integer;
  v_total numeric(18,2):=0;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501',message='receiving access required'; END IF;
  IF length(v_key)<16 OR length(v_key)>128 THEN RAISE EXCEPTION USING errcode='22023',message='invalid idempotency key'; END IF;
  IF p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines)=0 OR jsonb_array_length(p_lines)>100 THEN RAISE EXCEPTION USING errcode='22023',message='receipt lines required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':receipt:'||v_key,0));
  SELECT * INTO v_existing FROM public.purchase_receipts WHERE organization_id=v_org AND idempotency_key=v_key;
  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id,v_existing.receipt_number,v_existing.purchase_order_id,
      (SELECT po0.status FROM public.purchase_orders po0 WHERE po0.id=v_existing.purchase_order_id),
      coalesce((SELECT sum(pri.line_total) FROM public.purchase_receipt_items pri WHERE pri.organization_id=v_org AND pri.receipt_id=v_existing.id),0);
    RETURN;
  END IF;
  SELECT * INTO v_po FROM public.purchase_orders po0 WHERE po0.id=p_purchase_order_id AND po0.organization_id=v_org FOR UPDATE;
  IF NOT FOUND OR v_po.status NOT IN ('approved','partially_received') THEN RAISE EXCEPTION USING errcode='22023',message='purchase order is not receivable'; END IF;
  IF EXISTS(SELECT 1 FROM (SELECT value->>'purchase_order_item_id' AS item_id FROM jsonb_array_elements(p_lines)) x GROUP BY item_id HAVING count(*)>1) THEN RAISE EXCEPTION USING errcode='22023',message='duplicate receipt line'; END IF;
  INSERT INTO public.purchase_receipts(organization_id,purchase_order_id,warehouse_id,idempotency_key,received_by,notes)
  VALUES(v_org,v_po.id,v_po.warehouse_id,v_key,auth.uid(),nullif(trim(p_notes),'')) RETURNING * INTO v_receipt;
  FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
    BEGIN
      v_product:=(v_line->>'product_id')::uuid;
      v_qty:=(v_line->>'quantity')::integer;
    EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION USING errcode='22023',message='invalid receipt line';
    END;
    SELECT * INTO v_item FROM public.purchase_order_items poi
    WHERE poi.id=(v_line->>'purchase_order_item_id')::uuid AND poi.organization_id=v_org AND poi.purchase_order_id=v_po.id AND poi.product_id=v_product FOR UPDATE;
    IF NOT FOUND OR v_qty IS NULL OR v_qty<=0 OR v_qty>v_item.quantity_ordered-v_item.quantity_received THEN RAISE EXCEPTION USING errcode='22023',message='invalid receipt quantity'; END IF;
    INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity) VALUES(v_org,v_po.warehouse_id,v_product,0) ON CONFLICT(warehouse_id,product_id) DO NOTHING;
    SELECT ib.quantity INTO v_inventory FROM public.inventory_balances ib WHERE ib.organization_id=v_org AND ib.warehouse_id=v_po.warehouse_id AND ib.product_id=v_product FOR UPDATE;
    UPDATE public.inventory_balances ib SET quantity=v_inventory+v_qty,updated_at=now() WHERE ib.organization_id=v_org AND ib.warehouse_id=v_po.warehouse_id AND ib.product_id=v_product;
    UPDATE public.purchase_order_items poi SET quantity_received=quantity_received+v_qty WHERE poi.id=v_item.id;
    INSERT INTO public.purchase_receipt_items(organization_id,receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost) VALUES(v_org,v_receipt.id,v_item.id,v_product,v_qty,v_item.unit_cost);
    INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) VALUES(v_org,v_po.warehouse_id,v_product,v_qty,'purchase_receipt',v_receipt.id,auth.uid());
    v_total:=v_total+v_item.unit_cost*v_qty;
  END LOOP;
  UPDATE public.purchase_orders po0 SET status=(CASE WHEN NOT EXISTS(SELECT 1 FROM public.purchase_order_items poi WHERE poi.organization_id=v_org AND poi.purchase_order_id=v_po.id AND poi.quantity_received<poi.quantity_ordered) THEN 'received'::public.purchase_order_status ELSE 'partially_received'::public.purchase_order_status END),updated_at=now() WHERE po0.id=v_po.id;
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'purchase_receipt',v_receipt.id,'purchase.received',jsonb_build_object('purchase_order_id',v_po.id,'receipt_id',v_receipt.id,'total',v_total));
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'purchase.receipt','purchase_receipt',v_receipt.id,'success',jsonb_build_object('purchase_order_id',v_po.id,'total',v_total));
  RETURN QUERY SELECT v_receipt.id,v_receipt.receipt_number,v_po.id,
    (SELECT po1.status FROM public.purchase_orders po1 WHERE po1.id=v_po.id),v_total;
END; $$;

GRANT EXECUTE ON FUNCTION public.receive_purchase_order(uuid,text,jsonb,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.receive_purchase_order(uuid,text,jsonb,text) FROM PUBLIC,anon;
