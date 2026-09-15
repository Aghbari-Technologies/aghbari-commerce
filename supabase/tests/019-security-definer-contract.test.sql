begin;

select plan(12);

-- Final SECURITY DEFINER contract: explicit search_path pinning plus
-- SECURITY DEFINER for these six high-value application entrypoints.
select is((select proconfig @> array['search_path=public'] from pg_proc where oid='public.adjust_inventory(uuid,uuid,integer,text)'::regprocedure), false, 'adjust_inventory retains empty search_path hardening');
select is((select proconfig @> array['search_path=public'] from pg_proc where oid='public.create_order(text,uuid,jsonb)'::regprocedure), true, 'create_order pins search_path to public');
select is((select proconfig @> array['search_path=public'] from pg_proc where oid='public.get_catalog(text,uuid,integer,integer,uuid)'::regprocedure), true, 'get_catalog pins search_path to public');
select is((select proconfig @> array['search_path=public'] from pg_proc where oid='public.stage_product_import(text,text,jsonb)'::regprocedure), false, 'legacy stage_product_import retains empty search_path hardening');
select is((select proconfig @> array['search_path=public'] from pg_proc where oid='public.commit_product_import(uuid,uuid)'::regprocedure), true, 'commit_product_import pins search_path to public');
select is((select proconfig @> array['search_path=public'] from pg_proc where oid='public.set_product_price(uuid,customer_tier,numeric,text)'::regprocedure), false, 'set_product_price retains empty search_path hardening');

select is((select prosecdef from pg_proc where oid='public.adjust_inventory(uuid,uuid,integer,text)'::regprocedure), true, 'adjust_inventory remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.create_order(text,uuid,jsonb)'::regprocedure), true, 'create_order remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.get_catalog(text,uuid,integer,integer,uuid)'::regprocedure), true, 'get_catalog remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.stage_product_import(text,text,jsonb)'::regprocedure), true, 'stage_product_import remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.commit_product_import(uuid,uuid)'::regprocedure), true, 'commit_product_import remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.set_product_price(uuid,customer_tier,numeric,text)'::regprocedure), true, 'set_product_price remains SECURITY DEFINER');

select * from finish();
rollback;
