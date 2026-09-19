begin;

select plan(2);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.consume_customer_invitation(text,uuid)',
    'EXECUTE'
  ),
  'Authenticated users cannot execute the invitation-consumption SECURITY DEFINER RPC'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.consume_customer_invitation(text,uuid)',
    'EXECUTE'
  ),
  'service_role retains execution for the authenticated invitation edge-function path'
);

select * from finish();
rollback;
