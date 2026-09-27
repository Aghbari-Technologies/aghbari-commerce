begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='operational_invoices' and policyname='operational_invoices_read' and cmd='SELECT' and 'authenticated' = any(roles) and qual ilike '%current_customer_id()%'),
  'customer invoice reads are authenticated and customer-scoped'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='operational_invoice_items' and policyname='operational_invoice_items_read' and cmd='SELECT' and 'authenticated' = any(roles) and qual ilike '%current_customer_id()%'),
  'customer invoice-item reads are authenticated and customer-scoped'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='payments_read' and cmd='SELECT' and 'authenticated' = any(roles) and qual ilike '%current_customer_id()%'),
  'customer payment reads are authenticated and customer-scoped'
);

select is(
  exists(select 1 from pg_policies where schemaname='public' and tablename in ('operational_invoices','operational_invoice_items','payments') and cmd in ('INSERT','UPDATE','DELETE')),
  false,
  'customer finance tables expose no direct write policy surface'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='operational_invoices' and qual ilike '%organization_id = current_organization_id()%'),
  'invoice reads remain organization-scoped'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='payments' and qual ilike '%organization_id%'),
  'payment reads remain organization-scoped'
);

select * from finish();
rollback;
