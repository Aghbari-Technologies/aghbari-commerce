-- Closure repairs discovered by exact clean-source pgTAP replay.
-- This migration intentionally changes runtime behavior only where the clean replay
-- proves a real contract defect. No production schema is touched by this branch.

DO $$
DECLARE
  v_def text;
BEGIN
  -- PostgreSQL numeric has no isfinite(numeric); NaN is the only special value
  -- relevant to this contract and is rejected explicitly.
  SELECT pg_get_functiondef('public.create_purchase_order(uuid,uuid,text,jsonb,text,text)'::regprocedure)
    INTO v_def;
  v_def := replace(v_def, 'not isfinite(qty)', '(qty::text <> ''NaN'')');
  v_def := replace(v_def, 'not isfinite(cost)', '(cost::text <> ''NaN'')');
  EXECUTE v_def;
END
$$;

-- SECURITY DEFINER functions are pinned to an empty search_path where their
-- bodies are fully schema-qualified. This avoids mutable-path object capture.
ALTER FUNCTION public.create_order(text,uuid,jsonb) SET search_path='';
ALTER FUNCTION public.record_payment(uuid,numeric,public.payment_method,uuid,text) SET search_path='';
ALTER FUNCTION public.record_expense(uuid,uuid,text,numeric,text,text,date) SET search_path='';
ALTER FUNCTION public.create_purchase_order(uuid,uuid,text,jsonb,text,text) SET search_path='';
ALTER FUNCTION public.receive_purchase_order(uuid,text,jsonb,text) SET search_path='';

-- The order command must qualify the products.status column because the
-- function exposes a return-column named status in the same PL/pgSQL scope.
DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef('public.create_order(text,uuid,jsonb)'::regprocedure)
    INTO v_def;
  v_def := replace(v_def,
    'where id=v_product and organization_id=v_org and status=''active''',
    'where p.id=v_product and p.organization_id=v_org and p.status=''active''');
  v_def := replace(v_def,
    'from public.products where id=v_product and organization_id=v_org and status=''active''',
    'from public.products p where p.id=v_product and p.organization_id=v_org and p.status=''active''');
  EXECUTE v_def;
END
$$;

-- Direct object replacement is not an application capability. Storage INSERT,
-- SELECT and DELETE remain policy-controlled; UPDATE is explicitly unavailable
-- to authenticated clients.
REVOKE UPDATE ON TABLE storage.objects FROM authenticated;
REVOKE UPDATE ON TABLE storage.objects FROM anon;
