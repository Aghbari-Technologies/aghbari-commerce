begin;

select plan(25);

select ok(to_regclass('public.cash_accounts_branch_org_fk_idx') is not null,'cash_accounts_branch_org_fk_idx');
select ok(to_regclass('public.cash_transactions_account_org_fk_idx') is not null,'cash_transactions_account_org_fk_idx');
select ok(to_regclass('public.expenses_branch_org_fk_idx') is not null,'expenses_branch_org_fk_idx');
select ok(to_regclass('public.expenses_cash_account_org_fk_idx') is not null,'expenses_cash_account_org_fk_idx');
select ok(to_regclass('public.operational_invoice_items_invoice_org_fk_idx') is not null,'operational_invoice_items_invoice_org_fk_idx');
select ok(to_regclass('public.operational_invoice_items_product_org_fk_idx') is not null,'operational_invoice_items_product_org_fk_idx');
select ok(to_regclass('public.operational_invoice_items_org_fk_idx') is not null,'operational_invoice_items_org_fk_idx');
select ok(to_regclass('public.operational_invoices_customer_org_fk_idx') is not null,'operational_invoices_customer_org_fk_idx');
select ok(to_regclass('public.operational_invoices_order_org_fk_idx') is not null,'operational_invoices_order_org_fk_idx');
select ok(to_regclass('public.operational_invoices_org_fk_idx') is not null,'operational_invoices_org_fk_idx');
select ok(to_regclass('public.payments_cash_account_org_fk_idx') is not null,'payments_cash_account_org_fk_idx');
select ok(to_regclass('public.payments_invoice_org_fk_idx') is not null,'payments_invoice_org_fk_idx');
select ok(to_regclass('public.purchase_order_items_product_org_fk_idx') is not null,'purchase_order_items_product_org_fk_idx');
select ok(to_regclass('public.purchase_order_items_purchase_order_org_fk_idx') is not null,'purchase_order_items_purchase_order_org_fk_idx');
select ok(to_regclass('public.purchase_order_items_org_fk_idx') is not null,'purchase_order_items_org_fk_idx');
select ok(to_regclass('public.purchase_orders_supplier_org_fk_idx') is not null,'purchase_orders_supplier_org_fk_idx');
select ok(to_regclass('public.purchase_orders_warehouse_org_fk_idx') is not null,'purchase_orders_warehouse_org_fk_idx');
select ok(to_regclass('public.purchase_orders_org_fk_idx') is not null,'purchase_orders_org_fk_idx');
select ok(to_regclass('public.purchase_receipt_items_purchase_order_item_org_fk_idx') is not null,'purchase_receipt_items_purchase_order_item_org_fk_idx');
select ok(to_regclass('public.purchase_receipt_items_receipt_org_fk_idx') is not null,'purchase_receipt_items_receipt_org_fk_idx');
select ok(to_regclass('public.purchase_receipt_items_product_org_fk_idx') is not null,'purchase_receipt_items_product_org_fk_idx');
select ok(to_regclass('public.purchase_receipt_items_org_fk_idx') is not null,'purchase_receipt_items_org_fk_idx');
select ok(to_regclass('public.purchase_receipts_purchase_order_org_fk_idx') is not null,'purchase_receipts_purchase_order_org_fk_idx');
select ok(to_regclass('public.purchase_receipts_warehouse_org_fk_idx') is not null,'purchase_receipts_warehouse_org_fk_idx');
select ok(to_regclass('public.purchase_receipts_org_fk_idx') is not null,'purchase_receipts_org_fk_idx');

select * from finish();
rollback;
