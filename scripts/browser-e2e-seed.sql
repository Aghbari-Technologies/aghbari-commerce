create extension if not exists pgcrypto;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
  ('90000000-0000-4000-8000-000000000001',(select id from auth.instances limit 1),'authenticated','authenticated','customer-a@test.local',crypt('AghbariE2E!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('90000000-0000-4000-8000-000000000002',(select id from auth.instances limit 1),'authenticated','authenticated','customer-b@test.local',crypt('AghbariE2E!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('90000000-0000-4000-8000-000000000003',(select id from auth.instances limit 1),'authenticated','authenticated','admin-a@test.local',crypt('AghbariE2E!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()),
  ('90000000-0000-4000-8000-000000000004',(select id from auth.instances limit 1),'authenticated','authenticated','admin-b@test.local',crypt('AghbariE2E!2026',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now())
on conflict (id) do nothing;

insert into auth.identities(id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
select
  id,
  id,
  id::text,
  jsonb_build_object('sub',id::text,'email',email),
  'email',
  null,
  now(),
  now()
from auth.users
where email in ('customer-a@test.local','customer-b@test.local','admin-a@test.local','admin-b@test.local')
on conflict (id) do nothing;

insert into public.organizations(id,name,is_active) values
  ('90000000-0000-4000-8000-000000000101','Browser Tenant A',true),
  ('90000000-0000-4000-8000-000000000102','Browser Tenant B',true)
on conflict (id) do nothing;

insert into public.customers(id,organization_id,name,tier,is_active) values
  ('90000000-0000-4000-8000-000000000201','90000000-0000-4000-8000-000000000101','Browser Customer A','retail',true),
  ('90000000-0000-4000-8000-000000000202','90000000-0000-4000-8000-000000000102','Browser Customer B','retail',true)
on conflict (id) do nothing;

insert into public.profiles(id,organization_id,customer_id,role) values
  ('90000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000101','90000000-0000-4000-8000-000000000201','viewer'),
  ('90000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000102','90000000-0000-4000-8000-000000000202','viewer'),
  ('90000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000101',null,'admin'),
  ('90000000-0000-4000-8000-000000000004','90000000-0000-4000-8000-000000000102',null,'admin')
on conflict (id) do nothing;

insert into public.branches(id,organization_id,name,is_active) values
  ('90000000-0000-4000-8000-000000000301','90000000-0000-4000-8000-000000000101','Browser Branch A',true),
  ('90000000-0000-4000-8000-000000000302','90000000-0000-4000-8000-000000000102','Browser Branch B',true)
on conflict (id) do nothing;

insert into public.warehouses(id,organization_id,branch_id,name,is_active) values
  ('90000000-0000-4000-8000-000000000401','90000000-0000-4000-8000-000000000101','90000000-0000-4000-8000-000000000301','Browser Warehouse A',true),
  ('90000000-0000-4000-8000-000000000402','90000000-0000-4000-8000-000000000102','90000000-0000-4000-8000-000000000302','Browser Warehouse B',true)
on conflict (id) do nothing;

insert into public.products(id,organization_id,sku,name,unit,status) values
  ('90000000-0000-4000-8000-000000000501','90000000-0000-4000-8000-000000000101','BROW-001','Browser Product A','unit','active'),
  ('90000000-0000-4000-8000-000000000502','90000000-0000-4000-8000-000000000102','BROW-002','Browser Product B','unit','active'),
  ('90000000-0000-4000-8000-000000000503','90000000-0000-4000-8000-000000000101','BROW-INACTIVE','Inactive Product','unit','inactive')
on conflict (id) do nothing;

insert into public.price_lists(organization_id,tier,name,currency) values
  ('90000000-0000-4000-8000-000000000101','retail','Browser Retail A','YER'),
  ('90000000-0000-4000-8000-000000000102','retail','Browser Retail B','YER');

insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select organization_id,id,'90000000-0000-4000-8000-000000000501',100,now()
from public.price_lists
where organization_id='90000000-0000-4000-8000-000000000101';

insert into public.product_prices(organization_id,price_list_id,product_id,amount,valid_from)
select organization_id,id,'90000000-0000-4000-8000-000000000502',100,now()
from public.price_lists
where organization_id='90000000-0000-4000-8000-000000000102';

insert into public.inventory_balances(organization_id,warehouse_id,product_id,quantity) values
  ('90000000-0000-4000-8000-000000000101','90000000-0000-4000-8000-000000000401','90000000-0000-4000-8000-000000000501',20),
  ('90000000-0000-4000-8000-000000000102','90000000-0000-4000-8000-000000000402','90000000-0000-4000-8000-000000000502',20)
on conflict do nothing;
