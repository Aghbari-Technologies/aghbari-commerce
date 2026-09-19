begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select ok(
  has_function_privilege(
    'authenticated',
    'public.get_catalog_with_barcode(text,uuid,integer,integer,uuid)',
    'EXECUTE'
  ),
  'authenticated can execute the barcode catalog projection'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.get_catalog_with_barcode(text,uuid,integer,integer,uuid)',
    'EXECUTE'
  ),
  'anon cannot execute the barcode catalog projection'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.upsert_product(uuid,text,text,text,uuid,text,text,text)',
    'EXECUTE'
  ),
  'authenticated can execute the canonical barcode-aware upsert'
);

insert into auth.users(id,email) values
 ('cccccccc-3333-4333-8333-cccccccc0001','barcode-owner@test.local'),
 ('cccccccc-3333-4333-8333-cccccccc0002','barcode-customer@test.local');
insert into public.organizations(id,name,is_active)
values('cccccccc-3333-4333-8333-cccccccc0100','Barcode Tenant',true);
insert into public.customers(id,organization_id,name,tier,is_active)
values(
 'cccccccc-3333-4333-8333-cccccccc0200',
 'cccccccc-3333-4333-8333-cccccccc0100',
 'Barcode Customer','retail',true
);
insert into public.profiles(id,organization_id,customer_id,role) values
 ('cccccccc-3333-4333-8333-cccccccc0001','cccccccc-3333-4333-8333-cccccccc0100',null,'owner'),
 ('cccccccc-3333-4333-8333-cccccccc0002','cccccccc-3333-4333-8333-cccccccc0100','cccccccc-3333-4333-8333-cccccccc0200','viewer');
insert into public.branches(id,organization_id,name,is_active)
values('cccccccc-3333-4333-8333-cccccccc0110','cccccccc-3333-4333-8333-cccccccc0100','Barcode Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active)
values('cccccccc-3333-4333-8333-cccccccc0100','cccccccc-3333-4333-8333-cccccccc0110','Barcode Warehouse',true);
insert into public.price_lists(organization_id,tier,name,currency)
values('cccccccc-3333-4333-8333-cccccccc0100','retail','Barcode Retail','YER')
on conflict do nothing;

set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='cccccccc-3333-4333-8333-cccccccc0001';

select ok(
  (public.upsert_product(
    null,'BAR-001','Barcode Product','unit',null,null,'active','6299990000001'
  )).barcode='6299990000001',
  'barcode-aware create stores barcode'
);
select throws_ok(
  $$select public.upsert_product(
    null,'BAR-002','Duplicate Barcode Product','unit',null,null,'active','6299990000001'
  )$$,
  '23505',null,
  'barcode uniqueness is organization-scoped'
);
select is(
  (select barcode from public.products
   where organization_id='cccccccc-3333-4333-8333-cccccccc0100'
     and sku='BAR-001'),
  '6299990000001',
  'product row retains barcode'
);

insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select
 'cccccccc-3333-4333-8333-cccccccc0100',
 id,
 (select id from public.products
  where organization_id='cccccccc-3333-4333-8333-cccccccc0100' and sku='BAR-001'),
 100,now()
from public.price_lists
where organization_id='cccccccc-3333-4333-8333-cccccccc0100'
  and tier='retail';
insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
select
 'cccccccc-3333-4333-8333-cccccccc0100',
 'cccccccc-3333-4333-8333-cccccccc0120',
 id,20
from public.products
where organization_id='cccccccc-3333-4333-8333-cccccccc0100' and sku='BAR-001';
insert into public.customer_price_tiers(customer_id,product_id,min_quantity,unit_price,currency)
select
 'cccccccc-3333-4333-8333-cccccccc0200',
 id,1,100,'YER'
from public.products
where organization_id='cccccccc-3333-4333-8333-cccccccc0100' and sku='BAR-001';

set local request.jwt.claim.sub='cccccccc-3333-4333-8333-cccccccc0002';

select is(
  (select barcode
   from public.get_catalog_with_barcode(
     null,null,20,0,'cccccccc-3333-4333-8333-cccccccc0120'
   )
   where sku='BAR-001'),
  '6299990000001',
  'customer catalog projection returns barcode'
);

set local request.jwt.claim.sub='cccccccc-3333-4333-8333-cccccccc0001';

select lives_ok(
  $$select public.stage_product_import(
    'barcode.xlsx',repeat('c',64),
    jsonb_build_array(
      jsonb_build_object(
        'sku','IMP-BAR','barcode','6299990000002','name','Imported Barcode',
        'unit','unit','category','Barcode','quantity',5,
        'prices',jsonb_build_object('retail',50,'wholesale',45,'distributor',40)
      )
    )
  )$$,
  'barcode-bearing import stages'
);
select is(
  (select normalized_data->>'barcode'
   from public.import_rows
   where import_job_id=(
     select id from public.import_jobs where source_fingerprint=repeat('c',64)
   ) and row_number=1),
  '6299990000002',
  'stage persists normalized barcode'
);
select is(
  (select imported_rows
   from public.commit_product_import(
     (select id from public.import_jobs where source_fingerprint=repeat('c',64)),
     'cccccccc-3333-4333-8333-cccccccc0120'
   )),
  1,
  'barcode-bearing import commits atomically'
);
select is(
  (select barcode from public.products
   where organization_id='cccccccc-3333-4333-8333-cccccccc0100'
     and sku='IMP-BAR'),
  '6299990000002',
  'committed product retains imported barcode'
);

select ok(
  (public.upsert_product(
    (select id from public.products
     where organization_id='cccccccc-3333-4333-8333-cccccccc0100' and sku='BAR-001'),
    'BAR-001','Barcode Product','unit',null,null,'active','6299990000003'
  )).barcode='6299990000003',
  'barcode-aware update replaces barcode'
);
select is(
  (select barcode from public.products
   where organization_id='cccccccc-3333-4333-8333-cccccccc0100'
     and sku='BAR-001'),
  '6299990000003',
  'updated product row has new barcode'
);

select throws_ok(
  $$select public.stage_product_import(
    'duplicate-barcode.xlsx',repeat('d',64),
    jsonb_build_array(
      jsonb_build_object(
        'sku','DUP-001','barcode','6299990000003','name','Duplicate Barcode',
        'unit','unit','category','Barcode','quantity',1,
        'prices',jsonb_build_object('retail',10,'wholesale',9,'distributor',8)
      )
    )
  )$$,
  '22023',null,
  'stage rejects barcode already used by another SKU'
);

select * from finish();
rollback;
