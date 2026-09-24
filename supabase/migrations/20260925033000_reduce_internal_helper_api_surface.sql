-- Reduce exposed API surface for internal authorization helper SECURITY DEFINER functions.
-- These helpers are authorization primitives used by protected server functions/RLS,
-- not application RPCs. Their direct PostgREST EXECUTE privilege is revoked.

revoke all on function public.current_role() from public, anon, authenticated;
revoke all on function public.current_customer_id() from public, anon, authenticated;
revoke all on function public.current_organization_id() from public, anon, authenticated;
revoke all on function public.is_staff() from public, anon, authenticated;
revoke all on function public.is_staff_reader() from public, anon, authenticated;

comment on function public.current_role() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.current_customer_id() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.current_organization_id() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.is_staff() is 'Internal authorization helper; direct API EXECUTE revoked.';
comment on function public.is_staff_reader() is 'Internal authorization helper; direct API EXECUTE revoked.';
