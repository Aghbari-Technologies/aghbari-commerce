begin;
select plan(12);

select has_table('public', 'customer_invitations', 'customer invitations table exists');
select has_column('public', 'customer_invitations', 'organization_id', 'invitation is tenant-bound');
select has_column('public', 'customer_invitations', 'customer_id', 'invitation is customer-bound');
select has_column('public', 'customer_invitations', 'recipient_email', 'invitation records recipient');
select has_column('public', 'customer_invitations', 'token_hash', 'only hashed token is persisted');
select has_column('public', 'customer_invitations', 'expires_at', 'invitation has expiry');
select has_column('public', 'customer_invitations', 'accepted_at', 'invitation tracks single-use acceptance');
select has_column('public', 'customer_invitations', 'revoked_at', 'invitation supports revocation');
select row_eq($$select relrowsecurity from pg_class where oid='public.customer_invitations'::regclass$$, row(true), 'invitation table has RLS enabled');
select has_function('public', 'create_customer_invitation', ARRAY['uuid','text'], 'staff invitation RPC exists');
select has_function('public', 'get_customer_invitation_for_acceptance', ARRAY['text'], 'acceptance lookup RPC exists');
select has_function('public', 'consume_customer_invitation', ARRAY['text','uuid'], 'single-use consumption RPC exists');

select * from finish();
rollback;
