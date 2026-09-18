-- Reconcile the clean-source schema with the live operational FK index contract.
-- The first seven indexes below closed the remaining advisor findings; the
-- additional operational indexes preserve existing production coverage so a
-- from-scratch migration produces the same required FK indexing surface.
CREATE INDEX IF NOT EXISTS inventory_transfer_items_product_org_fk_idx
  ON public.inventory_transfer_items(product_id, organization_id);
CREATE INDEX IF NOT EXISTS inventory_transfer_items_transfer_org_fk_idx
  ON public.inventory_transfer_items(transfer_id, organization_id);
CREATE INDEX IF NOT EXISTS inventory_transfers_created_by_fk_idx
  ON public.inventory_transfers(created_by);
CREATE INDEX IF NOT EXISTS inventory_transfers_destination_warehouse_org_fk_idx
  ON public.inventory_transfers(destination_warehouse_id, organization_id);
CREATE INDEX IF NOT EXISTS inventory_transfers_source_warehouse_org_fk_idx
  ON public.inventory_transfers(source_warehouse_id, organization_id);
CREATE INDEX IF NOT EXISTS stock_thresholds_product_org_fk_idx
  ON public.stock_thresholds(product_id, organization_id);
CREATE INDEX IF NOT EXISTS stock_thresholds_warehouse_org_fk_idx
  ON public.stock_thresholds(warehouse_id, organization_id);

CREATE INDEX IF NOT EXISTS cash_accounts_branch_org_fk_idx
  ON public.cash_accounts(branch_id, organization_id);
CREATE INDEX IF NOT EXISTS cash_transactions_account_org_fk_idx
  ON public.cash_transactions(cash_account_id, organization_id);
CREATE INDEX IF NOT EXISTS expenses_branch_org_fk_idx
  ON public.expenses(branch_id, organization_id);
CREATE INDEX IF NOT EXISTS expenses_cash_account_org_fk_idx
  ON public.expenses(cash_account_id, organization_id);
CREATE INDEX IF NOT EXISTS operational_invoice_items_invoice_org_fk_idx
  ON public.operational_invoice_items(invoice_id, organization_id);
CREATE INDEX IF NOT EXISTS operational_invoice_items_product_org_fk_idx
  ON public.operational_invoice_items(product_id, organization_id);
CREATE INDEX IF NOT EXISTS operational_invoice_items_org_fk_idx
  ON public.operational_invoice_items(organization_id);
CREATE INDEX IF NOT EXISTS operational_invoices_customer_org_fk_idx
  ON public.operational_invoices(customer_id, organization_id);
CREATE INDEX IF NOT EXISTS operational_invoices_order_org_fk_idx
  ON public.operational_invoices(order_id, organization_id);
CREATE INDEX IF NOT EXISTS operational_invoices_org_fk_idx
  ON public.operational_invoices(organization_id);
CREATE INDEX IF NOT EXISTS payments_cash_account_org_fk_idx
  ON public.payments(cash_account_id, organization_id);
CREATE INDEX IF NOT EXISTS payments_invoice_org_fk_idx
  ON public.payments(invoice_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_order_items_product_org_fk_idx
  ON public.purchase_order_items(product_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_order_items_purchase_order_org_fk_idx
  ON public.purchase_order_items(purchase_order_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_order_items_org_fk_idx
  ON public.purchase_order_items(organization_id);
CREATE INDEX IF NOT EXISTS purchase_orders_supplier_org_fk_idx
  ON public.purchase_orders(supplier_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_orders_warehouse_org_fk_idx
  ON public.purchase_orders(warehouse_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_orders_org_fk_idx
  ON public.purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_purchase_order_item_org_fk_idx
  ON public.purchase_receipt_items(purchase_order_item_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_receipt_org_fk_idx
  ON public.purchase_receipt_items(receipt_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_product_org_fk_idx
  ON public.purchase_receipt_items(product_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipt_items_org_fk_idx
  ON public.purchase_receipt_items(organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_purchase_order_org_fk_idx
  ON public.purchase_receipts(purchase_order_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_warehouse_org_fk_idx
  ON public.purchase_receipts(warehouse_id, organization_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_org_fk_idx
  ON public.purchase_receipts(organization_id);
