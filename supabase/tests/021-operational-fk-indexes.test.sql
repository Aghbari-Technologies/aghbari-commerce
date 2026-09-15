begin;

select plan(25);

-- pgTAP has_index() is version-sensitive for identifier lookup; verify the
-- actual catalog object by schema + exact index name instead.
select is((select count(*) from pg_indexes where schemaname='public' and tablename='cash_accounts' and indexname='cash_accounts_branch_org_fk_idx'),1::bigint,'cash_accounts_branch_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='cash_transactions' and indexname='cash_transactions_account_org_fk_idx'),1::bigint,'cash_transactions_account_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='expenses' and indexname='expenses_branch_org_fk_idx'),1::bigint,'expenses_branch_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='expenses' and indexname='expenses_cash_account_org_fk_idx'),1::bigint,'expenses_cash_account_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='operational_invoice_items' and indexname='operational_invoice_items_invoice_org_fk_idx'),1::bigint,'operational_invoice_items_invoice_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='operational_invoice_items' and indexname='operational_invoice_items_product_org_fk_idx'),1::bigint,'operational_invoice_items_product_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='operational_invoice_items' and indexname='operational_invoice_items_org_fk_idx'),1::bigint,'operational_invoice_items_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='operational_invoices' and indexname='operational_invoices_customer_org_fk_idx'),1::bigint,'operational_invoices_customer_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='operational_invoices' and indexname='operational_invoices_order_org_fk_idx'),1::bigint,'operational_invoices_order_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='operational_invoices' and indexname='operational_invoices_org_fk_idx'),1::bigint,'operational_invoices_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='payments' and indexname='payments_cash_account_org_fk_idx'),1::bigint,'payments_cash_account_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='payments' and indexname='payments_invoice_org_fk_idx'),1::bigint,'payments_invoice_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_order_items' and indexname='purchase_order_items_product_org_fk_idx'),1::bigint,'purchase_order_items_product_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_order_items' and indexname='purchase_order_items_purchase_order_org_fk_idx'),1::bigint,'purchase_order_items_purchase_order_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_order_items' and indexname='purchase_order_items_org_fk_idx'),1::bigint,'purchase_order_items_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_orders' and indexname='purchase_orders_supplier_org_fk_idx'),1::bigint,'purchase_orders_supplier_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_orders' and indexname='purchase_orders_warehouse_org_fk_idx'),1::bigint,'purchase_orders_warehouse_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_orders' and indexname='purchase_orders_org_fk_idx'),1::bigint,'purchase_orders_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipt_items' and indexname='purchase_receipt_items_purchase_order_item_org_fk_idx'),1::bigint,'purchase_receipt_items_purchase_order_item_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipt_items' and indexname='purchase_receipt_items_receipt_org_fk_idx'),1::bigint,'purchase_receipt_items_receipt_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipt_items' and indexname='purchase_receipt_items_product_org_fk_idx'),1::bigint,'purchase_receipt_items_product_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipt_items' and indexname='purchase_receipt_items_org_fk_idx'),1::bigint,'purchase_receipt_items_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipts' and indexname='purchase_receipts_purchase_order_org_fk_idx'),1::bigint,'purchase_receipts_purchase_order_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipts' and indexname='purchase_receipts_warehouse_org_fk_idx'),1::bigint,'purchase_receipts_warehouse_org_fk_idx');
select is((select count(*) from pg_indexes where schemaname='public' and tablename='purchase_receipts' and indexname='purchase_receipts_org_fk_idx'),1::bigint,'purchase_receipts_org_fk_idx');

select * from finish();
rollback;
