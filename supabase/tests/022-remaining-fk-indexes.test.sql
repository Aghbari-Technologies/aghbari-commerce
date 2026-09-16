begin;

select plan(7);

select ok(to_regclass('public.inventory_transfer_items_product_org_fk_idx') is not null,'inventory_transfer_items_product_org_fk_idx');
select ok(to_regclass('public.inventory_transfer_items_transfer_org_fk_idx') is not null,'inventory_transfer_items_transfer_org_fk_idx');
select ok(to_regclass('public.inventory_transfers_created_by_fk_idx') is not null,'inventory_transfers_created_by_fk_idx');
select ok(to_regclass('public.inventory_transfers_destination_warehouse_org_fk_idx') is not null,'inventory_transfers_destination_warehouse_org_fk_idx');
select ok(to_regclass('public.inventory_transfers_source_warehouse_org_fk_idx') is not null,'inventory_transfers_source_warehouse_org_fk_idx');
select ok(to_regclass('public.stock_thresholds_product_org_fk_idx') is not null,'stock_thresholds_product_org_fk_idx');
select ok(to_regclass('public.stock_thresholds_warehouse_org_fk_idx') is not null,'stock_thresholds_warehouse_org_fk_idx');

select * from finish();
rollback;
