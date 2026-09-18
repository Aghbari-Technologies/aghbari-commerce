begin;
select plan(3);
select is(has_function_privilege('anon','public.get_customer_invitation_for_acceptance(text)','execute'),false,'anon cannot execute invitation lookup RPC directly');
select is(has_function_privilege('authenticated','public.get_customer_invitation_for_acceptance(text)','execute'),false,'authenticated clients cannot execute invitation lookup RPC directly');
select is(has_function_privilege('service_role','public.get_customer_invitation_for_acceptance(text)','execute'),true,'service role can execute invitation lookup RPC');
select * from finish();
rollback;
