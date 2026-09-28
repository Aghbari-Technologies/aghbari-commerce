begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values (
  'd3800000-0000-4000-8000-000000000001',
  'd3800000-0000-4000-8000-000000000099',
  'authenticated','authenticated',
  'purchase-receipt-boundary@fixture.invalid','x',now(),now()
);
insert into public.organizations(id,name,is_active)
values ('d3800000-0000-4000-8000-000000000010','Purchase Receipt Boundary Tenant',true);
insert into public.customers(id,organization_id,name,tier,is_active)
values ('d3800000-0000-4000-8000-000000000011','d3800000-0000-4000-8000-000000000010','Purchase Receipt Boundary Customer','retail',true);
insert into public.profiles(id,organization_id,customer_id,role)
values ('d3800000-0000-4000-8000-000000000001','d3800000-0000-4000-8000-000000000010','d3800000-0000-4000-8000-000000000011','admin'::public.user_role);
insert into public.branches(id,organization_id,name,is_active)
values ('d3800000-0000-4000-8000-000000000012','d3800000-0000-4000-8000-000000000010','Purchase Receipt Boundary Branch',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active)
values ('d3800000-0000-4000-8000-000000000013','d3800000-0000-4000-8000-000000000010','d3800000-0000-4000-8000-000000000012','Purchase Receipt Boundary Warehouse',true);
insert into public.suppliers(id,organization_id,name,is_active)
values ('d3800000-0000-4000-8000-000000000014','d3800000-0000-4000-8000-000000000010','Purchase Receipt Boundary Supplier',true);
insert into public.products(id,organization_id,sku,name,unit,status)
values ('d3800000-0000-4000-8000-000000000015','d3800000-0000-4000-8000-000000000010','PUR-REC-BOUND-001','Purchase Receipt Boundary Product','unit','active');

set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','d3800000-0000-4000-8000-000000000001',true);

create temp table _purchase_receipt_runtime_proof (
  purchase_id uuid,
  purchase_item_id uuid,
  purchase_128_ok boolean default false,
  purchase_129_ok boolean default false,
  receipt_128_ok boolean default false,
  receipt_129_ok boolean default false
) on commit drop;

do $$
declare
  v_purchase_id uuid;
  v_item_id uuid;
begin
  begin
    select purchase_order_id into v_purchase_id
    from public.create_purchase_order(
      'd3800000-0000-4000-8000-000000000014'::uuid,
      'd3800000-0000-4000-8000-000000000013'::uuid,
      repeat('k',128),
      jsonb_build_array(jsonb_build_object(
        'product_id','d3800000-0000-4000-8000-000000000015'::uuid,
        'quantity',1,
        'unit_cost',100
      ))
    );
  exception when others then
    raise exception '128-character purchase key failed unexpectedly: %', sqlerrm;
  end;

  select id into v_item_id
  from public.purchase_order_items
  where purchase_order_id=v_purchase_id
  order by created_at
  limit 1;

  insert into _purchase_receipt_runtime_proof(purchase_id,purchase_item_id,purchase_128_ok)
  values(v_purchase_id,v_item_id,true);

  update public.purchase_orders
  set status='approved'::public.purchase_order_status
  where id=v_purchase_id
    and organization_id='d3800000-0000-4000-8000-000000000010'::uuid;

  begin
    perform *
    from public.create_purchase_order(
      'd3800000-0000-4000-8000-000000000014'::uuid,
      'd3800000-0000-4000-8000-000000000013'::uuid,
      repeat('x',129),
      jsonb_build_array(jsonb_build_object(
        'product_id','d3800000-0000-4000-8000-000000000015'::uuid,
        'quantity',1,
        'unit_cost',100
      ))
    );
    raise exception '129-character purchase key was accepted';
  exception when sqlstate '22023' then
    update _purchase_receipt_runtime_proof set purchase_129_ok=true;
  end;

  begin
    perform *
    from public.receive_purchase_order(
      v_purchase_id,
      repeat('r',128),
      jsonb_build_array(jsonb_build_object(
        'purchase_order_item_id',v_item_id,
        'product_id','d3800000-0000-4000-8000-000000000015'::uuid,
        'quantity',1
      ))
    );
  exception when others then
    raise exception '128-character receipt key failed unexpectedly: %', sqlerrm;
  end;
  update _purchase_receipt_runtime_proof set receipt_128_ok=true;

  begin
    perform *
    from public.receive_purchase_order(
      v_purchase_id,
      repeat('z',129),
      jsonb_build_array(jsonb_build_object(
        'purchase_order_item_id',v_item_id,
        'product_id','d3800000-0000-4000-8000-000000000015'::uuid,
        'quantity',1
      ))
    );
    raise exception '129-character receipt key was accepted';
  exception when sqlstate '22023' then
    update _purchase_receipt_runtime_proof set receipt_129_ok=true;
  end;
