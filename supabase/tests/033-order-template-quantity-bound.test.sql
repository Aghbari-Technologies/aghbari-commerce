begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select ok(exists (
  select 1 from pg_constraint
  where conrelid='public.order_template_lines'::regclass
    and conname='order_template_lines_quantity_10k_check'
),'order-template line quantity has a 10,000 ceiling constraint');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='save_order_template'
    and pg_get_functiondef(p.oid) like '%v_qty>10000%'
    and pg_get_functiondef(p.oid) not like '%v_qty>1000000%'
),'save_order_template rejects new quantities above 10,000');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='apply_order_template'
    and pg_get_functiondef(p.oid) like '%template quantity exceeds 10000%'
),'apply_order_template fails closed on legacy oversized quantities');

select ok((select p.proconfig @> array['search_path=""'] from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='apply_order_template' limit 1),
  'apply_order_template keeps empty search_path hardening');

select is(has_function_privilege('anon','public.apply_order_template(uuid,uuid,text)','execute'),false,'apply_order_template is not executable by anon');

select * from finish();
rollback;
