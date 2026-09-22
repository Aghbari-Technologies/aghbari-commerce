begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111101','supplier-owner@test.local'),
 ('11111111-1111-4111-8111-111111111102','supplier-viewer@test.local'),
 ('22222222-2222-4222-8222-222222222201','supplier-other-admin@test.local');

insert into public.organizations(id,name,is_active) values
 ('11111111-1111-4111-8111-111111111110','Supplier Accounting A',true),
 ('22222222-2222-4222-8222-222222222210','Supplier Accounting B',true);

insert into public.profiles(id,organization_id,role,customer_id) values
 ('11111111-1111-4111-8111-111111111101','11111111-1111-4111-8111-111111111110','owner',null),
 ('11111111-1111-4111-8111-111111111102','11111111-1111-4111-8111-111111111110','viewer',null),
 ('22222222-2222-4222-8222-222222222201','22222222-2222-4222-8222-222222222210','admin',null);

insert into public.suppliers(id,organization_id,name,phone,email,address,is_active) values
 ('11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111110','Supplier A','700000001','a@supplier.test','A',true),
 ('22222222-2222-4222-8222-222222222211','22222222-2222-4222-8222-222222222210','Supplier B','700000002','b@supplier.test','B',true);

set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111101';

select is((select relrowsecurity from pg_class where oid='public.supplier_bills'::regclass),true,'supplier_bills RLS enabled');
select is((select relrowsecurity from pg_class where oid='public.supplier_ledger_entries'::regclass),true,'supplier_ledger_entries RLS enabled');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text)'::regprocedure),true,'create supplier bill pins empty search_path');
select is((select proconfig @> array['search_path=""'] from pg_proc where oid='public.record_supplier_payment(uuid,numeric,payment_method,uuid,text,text)'::regprocedure),true,'record supplier payment pins empty search_path');
select is(has_function_privilege('anon','public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text)','execute'),false,'anon cannot execute supplier bill RPC');
select is(has_function_privilege('anon','public.record_supplier_payment(uuid,numeric,payment_method,uuid,text,text)','execute'),false,'anon cannot execute supplier payment RPC');
select is(has_function_privilege('authenticated','public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text)','execute'),true,'authenticated may execute supplier bill RPC through role boundary');
select is(has_function_privilege('authenticated','public.record_supplier_payment(uuid,numeric,payment_method,uuid,text,text)','execute'),true,'authenticated may execute supplier payment RPC through role boundary');

select lives_ok($$select public.create_supplier_bill('11111111-1111-4111-8111-111111111111','BILL-A-001',1250,'YER',null,null,'supplier-bill-test-key-0001',null)$$,'owner creates supplier bill');
select is((select count(*) from public.supplier_bills where organization_id='11111111-1111-4111-8111-111111111110' and bill_number='BILL-A-001'),1::bigint,'supplier bill persisted once');
select is((select count(*) from public.supplier_ledger_entries where organization_id='11111111-1111-4111-8111-111111111110' and supplier_bill_id=(select id from public.supplier_bills where bill_number='BILL-A-001')),1::bigint,'supplier payable ledger persisted once');
select lives_ok($$select public.create_supplier_bill('11111111-1111-4111-8111-111111111111','BILL-A-001',1250,'YER',null,null,'supplier-bill-test-key-0001',null)$$,'same bill idempotency returns safely');
select is((select count(*) from public.supplier_bills where organization_id='11111111-1111-4111-8111-111111111110' and bill_number='BILL-A-001'),1::bigint,'same bill key does not duplicate bill');
select throws_ok($$select public.create_supplier_bill('11111111-1111-4111-8111-111111111111','BILL-A-001',1300,'YER',null,null,'supplier-bill-test-key-0001',null)$$,'40001',null,'same bill key with conflicting payload is rejected');

select lives_ok($$select public.record_supplier_payment((select id from public.supplier_bills where bill_number='BILL-A-001'),250,'bank_transfer',null,'BANK-001','supplier-payment-test-key-0001')$$,'owner records supplier payment');
select is((select status from public.supplier_bills where bill_number='BILL-A-001'),'partially_paid'::public.invoice_status,'partial payment updates bill status');
select lives_ok($$select public.record_supplier_payment((select id from public.supplier_bills where bill_number='BILL-A-001'),250,'bank_transfer',null,'BANK-001','supplier-payment-test-key-0001')$$,'same payment key returns safely');
select is((select count(*) from public.supplier_ledger_entries where idempotency_key='supplier-payment-test-key-0001'),1::bigint,'same payment key does not duplicate entry');
select throws_ok($$select public.record_supplier_payment((select id from public.supplier_bills where bill_number='BILL-A-001'),300,'bank_transfer',null,'BANK-002','supplier-payment-test-key-0001')$$,'40001',null,'same payment key with conflicting payload is rejected');
select throws_ok($$select public.record_supplier_payment((select id from public.supplier_bills where bill_number='BILL-A-001'),1001,'bank_transfer',null,'BANK-003','supplier-payment-test-key-0002')$$,'22003',null,'payment cannot exceed remaining bill balance');

set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111102';
select is((select count(*) from public.supplier_bills where organization_id='11111111-1111-4111-8111-111111111110'),0::bigint,'viewer cannot read supplier bills through staff write policy');
select throws_ok($$select public.create_supplier_bill('11111111-1111-4111-8111-111111111111','VIEWER-001',100,'YER',null,null,'viewer-supplier-bill-key-0001',null)$$,'42501',null,'viewer cannot create supplier bill');

set local request.jwt.claim.sub='22222222-2222-4222-8222-222222222201';
select is((select count(*) from public.supplier_bills where supplier_id='11111111-1111-4111-8111-111111111111'),0::bigint,'foreign tenant cannot read supplier bill');
select throws_ok($$select public.record_supplier_payment((select id from public.supplier_bills where bill_number='BILL-A-001'),10,'bank_transfer',null,'FOREIGN-001','foreign-payment-key-0001')$$,'P0002',null,'foreign tenant cannot pay another tenant bill');

select * from finish();
rollback;
