begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

insert into auth.users(id,email) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001','rbac-owner@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002','rbac-admin@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003','rbac-sales@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004','rbac-warehouse@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','rbac-viewer@test.local'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006','rbac-customer@test.local'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001','rbac-other-admin@test.local');
insert into public.organizations(id,name,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC Tenant A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC Tenant B',true);
insert into public.customers(id,organization_id,name,tier,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC Customer A','wholesale',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0201','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC Customer B','wholesale',true);
insert into public.profiles(id,organization_id,customer_id,role) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'owner'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'admin'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'sales'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'warehouse'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100',null,'viewer'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101','viewer'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200',null,'admin');
insert into public.branches(id,organization_id,name,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0110','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','RBAC Branch A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0210','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0200','RBAC Branch B',true);
insert into public.warehouses(id,organization_id,branch_id,name,is_active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0120','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0100','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0110','RBAC Warehouse A',true),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0220','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbb0210','RBAC Warehouse B',true);
