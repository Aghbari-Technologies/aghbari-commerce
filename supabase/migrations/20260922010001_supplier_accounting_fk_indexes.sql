CREATE INDEX supplier_bills_created_by_idx ON public.supplier_bills(created_by);
CREATE INDEX supplier_bills_purchase_order_org_idx ON public.supplier_bills(purchase_order_id, organization_id);
CREATE INDEX supplier_bills_supplier_org_idx ON public.supplier_bills(supplier_id, organization_id);
CREATE INDEX supplier_ledger_actor_idx ON public.supplier_ledger_entries(actor_id);
CREATE INDEX supplier_ledger_bill_org_idx ON public.supplier_ledger_entries(supplier_bill_id, organization_id);
CREATE INDEX supplier_ledger_supplier_org_idx ON public.supplier_ledger_entries(supplier_id, organization_id);
