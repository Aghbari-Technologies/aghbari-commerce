begin;

create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users (id,email)
values ('12121212-1212-4121-8121-121212121212','finance-flow@test.local');
insert into public.organizations (id,name)
values ('12121212-1212-4121-8121-121212121213','Finance Flow Test');
insert into public.branches (id,organization_id,name)
values ('12121212-1212-4121-8121-121212121215','12121212-1212-4121-8121-121212121213','Finance Branch');
insert into public.warehouses (id,organization_id,branch_id,name)
values ('12121212-1212-4121-8121-121212121219','12121212-1212-4121-8121-121212121213','12121212-1212-4121-8121-121212121215','Finance Warehouse');
insert into public.customers (id,organization_id,name,tier)
values ('12121212-1212-4121-8121-121212121216','12121212-1212-4121-8121-121212121213','Finance Customer','wholesale');
insert into public.orders (id,organization_id,customer_id,warehouse_id,order_number,status,total,currency,idempotency_key,created_by)
values ('12121212-1212-4121-8121-121212121217','12121212-1212-4121-8121-121212121213','12121212-1212-4121-8121-121212121216','12121212-1212-4121-8121-121212121219',9121201,'completed',200,'YER','finance-flow-01','12121212-1212-4121-8121-121212121212');
insert into public.profiles (id,organization_id,role)
values ('12121212-1212-4121-8121-121212121212','12121212-1212-4121-8121-121212121213','admin');
insert into public.cash_accounts(id,organization_id,branch_id,name,currency,opening_balance)
values ('12121212-1212-4121-8121-121212121218','12121212-1212-4121-8121-121212121213','12121212-1212-4121-8121-121212121215','Flow Cash','YER',0);

set local role authenticated;
set local request.jwt.claim.sub='12121212-1212-4121-8121-121212121212';

select is((select total from public.create_invoice_from_order('12121212-1212-4121-8121-121212121217')),200::numeric,'Completed order creates an operational invoice');
select is((select count(*) from public.operational_invoices where order_id='12121212-1212-4121-8121-121212121217'),1::bigint,'Invoice is unique per order');
select is((select total from public.create_invoice_from_order('12121212-1212-4121-8121-121212121217')),200::numeric,'Repeated invoice command is idempotent');
select is((select amount from public.record_payment((select id from public.operational_invoices where order_id='12121212-1212-4121-8121-121212121217'),50,'cash','12121212-1212-4121-8121-121212121218','RCPT-1')),50::numeric,'Partial payment posts the requested amount');
select is((select status from public.operational_invoices where order_id='12121212-1212-4121-8121-121212121217'),'partially_paid','Partial payment updates invoice status');
select is((select count(*) from public.cash_transactions where cash_account_id='12121212-1212-4121-8121-121212121218' and source_type='payment'),1::bigint,'Payment creates one cash transaction');
select throws_ok($$select public.record_payment((select id from public.operational_invoices where order_id='12121212-1212-4121-8121-121212121217'),151,'cash','12121212-1212-4121-8121-121212121218','OVER')$$,'22003','payment exceeds invoice balance','Overpayment is rejected');
select is((select amount from public.record_payment((select id from public.operational_invoices where order_id='12121212-1212-4121-8121-121212121217'),150,'cash','12121212-1212-4121-8121-121212121218','RCPT-2')),150::numeric,'Final payment posts the remaining balance');
select is((select status from public.operational_invoices where order_id='12121212-1212-4121-8121-121212121217'),'paid','Final payment marks invoice paid');
select is((select current_balance from public.get_cash_account_balances() where id='12121212-1212-4121-8121-121212121218'),200::numeric,'Cash account reflects all collections');

select * from finish();
rollback;
