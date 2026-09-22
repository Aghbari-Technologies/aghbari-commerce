
CREATE OR REPLACE FUNCTION public.create_supplier_bill(
  p_supplier_id uuid,
  p_bill_number text,
  p_total numeric,
  p_currency text DEFAULT 'YER',
  p_due_at timestamptz DEFAULT NULL,
  p_purchase_order_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS public.supplier_bills
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_key text := trim(coalesce(p_idempotency_key,''));
  v_currency text := upper(trim(coalesce(p_currency,'')));
  v_bill public.supplier_bills%rowtype;
  v_existing_key_bill public.supplier_bills%rowtype;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION USING errcode='42501', message='supplier bill access required';
  END IF;
  IF p_supplier_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.suppliers s
    WHERE s.id=p_supplier_id AND s.organization_id=v_org AND s.is_active
  ) THEN
    RAISE EXCEPTION USING errcode='P0002', message='supplier not found';
  END IF;
  IF nullif(trim(coalesce(p_bill_number,'')),'') IS NULL OR length(trim(p_bill_number)) > 100 THEN
    RAISE EXCEPTION USING errcode='22023', message='supplier bill number required';
  END IF;
  IF p_total IS NULL OR p_total <= 0 OR p_total > 99999999999999.99 THEN
    RAISE EXCEPTION USING errcode='22023', message='supplier bill total must be positive';
  END IF;
  IF length(v_currency) <> 3 THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid currency';
  END IF;
  IF length(v_key) < 16 OR length(v_key) > 128 THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid idempotency key';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':supplier-bill:'||v_key,0));

  SELECT b.* INTO v_existing_key_bill
  FROM public.supplier_ledger_entries e
  JOIN public.supplier_bills b ON b.id=e.supplier_bill_id AND b.organization_id=e.organization_id
  WHERE e.organization_id=v_org AND e.idempotency_key=v_key
  LIMIT 1;

  IF FOUND THEN
    IF v_existing_key_bill.supplier_id<>p_supplier_id
       OR v_existing_key_bill.bill_number<>trim(p_bill_number)
       OR v_existing_key_bill.total<>round(p_total,2)
       OR v_existing_key_bill.currency<>v_currency
       OR coalesce(v_existing_key_bill.purchase_order_id,'00000000-0000-0000-0000-000000000000')<>coalesce(p_purchase_order_id,'00000000-0000-0000-0000-000000000000') THEN
      RAISE EXCEPTION USING errcode='40001', message='supplier bill idempotency payload conflict';
    END IF;
    RETURN v_existing_key_bill;
  END IF;

  SELECT * INTO v_bill
  FROM public.supplier_bills
  WHERE organization_id=v_org AND supplier_id=p_supplier_id AND bill_number=trim(p_bill_number);

  IF FOUND THEN
    IF v_bill.currency<>v_currency OR v_bill.total<>round(p_total,2)
       OR coalesce(v_bill.purchase_order_id,'00000000-0000-0000-0000-000000000000')<>coalesce(p_purchase_order_id,'00000000-0000-0000-0000-000000000000') THEN
      RAISE EXCEPTION USING errcode='40001', message='supplier bill payload conflict';
    END IF;
    RETURN v_bill;
  END IF;

  IF p_purchase_order_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.purchase_orders po
    WHERE po.id=p_purchase_order_id AND po.organization_id=v_org AND po.supplier_id=p_supplier_id AND po.status<>'cancelled'
  ) THEN
    RAISE EXCEPTION USING errcode='P0002', message='purchase order not found for supplier bill';
  END IF;

  INSERT INTO public.supplier_bills(
    organization_id,supplier_id,purchase_order_id,bill_number,status,currency,subtotal,total,due_at,notes,created_by
  )
  VALUES(
    v_org,p_supplier_id,p_purchase_order_id,trim(p_bill_number),'issued',v_currency,round(p_total,2),round(p_total,2),p_due_at,
    nullif(trim(p_notes),''),auth.uid()
  ) RETURNING * INTO v_bill;

  INSERT INTO public.supplier_ledger_entries(
    organization_id,supplier_id,supplier_bill_id,reference,description,debit,credit,currency,due_date,entry_status,source_type,source_id,idempotency_key,actor_id
  )
  VALUES(
    v_org,p_supplier_id,v_bill.id,v_bill.bill_number,'فاتورة مورد '||v_bill.bill_number,0,v_bill.total,v_currency,p_due_at::date,
    'posted','supplier_bill',v_bill.id,v_key,auth.uid()
  );

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'supplier_bill.create','supplier_bill',v_bill.id,'success',
    jsonb_build_object('supplier_id',p_supplier_id,'total',v_bill.total,'currency',v_currency,'bill_number',v_bill.bill_number));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'supplier_bill',v_bill.id,'supplier_bill.issued',
    jsonb_build_object('supplier_bill_id',v_bill.id,'bill_number',v_bill.bill_number,'total',v_bill.total));
  RETURN v_bill;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) TO authenticated;
