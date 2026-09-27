begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

do $fixture$
declare
  v_org uuid := 'c1000000-0000-4000-8000-000000000001';
  v_user uuid := 'c1000000-0000-4000-8000-000000000002';
  v_supplier uuid := 'c1000000-0000-4000-8000-000000000003';
  v_branch uuid := 'c1000000-0000-4000-8000-000000000004';
  v_warehouse uuid := 'c1000000-0000-4000-8000-000000000005';
  v_product uuid := 'c1000000-0000-4000-8000-000000000006';
begin
  insert into auth.users(id,aud,role,email,created_at,updated_at)
  values (v_user,'authenticated','authenticated','purchase-boundary@test.local',now(),now());

  insert into public.organizations(id,name,is_active)
  values (v_org,'Purchase Boundary Tenant',true);

  insert into public.profiles(id,organization_id,customer_id,role)
  values (v_user,v_org,null,'admin'::public.user_role);

  insert into public.branches(id,organization_id,name,is_active)
  values (v_branch,v_org,'Purchase Boundary Branch',true);

  insert into public.warehouses(id,organization_id,branch_id,name,is_active)
  values (v_warehouse,v_org,v_branch,'Purchase Boundary Warehouse',true);

  insert into public.suppliers(id,organization_id,name,is_active)
  values (v_supplier,v_org,'Purchase Boundary Supplier',true);

  insert into public.products(id,organization_id,sku,name,unit,status)
  values (v_product,v_org,'PB-001','Purchase Boundary Product','unit','active');
end
$fixture$;

set local role authenticated;
select set_config('request.jwt.claim.sub','c1000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claim.role','authenticated',true);

do $behavior$
declare
  v_org uuid := 'c1000000-0000-4000-8000-000000000001';
  v_supplier uuid := 'c1000000-0000-4000-8000-000000000003';
  v_warehouse uuid := 'c1000000-0000-4000-8000-000000000005';
  v_product uuid := 'c1000000-0000-4000-8000-000000000006';
  v_po uuid;
  v_item bigint;
  v_receipt uuid;
  v_error text;
