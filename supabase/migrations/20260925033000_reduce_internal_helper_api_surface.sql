-- RLS policies use this reader helper on protected organization-scoped SELECT paths.
-- Define it here so fresh databases contain the same contract as the live schema.
create or replace function public.is_staff_reader()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_role() in ('owner','admin','sales','warehouse','viewer');
$$;

-- Reduce exposed API surface for internal authorization helper SECURITY DEFINER functions used by RLS.
-- These helpers are authorization primitives used by protected server functions/RLS,
-- not application RPCs. Their direct PostgREST EXECUTE privilege is revoked.

revoke all on function public.current_role() from public, anon, authenticated;
revoke all on function public.current_customer_id() from public, anon, authenticated;
revoke all on function public.current_organization_id() from public, anon, authenticated;
revoke all on function public.is_staff() from public, anon, authenticated;

comment on function public.current_role() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.current_customer_id() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.current_organization_id() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.is_staff() is 'Internal authorization helper; direct API EXECUTE revoked.';
