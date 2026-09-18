begin;

select plan(16);

-- Exposed SECURITY DEFINER functions must pin search_path to the safe value declared by the implementation.
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.adjust_inventory(uuid,uuid,integer,text)'::regprocedure), true, 'adjust_inventory pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.create_order(text,uuid,jsonb)'::regprocedure), true, 'create_order pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.get_catalog(text,uuid,integer,integer,uuid)'::regprocedure), true, 'get_catalog pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.stage_product_import(text,text,jsonb)'::regprocedure), true, 'stage_product_import pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.commit_product_import(uuid,uuid)'::regprocedure), true, 'commit_product_import pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.set_product_price(uuid,customer_tier,numeric,text)'::regprocedure), true, 'set_product_price pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.transfer_inventory(uuid,uuid,text,jsonb,text)'::regprocedure), true, 'transfer_inventory pins search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.receive_purchase_order(uuid,text,jsonb,text)'::regprocedure), true, 'receive_purchase_order pins search_path');

-- The application boundary must remain SECURITY DEFINER for the RPCs that
-- cross RLS-controlled tables and enforce their own tenant/role guards.
select is((select prosecdef from pg_proc where oid='public.adjust_inventory(uuid,uuid,integer,text)'::regprocedure), true, 'adjust_inventory remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.create_order(text,uuid,jsonb)'::regprocedure), true, 'create_order remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.get_catalog(text,uuid,integer,integer,uuid)'::regprocedure), true, 'get_catalog remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.stage_product_import(text,text,jsonb)'::regprocedure), true, 'stage_product_import remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.commit_product_import(uuid,uuid)'::regprocedure), true, 'commit_product_import remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.set_product_price(uuid,customer_tier,numeric,text)'::regprocedure), true, 'set_product_price remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.transfer_inventory(uuid,uuid,text,jsonb,text)'::regprocedure), true, 'transfer_inventory remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.receive_purchase_order(uuid,text,jsonb,text)'::regprocedure), true, 'receive_purchase_order remains SECURITY DEFINER');

select * from finish();
rollback;
