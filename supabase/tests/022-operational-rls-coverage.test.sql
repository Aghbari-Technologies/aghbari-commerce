begin;
select plan(3);
select is((select count(*) from pg_tables t where t.schemaname='public' and t.tablename in ('cash_accounts','cash_transactions','expenses','invoices','invoice_items','payments','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items','suppliers') and exists (select 1 from pg_class c where c.relname=t.tablename and c.relrowsecurity)), 11::bigint, 'all reconciled operational tables have RLS enabled');
select is((select count(*) from pg_policies where schemaname='public' and tablename in ('cash_accounts','cash_transactions','expenses','invoices','invoice_items','payments','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items','suppliers')), 11::bigint, 'all reconciled operational tables have at least one RLS policy');
select ok((select count(*) from pg_policies where schemaname='public' and tablename in ('cash_accounts','cash_transactions','expenses','invoices','invoice_items','payments','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items','suppliers') and roles @> array['public'::name]) = 0, 'reconciled operational policies are not PUBLIC-role policies');
select * from finish();
rollback;
