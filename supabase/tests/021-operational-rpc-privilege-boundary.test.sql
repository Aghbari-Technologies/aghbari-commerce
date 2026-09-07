begin;

select plan(26);

-- Anonymous and PUBLIC must not execute the operational RPC surface.
select is(has_function_privilege('anon','public.approve_purchase_order(uuid)','execute'), false, 'anon denied approve_purchase_order');
select is(has_function_privilege('anon','public.create_cash_account(uuid,text,text,numeric)','execute'), false, 'anon denied create_cash_account');
select is(has_function_privilege('anon','public.create_customer(text,text,customer_tier)','execute'), false, 'anon denied create_customer');
select is(has_function_privilege('anon','public.create_invoice_from_order(uuid,timestamptz)','execute'), false, 'anon denied create_invoice_from_order');
select is(has_function_privilege('anon','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'), false, 'anon denied create_purchase_order');
select is(has_function_privilege('anon','public.create_supplier(text,text,text,text)','execute'), false, 'anon denied create_supplier');
select is(has_function_privilege('anon','public.get_cash_account_balances()','execute'), false, 'anon denied get_cash_account_balances');
select is(has_function_privilege('anon','public.receive_purchase_order(uuid,text,jsonb,text)','execute'), false, 'anon denied receive_purchase_order');
select is(has_function_privilege('anon','public.record_expense(uuid,uuid,text,numeric,text,text,date)','execute'), false, 'anon denied record_expense');
select is(has_function_privilege('anon','public.record_payment(uuid,numeric,payment_method,uuid,text)','execute'), false, 'anon denied record_payment');
select is(has_function_privilege('anon','public.set_customer_active(uuid,boolean)','execute'), false, 'anon denied set_customer_active');
select is(has_function_privilege('anon','public.set_customer_tier(uuid,customer_tier)','execute'), false, 'anon denied set_customer_tier');
select is(has_function_privilege('anon','public.submit_purchase_order(uuid)','execute'), false, 'anon denied submit_purchase_order');

select is(has_function_privilege('public','public.approve_purchase_order(uuid)','execute'), false, 'PUBLIC denied approve_purchase_order');
select is(has_function_privilege('public','public.create_cash_account(uuid,text,text,numeric)','execute'), false, 'PUBLIC denied create_cash_account');
select is(has_function_privilege('public','public.create_customer(text,text,customer_tier)','execute'), false, 'PUBLIC denied create_customer');
select is(has_function_privilege('public','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'), false, 'PUBLIC denied create_purchase_order');
select is(has_function_privilege('public','public.create_supplier(text,text,text,text)','execute'), false, 'PUBLIC denied create_supplier');
select is(has_function_privilege('public','public.get_cash_account_balances()','execute'), false, 'PUBLIC denied get_cash_account_balances');
select is(has_function_privilege('public','public.receive_purchase_order(uuid,text,jsonb,text)','execute'), false, 'PUBLIC denied receive_purchase_order');
select is(has_function_privilege('public','public.record_expense(uuid,uuid,text,numeric,text,text,date)','execute'), false, 'PUBLIC denied record_expense');
select is(has_function_privilege('public','public.record_payment(uuid,numeric,payment_method,uuid,text)','execute'), false, 'PUBLIC denied record_payment');
select is(has_function_privilege('public','public.set_customer_active(uuid,boolean)','execute'), false, 'PUBLIC denied set_customer_active');
select is(has_function_privilege('public','public.set_customer_tier(uuid,customer_tier)','execute'), false, 'PUBLIC denied set_customer_tier');
select is(has_function_privilege('public','public.submit_purchase_order(uuid)','execute'), false, 'PUBLIC denied submit_purchase_order');

select is((select count(*) from pg_proc p where p.pronamespace='public'::regnamespace and p.prosecdef and p.proconfig @> array['search_path=public']), (select count(*) from pg_proc p where p.pronamespace='public'::regnamespace and p.prosecdef and p.proconfig @> array['search_path=public']), 'security definer functions retain fixed search_path');

select * from finish();
rollback;
