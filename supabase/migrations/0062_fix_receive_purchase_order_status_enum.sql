-- Fix real runtime defect: CASE branches in receive_purchase_order were
-- inferred as text when assigning the purchase_order_status enum column.
CREATE OR REPLACE FUNCTION public.receive_purchase_order(p_purchase_order_id uuid,p_idempotency_key text,p_lines jsonb,p_notes text DEFAULT NULL)
RETURNS TABLE(receipt_id uuid,receipt_number bigint,purchase_order_id uuid,purchase_order_status public.purchase_order_status,received_total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; rec public.purchase_receipts%rowtype; l jsonb; item public.purchase_order_items%rowtype; pid uuid; q int; inv int; total numeric:=0;
BEGIN
 IF o IS NULL OR r NOT IN('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501'; END IF;
 SELECT * INTO po FROM public.purchase_orders po0 WHERE po0.id=p_purchase_order_id AND po0.organization_id=o FOR UPDATE;
 IF NOT FOUND OR po.status NOT IN('approved','partially_received') THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 INSERT INTO public.purchase_receipts(organization_id,purchase_order_id,warehouse_id,idempotency_key,received_by,notes) VALUES(o,po.id,po.warehouse_id,trim(p_idempotency_key),auth.uid(),nullif(trim(p_notes),'')) RETURNING * INTO rec;
 FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
  pid:=(l->>'product_id')::uuid; q:=(l->>'quantity')::integer;
  SELECT * INTO item FROM public.purchase_order_items poi WHERE poi.id=(l->>'purchase_order_item_id')::uuid AND poi.organization_id=o AND poi.purchase_order_id=po.id AND poi.product_id=pid FOR UPDATE;
  IF NOT FOUND OR q<=0 OR q>item.quantity_ordered-item.quantity_received THEN RAISE EXCEPTION USING errcode='22023'; END IF;
  INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity) VALUES(o,po.warehouse_id,pid,0) ON CONFLICT(warehouse_id,product_id) DO NOTHING;
  SELECT ib.quantity INTO inv FROM public.inventory_balances ib WHERE ib.warehouse_id=po.warehouse_id AND ib.product_id=pid FOR UPDATE;
  UPDATE public.inventory_balances ib SET quantity=inv+q,updated_at=now() WHERE ib.warehouse_id=po.warehouse_id AND ib.product_id=pid;
  UPDATE public.purchase_order_items poi SET quantity_received=quantity_received+q WHERE poi.id=item.id;
  INSERT INTO public.purchase_receipt_items(organization_id,receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost) VALUES(o,rec.id,item.id,pid,q,item.unit_cost);
  INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) VALUES(o,po.warehouse_id,pid,q,'purchase_receipt',rec.id,auth.uid());
  total:=total+item.unit_cost*q;
 END LOOP;
 UPDATE public.purchase_orders po0 SET status=(CASE WHEN NOT EXISTS(SELECT 1 FROM public.purchase_order_items poi WHERE poi.organization_id=o AND poi.purchase_order_id=po.id AND poi.quantity_received<poi.quantity_ordered) THEN 'received'::public.purchase_order_status ELSE 'partially_received'::public.purchase_order_status END),updated_at=now() WHERE po0.id=po.id;
 RETURN QUERY SELECT rec.id,rec.receipt_number,po.id,(SELECT po1.status FROM public.purchase_orders po1 WHERE po1.id=po.id),total;
END $$;
