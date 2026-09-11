begin;
select plan(26);

select has_table('public', 'customer_invitations', 'customer invitations table exists');
select has_column('public', 'customer_invitations', 'organization_id', 'invitation is tenant-bound');
select has_column('public', 'customer_invitations', 'customer_id', 'invitation is customer-bound');
select has_column('public', 'customer_invitations', 'recipient_email', 'invitation records recipient');
select has_column('public', 'customer_invitations', 'token_hash', 'only token digest is persisted');
select has_column('public', 'customer_invitations', 'expires_at', 'invitation has expiry');
select has_column('public', 'customer_invitations', 'accepted_at', 'invitation tracks single-use acceptance');
select has_column('public', 'customer_invitations', 'revoked_at', 'invitation supports revocation');
select ok((select relrowsecurity from pg_class where oid='public.customer_invitations'::regclass), 'invitation table has RLS enabled');

select has_function('public', 'create_customer_invitation', ARRAY['uuid','text'], 'staff invitation RPC exists');
select has_function('public', 'get_customer_invitation_for_acceptance', ARRAY['text'], 'acceptance lookup RPC exists');
select has_function('public', 'consume_customer_invitation', ARRAY['text','uuid'], 'single-use consumption RPC exists');
select ok(has_function_privilege('authenticated', 'public.create_customer_invitation(uuid,text)', 'execute'), 'authenticated may create invitations');
select ok(not has_function_privilege('anon', 'public.create_customer_invitation(uuid,text)', 'execute'), 'anon cannot create invitations');
select ok(has_function_privilege('anon', 'public.get_customer_invitation_for_acceptance(text)', 'execute'), 'anonymous acceptance lookup is executable');
select ok(not has_function_privilege('authenticated', 'public.consume_customer_invitation(text,uuid)', 'execute'), 'authenticated cannot consume invitations directly');
select ok(has_function_privilege('service_role', 'public.consume_customer_invitation(text,uuid)', 'execute'), 'service_role can consume invitations');

select ok((select prosecdef from pg_proc where oid='public.create_customer_invitation(uuid,text)'::regprocedure), 'create invitation uses SECURITY DEFINER');
select ok((select prosecdef from pg_proc where oid='public.get_customer_invitation_for_acceptance(text)'::regprocedure), 'lookup uses SECURITY DEFINER');
select ok((select prosecdef from pg_proc where oid='public.consume_customer_invitation(text,uuid)'::regprocedure), 'consume uses SECURITY DEFINER');
select ok(not exists (select 1 from information_schema.columns where table_schema='public' and table_name in ('orders','order_items','carts','cart_items','customer_price_tiers','order_templates','customer_credit_accounts','customer_ledger_entries','client_ui_settings') and column_name='company_id'), 'canonical B2B tables contain no company_id shadow column');
select ok(not exists (select 1 from pg_proc where proname='current_customer_company_id'), 'legacy company context helper is absent');
select ok((select coalesce(p.proconfig,'{}') @> array['search_path=""']::text[] from pg_proc p where p.oid='public.create_customer_invitation(uuid,text)'::regprocedure), 'create invitation pins empty search_path');
select ok((select coalesce(p.proconfig,'{}') @> array['search_path=""']::text[] from pg_proc p where p.oid='public.consume_customer_invitation(text,uuid)'::regprocedure), 'consume invitation pins empty search_path');
select ok(not has_function_privilege('public', 'public.get_customer_invitation_for_acceptance(text)', 'execute'), 'public role cannot invoke invitation lookup');
select ok(not has_function_privilege('public', 'public.consume_customer_invitation(text,uuid)', 'execute'), 'public role cannot consume invitations');

select * from finish();
rollback;
