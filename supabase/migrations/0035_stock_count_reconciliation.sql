-- Stock count / cycle-count reconciliation.
-- Counts never overwrite a balance blindly: completion locks the current balance,
-- computes the variance against the counted quantity, and records an auditable movement.

CREATE TYPE public.stock_count_status AS ENUM ('open','completed','cancelled');

-- The composite product reference is tenant-safe and requires a matching key.
-- Products already have a globally unique UUID, so this constraint is purely for the
-- composite tenant foreign key and does not change product identity semantics.
ALTER TABLE public.products ADD CONSTRAINT products_id_organization_key UNIQUE (id, organization_id);

CREATE TABLE public.stock_count_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  warehouse_id uuid NOT NULL,
  status public.stock_count_status NOT NULL DEFAULT 'open',
  idempotency_key text NOT NULL,
  started_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text,
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (id, organization_id),
  FOREIGN KEY (warehouse_id, organization_id) REFERENCES public.warehouses(id, organization_id) ON DELETE RESTRICT
);
CREATE INDEX stock_count_sessions_org_status_idx ON public.stock_count_sessions(organization_id,status,started_at DESC);
CREATE INDEX stock_count_sessions_warehouse_idx ON public.stock_count_sessions(organization_id,warehouse_id,started_at DESC);

CREATE TABLE public.stock_count_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  session_id uuid NOT NULL,
  product_id uuid NOT NULL,
  expected_quantity integer NOT NULL CHECK (expected_quantity >= 0),
  counted_quantity integer CHECK (counted_quantity IS NULL OR counted_quantity >= 0),
  completed_quantity integer,
  variance integer,
  counted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id,product_id),
  UNIQUE (id,organization_id),
  FOREIGN KEY (session_id,organization_id) REFERENCES public.stock_count_sessions(id,organization_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id,organization_id) REFERENCES public.products(id,organization_id) ON DELETE RESTRICT
);
CREATE INDEX stock_count_lines_session_idx ON public.stock_count_lines(organization_id,session_id,product_id);

ALTER TABLE public.stock_count_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_count_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY stock_count_sessions_staff_read ON public.stock_count_sessions FOR SELECT TO authenticated
  USING (organization_id=(select public.current_organization_id()) AND (select public.current_role()) IN ('owner','admin','warehouse'));
CREATE POLICY stock_count_lines_staff_read ON public.stock_count_lines FOR SELECT TO authenticated
  USING (organization_id=(select public.current_organization_id()) AND (select public.current_role()) IN ('owner','admin','warehouse'));

CREATE OR REPLACE FUNCTION public.start_stock_count(p_warehouse_id uuid,p_idempotency_key text,p_notes text DEFAULT NULL)
RETURNS public.stock_count_sessions LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_org uuid:=public.current_organization_id(); v_role public.user_role:=public.current_role(); v_session public.stock_count_sessions%rowtype; v_existing public.stock_count_sessions%rowtype;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501',message='stock count access required'; END IF;
  IF nullif(trim(p_idempotency_key),'') IS NULL THEN RAISE EXCEPTION USING errcode='22023',message='idempotency key required'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.warehouses WHERE id=p_warehouse_id AND organization_id=v_org AND is_active) THEN RAISE EXCEPTION USING errcode='P0002',message='warehouse not found'; END IF;
  SELECT * INTO v_existing FROM public.stock_count_sessions WHERE organization_id=v_org AND idempotency_key=trim(p_idempotency_key);
  IF FOUND THEN
    IF v_existing.warehouse_id <> p_warehouse_id THEN
      RAISE EXCEPTION USING errcode='23505',message='idempotency key is already bound to another warehouse';
    END IF;
    RETURN v_existing;
  END IF;
  IF EXISTS(SELECT 1 FROM public.stock_count_sessions WHERE organization_id=v_org AND warehouse_id=p_warehouse_id AND status='open') THEN
    RAISE EXCEPTION USING errcode='55006',message='an open stock count already exists for this warehouse';
  END IF;
  INSERT INTO public.stock_count_sessions(organization_id,warehouse_id,idempotency_key,started_by,notes)
  VALUES(v_org,p_warehouse_id,trim(p_idempotency_key),auth.uid(),nullif(trim(p_notes),'')) RETURNING * INTO v_session;
  INSERT INTO public.stock_count_lines(organization_id,session_id,product_id,expected_quantity)
  SELECT v_org,v_session.id,p.id,coalesce(b.quantity,0)
  FROM public.products p LEFT JOIN public.inventory_balances b
    ON b.organization_id=v_org AND b.warehouse_id=p_warehouse_id AND b.product_id=p.id
  WHERE p.organization_id=v_org AND p.status='active';
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'stock_count.start','stock_count',v_session.id,'success',jsonb_build_object('warehouse_id',p_warehouse_id,'line_count',(SELECT count(*) FROM public.stock_count_lines WHERE session_id=v_session.id)));
  RETURN v_session;
