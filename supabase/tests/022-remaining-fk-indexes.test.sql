begin;

select plan(7);

select has_index('public', 'inventory_transfer_items', 'inventory_transfer_items_product_org_fk_idx');
select has_index('public', 'inventory_transfer_items', 'inventory_transfer_items_transfer_org_fk_idx');
select has_index('public', 'inventory_transfers', 'inventory_transfers_created_by_fk_idx');
select has_index('public', 'inventory_transfers', 'inventory_transfers_destination_warehouse_org_fk_idx');
select has_index('public', 'inventory_transfers', 'inventory_transfers_source_warehouse_org_fk_idx');
select has_index('public', 'stock_thresholds', 'stock_thresholds_product_org_fk_idx');
select has_index('public', 'stock_thresholds', 'stock_thresholds_warehouse_org_fk_idx');

select * from finish();
rollback;