end $$;

select ok((select purchase_128_ok from _purchase_receipt_runtime_proof),
  'runtime purchase idempotency: 128-character key accepted');
do $
begin
  begin
    perform * from public.create_purchase_order(
      'd3800000-0000-4000-8000-000000000099'::uuid,
      'd3800000-0000-4000-8000-000000000013'::uuid,
      repeat('k',128),
      jsonb_build_array(jsonb_build_object(
        'product_id','d3800000-0000-4000-8000-000000000015'::uuid,
        'quantity',1,
        'unit_cost',100
      ))
    );
    raise exception 'same-key purchase payload conflict was accepted';
  exception when sqlstate '40001' then
    null;
  end;
end $;

select is(
  (select count(*)::int from public.purchase_orders
   where organization_id='d3800000-0000-4000-8000-000000000010'::uuid
     and idempotency_key=repeat('k',128)),
  1,
  'same-key purchase payload conflict does not create a second purchase'
);

do $
declare
  existing_receipt uuid;
  existing_item uuid;
begin
  select id into existing_receipt
  from public.purchase_receipts
  where organization_id='d3800000-0000-4000-8000-000000000010'::uuid
    and idempotency_key=repeat('r',128)
  limit 1;
  select purchase_order_item_id into existing_item
  from public.purchase_receipt_items
  where organization_id='d3800000-0000-4000-8000-000000000010'::uuid
    and receipt_id=existing_receipt
  limit 1;

  begin
    perform * from public.receive_purchase_order(
      'd3800000-0000-4000-8000-000000000099'::uuid,
      repeat('r',128),
      jsonb_build_array(jsonb_build_object(
        'purchase_order_item_id',existing_item,
        'product_id','d3800000-0000-4000-8000-000000000015'::uuid,
        'quantity',1
      ))
    );
    raise exception 'same-key receipt payload conflict was accepted';
  exception when sqlstate '40001' then
    null;
  end;
end $;

select is(
  (select count(*)::int from public.purchase_receipts
   where organization_id='d3800000-0000-4000-8000-000000000010'::uuid
     and idempotency_key=repeat('r',128)),
  1,
  'same-key receipt payload conflict does not create a second receipt'
);


select ok((select purchase_129_ok from _purchase_receipt_runtime_proof),
  'runtime purchase idempotency: 129-character key rejected');

select ok((select receipt_128_ok from _purchase_receipt_runtime_proof),
  'runtime receipt idempotency: 128-character key accepted');

select ok((select receipt_129_ok from _purchase_receipt_runtime_proof),
  'runtime receipt idempotency: 129-character key rejected');

select is(
  (select count(*)::int from public.purchase_orders
   where organization_id='d3800000-0000-4000-8000-000000000010'::uuid
     and idempotency_key=repeat('k',128)),
  1,
  'runtime boundary proof creates exactly one purchase order for the accepted key');

select is(
  (select count(*)::int from public.purchase_receipts
   where organization_id='d3800000-0000-4000-8000-000000000010'::uuid
     and idempotency_key=repeat('r',128)),
  1,
  'runtime boundary proof creates exactly one receipt for the accepted key');

select * from finish();
rollback;
