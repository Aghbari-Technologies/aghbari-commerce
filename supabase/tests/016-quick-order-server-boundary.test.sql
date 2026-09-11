begin;

select plan(8);

select ok(
  not has_function_privilege('anon','public.apply_quick_order(text,uuid,jsonb)','execute'),
  'anon cannot execute apply_quick_order'
);
select ok(
  has_function_privilege('authenticated','public.apply_quick_order(text,uuid,jsonb)','execute'),
  'authenticated can execute apply_quick_order'
);

set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub','0e81be51-6102-43e7-993c-0d31fa822f5d')::text,true);

select lives_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-20260911-001','a0000000-0000-4000-8000-000000000111','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  'authorized customer can commit a quick-order cart merge'
);
select lives_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-20260911-001','a0000000-0000-4000-8000-000000000111','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  'identical quick-order retry is idempotent'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-20260911-001','a0000000-0000-4000-8000-000000000111','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":2}]'::jsonb)$$,
  '40001',
  null,
  'changed quick-order payload is rejected for the same idempotency key'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-DUP-20260911','a0000000-0000-4000-8000-000000000111','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1},{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1}]'::jsonb)$$,
  '22023',
  null,
  'duplicate product lines are rejected server-side'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-OOS-20260911','a0000000-0000-4000-8000-000000000111','[{"product_id":"a0000000-0000-4000-8000-000000010011","quantity":1000}]'::jsonb)$$,
  'P0001',
  null,
  'insufficient inventory is rejected server-side'
);
select throws_ok(
  $$select public.apply_quick_order('PGTAP-QUICK-FOREIGN-20260911','b0000000-0000-4000-8000-000000000222','[{"product_id":"a0000000-0000-0000-0000-000000000001","quantity":1}]'::jsonb)$$,
  '42501',
  null,
  'foreign warehouse is rejected server-side'
);

select * from finish();
rollback;
