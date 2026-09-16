-- Final runtime contract closure after exact clean replay.
-- Restores the canonical product-media registration RPC if live drift removed it,
-- removes the invalid isfinite(numeric) call from finance validation, and pins all
-- affected SECURITY DEFINER functions to an empty search_path.

ALTER FUNCTION public.get_catalog(text,uuid,integer,integer,uuid) SET search_path='';
ALTER FUNCTION public.stage_product_import(text,text,jsonb) SET search_path='';
ALTER FUNCTION public.commit_product_import(uuid,uuid) SET search_path='';
ALTER FUNCTION public.current_organization_id() SET search_path='';
ALTER FUNCTION public.current_customer_id() SET search_path='';
ALTER FUNCTION public.current_role() SET search_path='';

CREATE OR REPLACE FUNCTION public.record_expense(
  p_branch_id uuid,
  p_cash_account_id uuid,
  p_category text,
  p_amount numeric,
  p_currency text DEFAULT 'YER',
  p_description text DEFAULT NULL,
  p_expense_date date DEFAULT current_date
)
RETURNS public.expenses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_account public.cash_accounts%rowtype;
  v_expense public.expenses%rowtype;
  v_balance numeric;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION USING errcode='42501',message='expense access required';
  END IF;
  IF nullif(trim(p_category),'') IS NULL OR length(trim(p_category))>200
     OR p_amount IS NULL OR p_amount::text IN ('NaN','Infinity','-Infinity')
     OR p_amount<=0 OR p_amount>9007199254740991 THEN
    RAISE EXCEPTION USING errcode='22023',message='expense category and positive amount are required';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.branches b WHERE b.id=p_branch_id AND b.organization_id=v_org AND b.is_active) THEN
    RAISE EXCEPTION USING errcode='P0002',message='branch not found';
  END IF;
  SELECT * INTO v_account
  FROM public.cash_accounts a
  WHERE a.id=p_cash_account_id AND a.organization_id=v_org AND a.is_active
  FOR UPDATE;
  IF NOT FOUND OR v_account.currency<>upper(trim(coalesce(p_currency,''))) THEN
    RAISE EXCEPTION USING errcode='22023',message='cash account currency mismatch';
  END IF;
  IF p_description IS NOT NULL AND length(p_description)>2000 THEN
    RAISE EXCEPTION USING errcode='22023',message='expense description too long';
  END IF;
  SELECT a.opening_balance+coalesce(sum(CASE WHEN t.direction='in' THEN t.amount ELSE -t.amount END),0)
    INTO v_balance
  FROM public.cash_accounts a
  LEFT JOIN public.cash_transactions t
    ON t.organization_id=v_org AND t.cash_account_id=a.id
  WHERE a.id=v_account.id AND a.organization_id=v_org
  GROUP BY a.id,a.opening_balance;
  IF coalesce(v_balance,0)<p_amount THEN
    RAISE EXCEPTION USING errcode='22003',message='expense exceeds available cash balance';
  END IF;
  INSERT INTO public.expenses(organization_id,branch_id,cash_account_id,category,amount,currency,description,expense_date,actor_id)
  VALUES(v_org,p_branch_id,p_cash_account_id,trim(p_category),p_amount,upper(trim(p_currency)),nullif(trim(p_description),''),coalesce(p_expense_date,current_date),auth.uid())
  RETURNING * INTO v_expense;
  INSERT INTO public.cash_transactions(organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id)
  VALUES(v_org,p_cash_account_id,'out',p_amount,'expense',v_expense.id,v_expense.category,auth.uid());
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'expense.create','expense',v_expense.id,'success',jsonb_build_object('amount',p_amount,'category',v_expense.category));
  INSERT INTO public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  VALUES(v_org,'expense',v_expense.id,'expense.posted',jsonb_build_object('expense_id',v_expense.id,'amount',p_amount));
  RETURN v_expense;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_product_media(
  p_product_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_byte_size bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_org uuid:=public.current_organization_id();
  v_role public.user_role:=public.current_role();
  v_media_id uuid;
  v_object storage.objects%rowtype;
  v_object_mime text;
  v_object_size bigint;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','sales') THEN
    RAISE EXCEPTION USING errcode='42501',message='product media registration access required';
  END IF;
  IF p_product_id IS NULL OR p_storage_path IS NULL
     OR p_storage_path !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$' THEN
    RAISE EXCEPTION USING errcode='22023',message='invalid product media path';
  END IF;
  IF split_part(p_storage_path,'/',1)::uuid<>v_org OR split_part(p_storage_path,'/',2)::uuid<>p_product_id THEN
    RAISE EXCEPTION USING errcode='42501',message='product media tenant binding failed';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.products p WHERE p.id=p_product_id AND p.organization_id=v_org) THEN
    RAISE EXCEPTION USING errcode='P0002',message='product not found';
  END IF;
  IF lower(coalesce(p_mime_type,''))<>'image/webp' THEN
    RAISE EXCEPTION USING errcode='22023',message='product images must be WebP';
  END IF;
  IF p_width IS NULL OR p_height IS NULL OR p_width<1 OR p_height<1 OR p_width>4096 OR p_height>4096 THEN
    RAISE EXCEPTION USING errcode='22023',message='invalid product image dimensions';
  END IF;
  IF p_byte_size IS NULL OR p_byte_size<1 OR p_byte_size>5*1024*1024 THEN
    RAISE EXCEPTION USING errcode='22023',message='product image size must be between 1 byte and 5 MB';
  END IF;
  SELECT * INTO v_object FROM storage.objects WHERE bucket_id='product-media' AND name=p_storage_path;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode='P0002',message='uploaded product media not found';
  END IF;
  v_object_mime:=lower(coalesce(v_object.metadata->>'mimetype',''));
  v_object_size:=nullif(v_object.metadata->>'size','')::bigint;
  IF v_object_mime<>'image/webp' OR v_object_size IS NULL OR v_object_size<>p_byte_size THEN
    RAISE EXCEPTION USING errcode='22023',message='uploaded product media metadata mismatch';
  END IF;
  IF v_object.owner_id IS NOT NULL AND v_object.owner_id<>auth.uid()::text THEN
    RAISE EXCEPTION USING errcode='42501',message='product media owner mismatch';
  END IF;
  INSERT INTO public.product_media(organization_id,product_id,storage_path,mime_type,width,height,byte_size,sort_order)
  VALUES(v_org,p_product_id,p_storage_path,'image/webp',p_width,p_height,p_byte_size,
    COALESCE((SELECT max(sort_order)+1 FROM public.product_media WHERE organization_id=v_org AND product_id=p_product_id),0))
  RETURNING id INTO v_media_id;
  INSERT INTO public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  VALUES(v_org,auth.uid(),'product-media.register','product_media',v_media_id,'success',jsonb_build_object('product_id',p_product_id,'mime_type','image/webp','bytes',p_byte_size));
  RETURN v_media_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_product_media(uuid,text,text,integer,integer,bigint) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.register_product_media(uuid,text,text,integer,integer,bigint) FROM anon,public;

COMMENT ON FUNCTION public.register_product_media(uuid,text,text,integer,integer,bigint) IS 'Registers tenant-owned WebP product media using a strict organization/product/object UUID path contract.';
