begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email) values ('88888888-8888-4888-8888-888888888888', 'stock-count-admin@test.local');
insert into public.organizations (id, name) values ('67676767-6767-4676-8676-676767676767', 'Stock Count Tenant');
insert into public.branches (id, organization_id, name) values ('67676767-6767-4676-8676-676767676768', '67676767-6767-4676-8676-676767676767', 'Main');
insert into public.warehouses (id, organization_id, branch_id, name) values ('67676767-6767-4676-8676-676767676769', '67676767-6767-4676-8676-676767676767', 'Main Warehouse');
insert into public.products (id, organization_id, sku, name, unit) values ('67676767-6767-4676-8676-676767676770', '67676767-6767-4676-8676-676767676767', 'COUNT-001', 'Count Product', 'carton');
insert into public.profiles (id, organization_id, role) values ('88888888-8888-4888-8888-888888888888', '67676767-6767-4676-8676-676767676767', 'admin');
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
values ('67676767-6767-4676-8676-676767676767','67676767-6767-4676-8676-676767676769','67676767-6767-4676-8676-676767676770',10);

set local role authenticated;
set local request.jwt.claim.sub = '88888888-8888-4888-8888-888888888888';

select is((select status from public.start_stock_count('67676767-6767-4676-8676-676767676769','stock-count-idem-01','cycle count test')),'open'::public.stock_count_status,'Starting a stock count creates an open session');
select is((select expected_quantity from public.stock_count_lines where session_id=(select id from public.stock_count_sessions where idempotency_key='stock-count-idem-01')) ,10,'Count captures the starting expected quantity');
select throws_ok(
  $$select public.complete_stock_count((select id from public.stock_count_sessions where idempotency_key='stock-count-idem-01'))$$,
  '22023','all stock count lines must be counted before completion','Completion is blocked until every line is counted'
);
select is((select counted_quantity from public.set_stock_count_line((select id from public.stock_count_sessions where idempotency_key='stock-count-idem-01'),'67676767-6767-4676-8676-676767676770',7)),7,'Counted quantity is persisted');
select is((select status from public.complete_stock_count((select id from public.stock_count_sessions where idempotency_key='stock-count-idem-01'))),'completed','Completed count closes the session');
select is((select quantity from public.inventory_balances where warehouse_id='67676767-6767-4676-8676-676767676769' and product_id='67676767-6767-4676-8676-676767676770'),7,'Reconciliation sets the authoritative balance to the physical count');
select is((select count(*) from public.inventory_movements where source_type='stock_count' and source_id=(select id from public.stock_count_sessions where idempotency_key='stock-count-idem-01')),1::bigint,'A non-zero count variance creates an auditable inventory movement');
select is((select variance from public.stock_count_lines where session_id=(select id from public.stock_count_sessions where idempotency_key='stock-count-idem-01')),-3,'Variance is recorded against the balance at completion');
select is((select status from public.start_stock_count('67676767-6767-4676-8676-676767676769','stock-count-idem-01')),'completed'::public.stock_count_status,'Replaying the same start key is idempotent and returns the completed session');

select * from finish();
rollback;
