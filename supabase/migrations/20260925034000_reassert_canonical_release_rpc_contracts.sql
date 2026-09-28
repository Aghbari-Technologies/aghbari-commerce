-- Reassert canonical release RPC contracts so the release audit can prove
-- every literal frontend RPC call from migration history without changing API policy.
create or replace function public.list_organization_users()
returns table(user_id uuid,email text,role public.user_role,customer_id uuid,created_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select p.id,u.email::text,p.role,p.customer_id,p.created_at
  from public.profiles p
  join auth.users u on u.id=p.id
  where p.organization_id=public.current_organization_id()
    and public.current_role() in ('owner','admin')
  order by p.created_at,p.id
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'غير مصرح.'; end if;
  update public.notifications
  set read_at=coalesce(read_at,now())
  where id=p_notification_id
    and organization_id=public.current_organization_id()
    and (customer_id=public.current_customer_id() or recipient_user_id=auth.uid());
  if not found then raise exception 'الإشعار غير موجود.'; end if;
end;
$$;

revoke all on function public.list_organization_users() from public,anon;
revoke all on function public.mark_notification_read(uuid) from public,anon;
grant execute on function public.list_organization_users() to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;