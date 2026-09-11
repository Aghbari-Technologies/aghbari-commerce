begin;

select plan(13);

-- The canonical security policy is an empty search_path for all public
-- SECURITY DEFINER routines. Application objects are explicitly schema-qualified.
select is((select coalesce(proconfig,'{}') @> array['search_path=""'] from pg_proc where oid='public.adjust_inventory(uuid,uuid,integer,text)'::regprocedure), true, 'adjust_inventory pins empty search_path');
select is((select coalesce(proconfig,'{}') @> array['search_path=""'] from pg_proc where oid='public.create_order(text,uuid,jsonb)'::regprocedure), true, 'create_order pins empty search_path');
select is((select coalesce(proconfig,'{}') @> array['search_path=""'] from pg_proc where oid='public.get_catalog(text,uuid,integer,integer)'::regprocedure), true, 'get_catalog pins empty search_path');
select is((select coalesce(proconfig,'{}') @> array['search_path=""'] from pg_proc where oid='public.stage_product_import(text,text,jsonb)'::regprocedure), true, 'stage_product_import pins empty search_path');
select is((select coalesce(proconfig,'{}') @> array['search_path=""'] from pg_proc where oid='public.commit_product_import(uuid,uuid)'::regprocedure), true, 'commit_product_import pins empty search_path');
select is((select coalesce(proconfig,'{}') @> array['search_path=""'] from pg_proc where oid='public.set_product_price(uuid,customer_tier,numeric,text)'::regprocedure), true, 'set_product_price pins empty search_path');

select is((select prosecdef from pg_proc where oid='public.adjust_inventory(uuid,uuid,integer,text)'::regprocedure), true, 'adjust_inventory remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.create_order(text,uuid,jsonb)'::regprocedure), true, 'create_order remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.get_catalog(text,uuid,integer,integer)'::regprocedure), true, 'get_catalog remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.stage_product_import(text,text,jsonb)'::regprocedure), true, 'stage_product_import remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.commit_product_import(uuid,uuid)'::regprocedure), true, 'commit_product_import remains SECURITY DEFINER');
select is((select prosecdef from pg_proc where oid='public.set_product_price(uuid,customer_tier,numeric,text)'::regprocedure), true, 'set_product_price remains SECURITY DEFINER');

-- System-wide regression guard: no public SECURITY DEFINER routine may retain
-- the mutable public search_path configuration.
select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public'
      and p.prosecdef
      and p.proconfig @> array['search_path=public']
  ),
  'no public SECURITY DEFINER function uses search_path=public'
);

select * from finish();
rollback;