begin
  select purchase_order_id into v_po
  from public.create_purchase_order(
    v_supplier,
    v_warehouse,
    repeat('p',128),
    jsonb_build_array(jsonb_build_object('product_id',v_product,'quantity',1,'unit_cost',100)),
    'YER',
    'boundary proof'
  );
  create temp table purchase_receipt_behavior_results(name text primary key, passed boolean not null, detail text not null) on commit drop;
  insert into purchase_receipt_behavior_results values ('create-128',v_po is not null,coalesce(v_po::text,'null'));

  begin
    perform public.create_purchase_order(
      v_supplier,
      v_warehouse,
      repeat('q',129),
      jsonb_build_array(jsonb_build_object('product_id',v_product,'quantity',1,'unit_cost',100)),
      'YER',
      'boundary proof'
    );
    insert into purchase_receipt_behavior_results values ('create-129-rejected',false,'accepted unexpectedly');
  exception when others then
    insert into purchase_receipt_behavior_results values ('create-129-rejected',sqlstate='22023',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  begin
    perform public.create_purchase_order(
      v_supplier,
      v_warehouse,
      repeat('p',128),
      jsonb_build_array(jsonb_build_object('product_id',v_product,'quantity',2,'unit_cost',100)),
      'YER',
      'boundary proof'
    );
    insert into purchase_receipt_behavior_results values ('create-payload-conflict',false,'accepted conflicting payload');
  exception when others then
    insert into purchase_receipt_behavior_results values ('create-payload-conflict',sqlstate='40001',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  reset role;

  select count(*) into v_item
  from public.purchase_order_items
  where organization_id=v_org and purchase_order_id=v_po and product_id=v_product;
  insert into purchase_receipt_behavior_results values ('create-no-129-side-effect',v_item=1,v_item::text);

  update public.purchase_orders
  set status='approved'::public.purchase_order_status
  where id=v_po and organization_id=v_org;

  set local role authenticated;
  select receipt_id into v_receipt
  from public.receive_purchase_order(
    v_po,
    repeat('r',128),
    jsonb_build_array(jsonb_build_object(
      'purchase_order_item_id',(select id from public.purchase_order_items where purchase_order_id=v_po and product_id=v_product limit 1),
      'product_id',v_product,
      'quantity',1
    )),
    'boundary receipt'
  );

  insert into purchase_receipt_behavior_results values ('receive-128',v_receipt is not null,coalesce(v_receipt::text,'null'));

  begin
    perform public.receive_purchase_order(
      v_po,
      repeat('s',129),
      jsonb_build_array(jsonb_build_object(
        'purchase_order_item_id',(select id from public.purchase_order_items where purchase_order_id=v_po and product_id=v_product limit 1),
        'product_id',v_product,
        'quantity',1
      )),
      'boundary receipt'
    );
    insert into purchase_receipt_behavior_results values ('receive-129-rejected',false,'accepted unexpectedly');
  exception when others then
    insert into purchase_receipt_behavior_results values ('receive-129-rejected',sqlstate='22023',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  begin
    perform public.receive_purchase_order(
      v_po,
      repeat('r',128),
      jsonb_build_array(jsonb_build_object(
        'purchase_order_item_id',(select id from public.purchase_order_items where purchase_order_id=v_po and product_id=v_product limit 1),
        'product_id',v_product,
        'quantity',1
      )),
      'boundary receipt changed'
    );
    insert into purchase_receipt_behavior_results values ('receive-payload-conflict',false,'accepted conflicting payload');
  exception when others then
    insert into purchase_receipt_behavior_results values ('receive-payload-conflict',sqlstate='40001',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  reset role;

  insert into purchase_receipt_behavior_results
  select 'replay-count-stable',count(*)=1,count(*)::text
  from public.purchase_receipts
  where organization_id=v_org and idempotency_key=repeat('r',128);

  insert into purchase_receipt_behavior_results
  select 'no-129-receipt-side-effect',count(*)=1,count(*)::text
  from public.purchase_receipts
  where organization_id=v_org and idempotency_key<>repeat('r',128);

  insert into purchase_receipt_behavior_results
  select 'accepted-receipt-inventory-effect',coalesce(quantity,0)=1,coalesce(quantity,0)::text
  from public.inventory_balances
  where organization_id=v_org and warehouse_id=v_warehouse and product_id=v_product;

  if not exists(select 1 from purchase_receipt_behavior_results where passed=false) then
    null;
  end if;
end
$behavior$;

select is((select passed from purchase_receipt_behavior_results where name='create-128'),true,'create_purchase_order accepts 128 characters');
select is((select passed from purchase_receipt_behavior_results where name='create-129-rejected'),true,'create_purchase_order rejects 129 characters');
select is((select passed from purchase_receipt_behavior_results where name='create-payload-conflict'),true,'create_purchase_order rejects conflicting replay payload');
select is((select passed from purchase_receipt_behavior_results where name='create-no-129-side-effect'),true,'rejected 129 purchase creates no order-item side effect');
select is((select passed from purchase_receipt_behavior_results where name='receive-128'),true,'receive_purchase_order accepts 128 characters');
select is((select passed from purchase_receipt_behavior_results where name='receive-129-rejected'),true,'receive_purchase_order rejects 129 characters');
select is((select passed from purchase_receipt_behavior_results where name='receive-payload-conflict'),true,'receive_purchase_order rejects conflicting replay payload');
select is((select passed from purchase_receipt_behavior_results where name='replay-count-stable'),true,'accepted receipt replay stays idempotent');
select is((select passed from purchase_receipt_behavior_results where name='no-129-receipt-side-effect'),true,'rejected 129 receipt creates no extra receipt');
select is((select passed from purchase_receipt_behavior_results where name='accepted-receipt-inventory-effect'),true,'accepted receipt produces exactly one inventory increment');
select is((select passed from purchase_receipt_behavior_results where name='create-128'),true,'create boundary result is stable');
select is((select passed from purchase_receipt_behavior_results where name='receive-128'),true,'receive boundary result is stable');
select ok(
  exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='create_purchase_order' and 'search_path=""'=any(coalesce(p.proconfig,'{}'))),
  'create_purchase_order retains empty search_path'
);
select ok(
  exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='receive_purchase_order' and 'search_path=""'=any(coalesce(p.proconfig,'{}'))),
  'receive_purchase_order retains empty search_path'
);
select is(
  has_function_privilege('anon','public.create_purchase_order(uuid,uuid,text,jsonb,text,text)','execute'),
  false,
  'create_purchase_order stays anonymous-denied'
);

select * from finish();
rollback;
