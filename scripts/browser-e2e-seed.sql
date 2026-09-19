create extension if not exists pgcrypto;

insert into public.organizations(id,name,is_active) values
  ('90000000-0000-4000-8000-000000000101','Browser Tenant A',true),
  ('90000000-0000-4000-8000-000000000102','Browser Tenant B',true)
on conflict (id) do nothing;

insert into public.customers(id,organization_id,name,tier,is_active) values
  ('90000000-0000-4000-8000-000000000201','90000000-0000-4000-8000-000000000101','Browser Customer A','retail',true),
  ('90000000-0000-4000-8000-000000000202','90000000-0000-4000-8000-000000000102','Browser Customer B','retail',true)
on conflict (id) do nothing;

insert into public.profiles(id,organization_id,customer_id,role) values
  ((select id from auth.users where email='customer-a@test.local'),'90000000-0000-4000-8000-000000000101','90000000-0000-4000-8000-000000000201','customer'),
  ((select id from auth.users where email='customer-b@test.local'),'90000000-0000-4000-8000-000000000102','90000000-0000-4000-8000-000000000202','customer'),
  ((select id from auth.users where email='admin-a@test.local'),'90000000-0000-4000-8000-000000000101',null,'admin'),
  ((select id from auth.users where email='admin-b@test.local'),'90000000-0000-4000-8000-000000000102',null,'admin')
on conflict (id) do update
set organization_id=excluded.organization_id,
    customer_id=excluded.customer_id,
    role=excluded.role;

insert into public.branches(id,organization_id,name,is_active) values
  ('90000000-0000-4000-8000-000000000301','90000000-0000-4000-8000-000000000101','Browser Branch A',true),
  ('90000000-0000-4000-8000-000000000302','90000000-0000-4000-8000-000000000102','Browser Branch B',true)
on conflict (id) do nothing;

insert into public.warehouses(id,organization_id,branch_id,name,is_active) values
  ('90000000-0000-4000-8000-000000000401','90000000-0000-4000-8000-000000000101','90000000-0000-4000-8000-000000000301','Browser Warehouse A',true),
  ('90000000-0000-4000-8000-000000000402','90000000-0000-4000-8000-000000000102','90000000-0000-4000-8000-000000000302','Browser Warehouse B',true)
on conflict (id) do nothing;

insert into public.products(id,organization_id,sku,barcode,name,unit,status) values
  ('90000000-0000-4000-8000-000000000501','90000000-0000-4000-8000-000000000101','BROW-001','6290000000101','Browser Product A','unit','active'),
  ('90000000-0000-4000-8000-000000000502','90000000-0000-4000-8000-000000000102','BROW-002','6290000000102','Browser Product B','unit','active'),
  ('90000000-0000-4000-8000-000000000503','90000000-0000-4000-8000-000000000101','BROW-INACTIVE','6290000000199','Inactive Product','unit','inactive')
on conflict (id) do nothing;

insert into public.price_lists(organization_id,tier,name,currency) values
  ('90000000-0000-4000-8000-000000000101','retail','Browser Retail A','YER'),
  ('90000000-0000-4000-8000-000000000102','retail','Browser Retail B','YER')
on conflict do nothing;

insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select organization_id,id,'90000000-0000-4000-8000-000000000501',100,now()
from public.price_lists
where organization_id='90000000-0000-4000-8000-000000000101';

insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select organization_id,id,'90000000-0000-4000-8000-000000000502',100,now()
from public.price_lists
where organization_id='90000000-0000-4000-8000-000000000102';

insert into public.customer_price_tiers(customer_id,product_id,min_quantity,unit_price,currency) values
  ('90000000-0000-4000-8000-000000000201','90000000-0000-4000-8000-000000000501',1,100,'YER'),
  ('90000000-0000-4000-8000-000000000202','90000000-0000-4000-8000-000000000502',1,100,'YER')
on conflict (customer_id,product_id,min_quantity)
do update set unit_price=excluded.unit_price,currency=excluded.currency,updated_at=now();

insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values
  ('90000000-0000-4000-8000-000000000101','90000000-0000-4000-8000-000000000401','90000000-0000-4000-8000-000000000501',20),
  ('90000000-0000-4000-8000-000000000102','90000000-0000-4000-8000-000000000402','90000000-0000-4000-8000-000000000502',20)
on conflict do nothing;

do $$
declare
  v_user_count integer;
  v_identity_count integer;
  v_profile_count integer;
  v_tier_count integer;
begin
  select count(*) into v_user_count
  from auth.users
  where email in ('customer-a@test.local','customer-b@test.local','admin-a@test.local','admin-b@test.local');
  select count(*) into v_identity_count
  from auth.identities i
  join auth.users u on u.id=i.user_id
  where u.email in ('customer-a@test.local','customer-b@test.local','admin-a@test.local','admin-b@test.local')
    and i.provider='email';
  select count(*) into v_profile_count
  from public.profiles p
  join auth.users u on u.id=p.id
  where u.email in ('customer-a@test.local','customer-b@test.local','admin-a@test.local','admin-b@test.local');
  select count(*) into v_tier_count
  from public.customer_price_tiers cpt
  where cpt.customer_id in ('90000000-0000-4000-8000-000000000201','90000000-0000-4000-8000-000000000202');
  if v_user_count <> 4 or v_identity_count <> 4 or v_profile_count <> 4 or v_tier_count <> 2 then
    raise exception using message=format('browser fixture integrity mismatch users=%s identities=%s profiles=%s customer_price_tiers=%s',v_user_count,v_identity_count,v_profile_count,v_tier_count);
  end if;
end $$;
