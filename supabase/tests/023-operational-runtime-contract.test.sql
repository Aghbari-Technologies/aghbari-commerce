begin;
select plan(10);

select ok(to_regclass('public.suppliers') is not null,'suppliers table exists');
select ok(to_regclass('public.purchase_orders') is not null,'purchase_orders table exists');
select ok(to_regclass('public.purchase_receipts') is not null,'purchase_receipts table exists');
select ok(to_regclass('public.cash_accounts') is not null,'cash_accounts table exists');
select ok(to_regclass('public.cash_transactions') is not null,'cash_transactions table exists');
select ok((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname in ('suppliers','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items','cash_accounts','cash_transactions','expenses','payments') and c.relrowsecurity)=9,'all operational tables have RLS');
select ok((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('approve_purchase_order','create_cash_account','create_customer','create_invoice_from_order','create_purchase_order','create_supplier','receive_purchase_order','record_expense','record_payment','set_customer_active','set_customer_tier','submit_purchase_order') and p.prosecdef and p.proconfig @> array['search_path=public'])=12,'all mutating operational RPCs are fixed-search-path security definer');
select ok((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('approve_purchase_order','create_cash_account','create_customer','create_invoice_from_order','create_purchase_order','create_supplier','get_cash_account_balances','receive_purchase_order','record_expense','record_payment','set_customer_active','set_customer_tier','submit_purchase_order') and has_function_privilege('anon',p.oid,'execute'))=0,'anonymous operational RPC execution denied');
select ok((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('approve_purchase_order','create_cash_account','create_customer','create_invoice_from_order','create_purchase_order','create_supplier','get_cash_account_balances','receive_purchase_order','record_expense','record_payment','set_customer_active','set_customer_tier','submit_purchase_order') and has_function_privilege('authenticated',p.oid,'execute'))=13,'authenticated operational RPC execution present');
select ok((select count(*) from pg_policies where schemaname='public' and tablename in ('suppliers','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items','cash_accounts','cash_transactions','expenses','payments') and 'public'=any(roles))=0,'no PUBLIC-role operational RLS policies');

select * from finish();
rollback;
