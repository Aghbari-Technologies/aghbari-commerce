-- Same-key purchase receipt requests must be payload-identical; never silently accept a changed payload.
CREATE OR REPLACE FUNCTION public.receive_purchase_order(p_purchase_order_id uuid,p_idempotency_key text,p_lines jsonb,p_notes text DEFAULT NULL)
RETURNS TABLE(receipt_id uuid,receipt_number bigint,purchase_order_id uuid,purchase_order_status public.purchase_order_status,received_total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o uuid:=public.current_organization_id(); r public.user_role:=public.current_role(); po public.purchase_orders%rowtype; rec public.purchase_receipts%rowtype; existing public.purchase_receipts%rowtype; l jsonb; item public.purchase_order_items%rowtype; pid uuid; q integer; inv integer; total numeric:=0; key text:=trim(coalesce(p_idempotency_key,'')); existing_count integer;
BEGIN
 IF o IS NULL OR r NOT IN ('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501',message='receiving access required'; END IF;
 IF p_purchase_order_id IS NULL OR length(key)<16 OR length(key)>128 OR p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines)=0 OR jsonb_array_length(p_lines)>100 THEN RAISE EXCEPTION USING errcode='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(o::text||':receipt:'||key,0));
 SELECT * INTO existing FROM public.purchase_receipts WHERE organization_id=o AND idempotency_key=key;
 IF FOUND THEN
   IF existing.purchase_order_id<>p_purchase_order_id OR coalesce(existing.notes,'')<>coalesce(nullif(trim(p_notes),''),'') THEN RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict'; END IF;
   SELECT count(*) INTO existing_count FROM public.purchase_receipt_items pri WHERE pri.organization_id=o AND pri.receipt_id=existing.id;
   IF existing_count<>jsonb_array_length(p_lines) THEN RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict'; END IF;
   IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_lines) x WHERE NOT EXISTS (SELECT 1 FROM public.purchase_receipt_items pri WHERE pri.organization_id=o AND pri.receipt_id=existing.id AND pri.purchase_order_item_id=(x->>'purchase_order_item_id')::uuid AND pri.product_id=(x->>'product_id')::uuid AND pri.quantity_received=(x->>'quantity')::integer)) THEN RAISE EXCEPTION USING errcode='40001',message='idempotency key payload conflict'; END IF;
   SELECT * INTO po FROM public.purchase_orders WHERE id=existing.purchase_order_id AND organization_id=o;
   SELECT coalesce(sum(line_total),0) INTO total FROM public.purchase_receipt_items WHERE organization_id=o AND receipt_id=existing.id;
   RETURN QUERY SELECT existing.id,existing.receipt_number,existing.purchase_order_id,po.status,total; RETURN;
 END IF;
 SELECT * INTO po FROM public.purchase_orders po0 WHERE po0.id=p_purchase_order_id AND po0.organization_id=o FOR UPDATE;
 IF NOT FOUND OR po.status NOT IN ('approved','partially_received') THEN RAISE EXCEPTION USING errcode='22023',message='purchase order is not receivable'; END IF;
 INSERT INTO public.purchase_receipts(organization_id,purchase_order_id,warehouse_id,idempotency_key,received_by,notes) VALUES(o,po.id,po.warehouse_id,key,auth.uid(),nullif(trim(p_notes),'')) RETURNING * INTO rec;
 FOR l IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
   BEGIN pid:=(l->>'product_id')::uuid; q:=(l->>'quantity')::integer; EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN RAISE EXCEPTION USING errcode='22023',message='invalid receipt line'; END;
   SELECT * INTO item FROM public.purchase_order_items poi WHERE poi.id=(l->>'purchase_order_item_id')::uuid AND poi.organization_id=o AND poi.purchase_order_id=po.id AND poi.product_id=pid FOR UPDATE;
   IF NOT FOUND OR q IS NULL OR q<=0 OR q>item.quantity_ordered-item.quantity_received THEN RAISE EXCEPTION USING errcode='22023'; END IF;
   INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity) VALUES(o,po.warehouse_id,pid,0) ON CONFLICT(warehouse_id,product_id) DO NOTHING;
   SELECT ib.quantity INTO inv FROM public.inventory_balances ib WHERE ib.organization_id=o AND ib.warehouse_id=po.warehouse_id AND ib.product_id=pid FOR UPDATE;
   UPDATE public.inventory_balances ib SET quantity=coalesce(inv,0)+q,updated_at=now() WHERE ib.organization_id=o AND ib.warehouse_id=po.warehouse_id AND ib.product_id=pid;
   UPDATE public.purchase_order_items poi SET quantity_received=quantity_received+q WHERE poi.id=item.id;
   INSERT INTO public.purchase_receipt_items(organization_id,receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost) VALUES(o,rec.id,item.id,pid,q,item.unit_cost);
   INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id) VALUES(o,po.warehouse_id,pid,q,'purchase_receipt',rec.id,auth.uid());
   total:=total+item.unit_cost*q;
 END LOOP;
 UPDATE public.purchase_orders po0 SET status=(CASE WHEN NOT EXISTS(SELECT 1 FROM public.purchase_order_items poi WHERE poi.organization_id=o AND poi.purchase_order_id=po.id AND poi.quantity_received<poi.quantity_ordered) THEN 'received'::public.purchase_order_status ELSE 'partially_received'::public.purchase_order_status END),updated_at=now() WHERE po0.id=po.id;
 SELECT * INTO po FROM public.purchase_orders WHERE id=po.id;
 INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata) VALUES(o,auth.uid(),'purchase.received','purchase_receipt',rec.id,'success',jsonb_build_object('purchase_order_id',po.id,'received_total',total));
 INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload) VALUES(o,'purchase_receipt',rec.id,'purchase.received',jsonb_build_object('receipt_id',rec.id,'purchase_order_id',po.id,'received_total',total));
 RETURN QUERY SELECT rec.id,rec.receipt_number,po.id,po.status,total;
END; $$;
