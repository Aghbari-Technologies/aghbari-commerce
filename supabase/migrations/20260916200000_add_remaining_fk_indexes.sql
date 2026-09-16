-- Cover the remaining live foreign-key advisor findings without removing existing indexes.
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
