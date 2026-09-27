begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

do $fixture$
declare
  v_org uuid := 'd1000000-0000-4000-8000-000000000001';
  v_user uuid := 'd1000000-0000-4000-8000-000000000002';
  v_customer uuid := 'd1000000-0000-4000-8000-000000000003';
  v_branch uuid := 'd1000000-0000-4000-8000-000000000004';
  v_warehouse uuid := 'd1000000-0000-4000-8000-000000000005';
  v_product uuid := 'd1000000-0000-4000-8000-000000000006';
  v_price_list uuid := 'd1000000-0000-4000-8000-000000000007';
begin
  insert into auth.users(id,aud,role,email,created_at,updated_at)
  values (v_user,'authenticated','authenticated','quick-boundary@test.local',now(),now());

  insert into public.organizations(id,name,is_active)
  values (v_org,'Quick Boundary Tenant',true);

  insert into public.customers(id,organization_id,name,tier,is_active)
  values (v_customer,v_org,'Quick Boundary Customer','retail'::public.customer_tier,true);

  insert into public.profiles(id,organization_id,customer_id,role)
  values (v_user,v_org,v_customer,'viewer'::public.user_role);

  insert into public.branches(id,organization_id,name,is_active)
  values (v_branch,v_org,'Quick Boundary Branch',true);

  insert into public.warehouses(id,organization_id,branch_id,name,is_active)
  values (v_warehouse,v_org,v_branch,'Quick Boundary Warehouse',true);

  insert into public.products(id,organization_id,sku,name,unit,status)
  values (v_product,v_org,'QB-001','Quick Boundary Product','unit','active');

  insert into public.price_lists(id,organization_id,tier,name,currency,is_active)
  values (v_price_list,v_org,'retail'::public.customer_tier,'Quick Boundary Retail','YER',true);

  insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
  values (v_org,v_price_list,v_product,100,now());

  insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity)
  values (v_org,v_warehouse,v_product,10);
end
$fixture$;

create temp table quick_order_behavior_results(name text primary key, passed boolean not null, detail text not null) on commit drop;

set local role authenticated;
select set_config('request.jwt.claim.sub','d1000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claim.role','authenticated',true);

do $behavior$
declare
  v_cart uuid;
  v_replay uuid;
  v_error text;
begin
  v_cart := public.apply_quick_order(
    repeat('p',128),
    'd1000000-0000-4000-8000-000000000005',
    jsonb_build_array(jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',1))
  );
  insert into quick_order_behavior_results values ('accept-128',v_cart is not null,coalesce(v_cart::text,'null'));

  begin
    perform public.apply_quick_order(
      repeat('q',129),
      'd1000000-0000-4000-8000-000000000005',
      jsonb_build_array(jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',1))
    );
    insert into quick_order_behavior_results values ('reject-129',false,'accepted unexpectedly');
  exception when others then
    insert into quick_order_behavior_results values ('reject-129',sqlstate='22023',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  begin
    perform public.apply_quick_order(
      repeat('p',128),
      'd1000000-0000-4000-8000-000000000005',
      jsonb_build_array(jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',2))
    );
    insert into quick_order_behavior_results values ('payload-conflict',false,'accepted conflicting payload');
  exception when others then
    insert into quick_order_behavior_results values ('payload-conflict',sqlstate='40001',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  v_replay := public.apply_quick_order(
    repeat('p',128),
    'd1000000-0000-4000-8000-000000000005',
    jsonb_build_array(jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',1))
  );
  insert into quick_order_behavior_results values ('replay-stable',v_replay=v_cart,coalesce(v_replay::text,'null'));

  begin
    perform public.apply_quick_order(
      repeat('w',128),
      'd1000000-0000-4000-8000-000000000005',
      jsonb_build_array(jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',10001))
    );
    insert into quick_order_behavior_results values ('reject-quantity',false,'accepted quantity > 10000');
  exception when others then
    insert into quick_order_behavior_results values ('reject-quantity',sqlstate='22023',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  begin
    perform public.apply_quick_order(
      repeat('x',128),
      'd1000000-0000-4000-8000-000000000005',
      jsonb_build_array(
        jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',1),
        jsonb_build_object('product_id','d1000000-0000-4000-8000-000000000006','quantity',1)
      )
    );
    insert into quick_order_behavior_results values ('reject-duplicate-line',false,'accepted duplicate product line');
  exception when others then
    insert into quick_order_behavior_results values ('reject-duplicate-line',sqlstate='22023',sqlstate||':'||coalesce(sqlerrm,''));
  end;

  reset role;

  insert into quick_order_behavior_results
  select 'one-completed-idempotency-row',
         count(*)=1,
         count(*)::text
  from public.operation_idempotency
  where organization_id='d1000000-0000-4000-8000-000000000001'
    and idempotency_key=repeat('p',128)
    and operation_type='quick_order_cart_merge'
    and status='completed';

  insert into quick_order_behavior_results
  select 'no-129-operation-row',
         count(*)=0,
         count(*)::text
  from public.operation_idempotency
  where organization_id='d1000000-0000-4000-8000-000000000001'
    and idempotency_key=repeat('q',129)
    and operation_type='quick_order_cart_merge';

  insert into quick_order_behavior_results
  select 'cart-quantity-stable',
         coalesce(sum(ci.quantity),0)=1,
         coalesce(sum(ci.quantity),0)::text
  from public.cart_items ci
  join public.carts c on c.id=ci.cart_id
  where c.organization_id='d1000000-0000-4000-8000-000000000001'
    and c.customer_id='d1000000-0000-4000-8000-000000000003'
    and ci.product_id='d1000000-0000-4000-8000-000000000006';
end
$behavior$;

select is((select passed from quick_order_behavior_results where name='accept-128'),true,'quick order accepts 128-character idempotency key');
select is((select passed from quick_order_behavior_results where name='reject-129'),true,'quick order rejects 129-character idempotency key');
select is((select passed from quick_order_behavior_results where name='payload-conflict'),true,'quick order rejects conflicting replay payload');
select is((select passed from quick_order_behavior_results where name='replay-stable'),true,'quick order replay returns the same cart');
select is((select passed from quick_order_behavior_results where name='reject-quantity'),true,'quick order rejects quantity above 10000');
select is((select passed from quick_order_behavior_results where name='reject-duplicate-line'),true,'quick order rejects duplicate product lines');
select is((select passed from quick_order_behavior_results where name='one-completed-idempotency-row'),true,'quick order stores exactly one completed idempotency row');
select is((select passed from quick_order_behavior_results where name='no-129-operation-row'),true,'rejected 129 key creates no idempotency row');
select is((select passed from quick_order_behavior_results where name='cart-quantity-stable'),true,'idempotent replay keeps cart quantity stable');
select is(
  has_function_privilege('anon','public.apply_quick_order(text,uuid,jsonb)','execute'),
  false,
  'quick order remains anonymous-denied'
);
select ok(
  exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='apply_quick_order' and 'search_path=""'=any(coalesce(p.proconfig,'{}'))),
  'quick order retains empty search_path'
);

select * from finish();
rollback;
