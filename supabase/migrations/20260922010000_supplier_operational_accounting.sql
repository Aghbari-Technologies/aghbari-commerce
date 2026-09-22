
CREATE TABLE public.supplier_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  supplier_id uuid NOT NULL,
  purchase_order_id uuid,
  bill_number text NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'issued',
  currency text NOT NULL DEFAULT 'YER' CHECK (length(trim(currency)) = 3),
  subtotal numeric(18,2) NOT NULL CHECK (subtotal >= 0),
  total numeric(18,2) NOT NULL CHECK (total > 0),
  due_at timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, supplier_id, bill_number),
  UNIQUE (id, organization_id),
  FOREIGN KEY (supplier_id, organization_id) REFERENCES public.suppliers(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (purchase_order_id, organization_id) REFERENCES public.purchase_orders(id, organization_id) ON DELETE RESTRICT
);
CREATE INDEX supplier_bills_supplier_time_idx ON public.supplier_bills(organization_id, supplier_id, created_at DESC);
CREATE INDEX supplier_bills_status_due_idx ON public.supplier_bills(organization_id, status, due_at);
ALTER TABLE public.supplier_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY supplier_bills_staff_read ON public.supplier_bills FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff());

CREATE TABLE public.supplier_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  supplier_id uuid NOT NULL,
  supplier_bill_id uuid,
  reference text,
  description text NOT NULL,
  debit numeric(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit numeric(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  currency text NOT NULL DEFAULT 'YER' CHECK (length(trim(currency)) = 3),
  due_date date,
  entry_status text NOT NULL DEFAULT 'posted' CHECK (entry_status IN ('posted','void')),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (id, organization_id),
  FOREIGN KEY (supplier_id, organization_id) REFERENCES public.suppliers(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_bill_id, organization_id) REFERENCES public.supplier_bills(id, organization_id) ON DELETE RESTRICT,
  CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);
CREATE INDEX supplier_ledger_supplier_time_idx ON public.supplier_ledger_entries(organization_id, supplier_id, created_at DESC);
CREATE INDEX supplier_ledger_bill_time_idx ON public.supplier_ledger_entries(organization_id, supplier_bill_id, created_at DESC);
CREATE INDEX supplier_ledger_source_idx ON public.supplier_ledger_entries(organization_id, source_type, source_id);
ALTER TABLE public.supplier_ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY supplier_ledger_staff_read ON public.supplier_ledger_entries FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff());

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

  SELECT * INTO v_bill FROM public.supplier_bills
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
    'posted','supplier_bill',v_bill.id,v_key||':bill',auth.uid()
  );

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'supplier_bill.create','supplier_bill',v_bill.id,'success',
    jsonb_build_object('supplier_id',p_supplier_id,'total',v_bill.total,'currency',v_currency,'bill_number',v_bill.bill_number));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'supplier_bill',v_bill.id,'supplier_bill.issued',
    jsonb_build_object('supplier_bill_id',v_bill.id,'bill_number',v_bill.bill_number,'total',v_bill.total));
  RETURN v_bill;
EXCEPTION WHEN unique_violation THEN
  SELECT * INTO v_bill FROM public.supplier_bills WHERE organization_id=v_org AND supplier_id=p_supplier_id AND bill_number=trim(p_bill_number);
  IF FOUND THEN RETURN v_bill; END IF;
  RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_supplier_payment(
  p_supplier_bill_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_cash_account_id uuid DEFAULT NULL,
  p_reference text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS public.supplier_ledger_entries
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_key text := trim(coalesce(p_idempotency_key,''));
  v_bill public.supplier_bills%rowtype;
  v_account public.cash_accounts%rowtype;
  v_paid numeric(18,2);
  v_entry public.supplier_ledger_entries%rowtype;
  v_source uuid := gen_random_uuid();
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION USING errcode='42501', message='supplier payment access required';
  END IF;
  IF length(v_key)<16 OR length(v_key)>128 THEN
    RAISE EXCEPTION USING errcode='22023', message='invalid idempotency key';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text||':supplier-payment:'||v_key,0));
  SELECT * INTO v_entry FROM public.supplier_ledger_entries WHERE organization_id=v_org AND idempotency_key=v_key;
  IF FOUND THEN RETURN v_entry; END IF;
  IF p_amount IS NULL OR p_amount<=0 THEN RAISE EXCEPTION USING errcode='22023', message='supplier payment amount must be positive'; END IF;

  SELECT * INTO v_bill FROM public.supplier_bills WHERE id=p_supplier_bill_id AND organization_id=v_org FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002', message='supplier bill not found'; END IF;
  IF v_bill.status='void' THEN RAISE EXCEPTION USING errcode='22023', message='void supplier bill cannot be paid'; END IF;

  SELECT coalesce(sum(e.debit),0) INTO v_paid
  FROM public.supplier_ledger_entries e
  WHERE e.organization_id=v_org AND e.supplier_bill_id=v_bill.id AND e.entry_status='posted';
  IF p_amount > v_bill.total-v_paid THEN RAISE EXCEPTION USING errcode='22003', message='supplier payment exceeds bill balance'; END IF;

  IF p_method='cash' AND p_cash_account_id IS NULL THEN
    RAISE EXCEPTION USING errcode='22023', message='cash account required for cash payment';
  END IF;
  IF p_cash_account_id IS NOT NULL THEN
    SELECT * INTO v_account FROM public.cash_accounts WHERE id=p_cash_account_id AND organization_id=v_org AND is_active FOR UPDATE;
    IF NOT FOUND OR v_account.currency<>v_bill.currency THEN RAISE EXCEPTION USING errcode='22023', message='cash account currency mismatch'; END IF;
  END IF;

  INSERT INTO public.supplier_ledger_entries(
    organization_id,supplier_id,supplier_bill_id,reference,description,debit,credit,currency,due_date,entry_status,source_type,source_id,idempotency_key,actor_id
  )
  VALUES(
    v_org,v_bill.supplier_id,v_bill.id,nullif(trim(p_reference),''),'سداد فاتورة المورد '||v_bill.bill_number,
    round(p_amount,2),0,v_bill.currency,NULL,'posted','supplier_payment',v_source,v_key,auth.uid()
  ) RETURNING * INTO v_entry;

  IF p_cash_account_id IS NOT NULL THEN
    INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id)
    VALUES(v_org,p_cash_account_id,'out',round(p_amount,2),'supplier_payment',v_entry.id,nullif(trim(p_reference),''),auth.uid());
  END IF;

  SELECT coalesce(sum(e.debit),0) INTO v_paid
  FROM public.supplier_ledger_entries e
  WHERE e.organization_id=v_org AND e.supplier_bill_id=v_bill.id AND e.entry_status='posted';

  UPDATE public.supplier_bills
  SET status=CASE WHEN v_paid>=total THEN 'paid' ELSE 'partially_paid' END,updated_at=now()
  WHERE id=v_bill.id;

  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'supplier_payment.create','supplier_ledger_entry',v_entry.id,'success',
    jsonb_build_object('supplier_bill_id',v_bill.id,'amount',p_amount,'method',p_method));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'supplier_bill',v_bill.id,'supplier.payment.recorded',
    jsonb_build_object('supplier_bill_id',v_bill.id,'supplier_payment_id',v_entry.id,'amount',p_amount));
  RETURN v_entry;
END;
$$;

REVOKE ALL ON FUNCTION public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_supplier_payment(uuid,numeric,public.payment_method,uuid,text,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_supplier_payment(uuid,numeric,public.payment_method,uuid,text,text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_supplier_payment(uuid,numeric,public.payment_method,uuid,text,text) TO authenticated;
