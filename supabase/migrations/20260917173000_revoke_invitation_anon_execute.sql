-- Remove explicit anon EXECUTE grants left by default privileges from invitation RPCs.
-- Token lookup remains intentionally callable by anon; creation and consumption are not.

revoke execute on function public.create_customer_invitation(uuid,text) from anon;
revoke execute on function public.create_customer_invitation(uuid,text) from public;
revoke execute on function public.consume_customer_invitation(text,uuid) from anon;
revoke execute on function public.consume_customer_invitation(text,uuid) from public;
grant execute on function public.create_customer_invitation(uuid,text) to authenticated;
grant execute on function public.consume_customer_invitation(text,uuid) to service_role;