END; $$;

CREATE OR REPLACE FUNCTION public.set_stock_count_line(p_session_id uuid,p_product_id uuid,p_counted_quantity integer)
RETURNS public.stock_count_lines LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_org uuid:=public.current_organization_id(); v_role public.user_role:=public.current_role(); v_line public.stock_count_lines%rowtype;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501',message='stock count access required'; END IF;
  IF p_counted_quantity IS NULL OR p_counted_quantity<0 THEN RAISE EXCEPTION USING errcode='22023',message='counted quantity must be zero or greater'; END IF;
  UPDATE public.stock_count_lines l SET counted_quantity=p_counted_quantity,counted_at=now()
  FROM public.stock_count_sessions s
  WHERE l.session_id=p_session_id AND l.session_id=s.id AND l.organization_id=v_org AND s.organization_id=v_org AND s.status='open' AND l.product_id=p_product_id
  RETURNING l.* INTO v_line;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002',message='open stock count line not found'; END IF;
  RETURN v_line;
END; $$;

CREATE OR REPLACE FUNCTION public.complete_stock_count(p_session_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  v_org uuid:=public.current_organization_id(); v_role public.user_role:=public.current_role(); v_session public.stock_count_sessions%rowtype; v_line public.stock_count_lines%rowtype; v_balance public.inventory_balances%rowtype; v_variance integer; v_adjusted integer:=0;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','warehouse') THEN RAISE EXCEPTION USING errcode='42501',message='stock count access required'; END IF;
  SELECT * INTO v_session FROM public.stock_count_sessions WHERE id=p_session_id AND organization_id=v_org FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING errcode='P0002',message='stock count not found'; END IF;
  IF v_session.status='completed' THEN RETURN jsonb_build_object('status','completed','session_id',v_session.id,'adjusted_lines',(SELECT count(*) FROM public.stock_count_lines WHERE session_id=v_session.id AND coalesce(variance,0)<>0)); END IF;
  IF v_session.status<>'open' THEN RAISE EXCEPTION USING errcode='22023',message='stock count is not open'; END IF;
  IF EXISTS(SELECT 1 FROM public.stock_count_lines WHERE session_id=v_session.id AND counted_quantity IS NULL) THEN RAISE EXCEPTION USING errcode='22023',message='all stock count lines must be counted before completion'; END IF;
  FOR v_line IN SELECT * FROM public.stock_count_lines WHERE organization_id=v_org AND session_id=v_session.id ORDER BY product_id FOR UPDATE LOOP
    SELECT * INTO v_balance FROM public.inventory_balances WHERE organization_id=v_org AND warehouse_id=v_session.warehouse_id AND product_id=v_line.product_id FOR UPDATE;
    IF NOT FOUND THEN
      INSERT INTO public.inventory_balances(organization_id,warehouse_id,product_id,quantity) VALUES(v_org,v_session.warehouse_id,v_line.product_id,0) RETURNING * INTO v_balance;
    END IF;
    v_variance:=v_line.counted_quantity-v_balance.quantity;
    IF v_variance<>0 THEN
      UPDATE public.inventory_balances SET quantity=v_line.counted_quantity,updated_at=now() WHERE warehouse_id=v_session.warehouse_id AND product_id=v_line.product_id AND organization_id=v_org;
      INSERT INTO public.inventory_movements(organization_id,warehouse_id,product_id,delta,source_type,source_id,actor_id)
      VALUES(v_org,v_session.warehouse_id,v_line.product_id,v_variance,'stock_count',v_session.id,auth.uid());
      v_adjusted:=v_adjusted+1;
    END IF;
    UPDATE public.stock_count_lines SET completed_quantity=v_line.counted_quantity,variance=v_variance WHERE id=v_line.id;
  END LOOP;
  UPDATE public.stock_count_sessions SET status='completed',completed_at=now() WHERE id=v_session.id;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'stock_count.complete','stock_count',v_session.id,'success',jsonb_build_object('warehouse_id',v_session.warehouse_id,'adjusted_lines',v_adjusted));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'stock_count',v_session.id,'stock_count.completed',jsonb_build_object('session_id',v_session.id,'warehouse_id',v_session.warehouse_id,'adjusted_lines',v_adjusted));
  RETURN jsonb_build_object('status','completed','session_id',v_session.id,'adjusted_lines',v_adjusted);
END; $$;

REVOKE ALL ON FUNCTION public.start_stock_count(uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_stock_count_line(uuid,uuid,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_stock_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_stock_count(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_stock_count_line(uuid,uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_stock_count(uuid) TO authenticated;