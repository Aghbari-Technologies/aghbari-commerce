create table if not exists public.customer_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade,
  device_key_hash text not null,
  device_label text,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, customer_id, device_key_hash)
);
create unique index if not exists customer_one_active_device_idx on public.customer_devices(organization_id, customer_id) where is_active;
create index if not exists customer_devices_lookup_idx on public.customer_devices(organization_id, customer_id, is_active, last_seen_at desc);

create table if not exists public.device_change_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade,
  current_device_id uuid references public.customer_devices(id) on delete set null,
  requested_device_key_hash text not null,
  requested_device_label text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists device_change_requests_lookup_idx on public.device_change_requests(organization_id, customer_id, status, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  kind text not null check (kind in ('order','inventory','security','system','task')),
  title text not null,
  body text not null,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (customer_id is not null or recipient_user_id is not null)
);
create index if not exists notifications_customer_idx on public.notifications(organization_id, customer_id, created_at desc) where customer_id is not null;
create index if not exists notifications_user_idx on public.notifications(organization_id, recipient_user_id, created_at desc) where recipient_user_id is not null;

alter table public.customer_devices enable row level security;
alter table public.device_change_requests enable row level security;
alter table public.notifications enable row level security;

create policy customer_devices_read on public.customer_devices for select to authenticated using (organization_id = public.current_organization_id() and (customer_id = public.current_customer_id() or public.is_staff()));
create policy device_requests_read on public.device_change_requests for select to authenticated using (organization_id = public.current_organization_id() and (customer_id = public.current_customer_id() or public.is_staff()));
create policy notifications_read on public.notifications for select to authenticated using (organization_id = public.current_organization_id() and (customer_id = public.current_customer_id() or recipient_user_id = auth.uid() or public.is_staff()));
create policy notifications_update_self on public.notifications for update to authenticated using (organization_id = public.current_organization_id() and (customer_id = public.current_customer_id() or recipient_user_id = auth.uid())) with check (organization_id = public.current_organization_id() and (customer_id = public.current_customer_id() or recipient_user_id = auth.uid()));

create or replace function public.bind_customer_device(p_device_key_hash text, p_device_label text default null)
returns public.customer_devices language plpgsql security definer set search_path = public as $$
declare v_org uuid := public.current_organization_id(); v_customer uuid := public.current_customer_id(); v_device public.customer_devices;
begin
  if auth.uid() is null or v_customer is null or v_org is null then raise exception 'غير مصرح.'; end if;
  if p_device_key_hash is null or length(trim(p_device_key_hash)) < 32 or length(trim(p_device_key_hash)) > 256 then raise exception 'معرف الجهاز غير صالح.'; end if;
  if exists (select 1 from public.customer_devices where organization_id = v_org and customer_id = v_customer and is_active and device_key_hash <> trim(p_device_key_hash)) then raise exception 'الحساب مرتبط بجهاز آخر. يلزم طلب تغيير الجهاز.'; end if;
  insert into public.customer_devices(organization_id, customer_id, device_key_hash, device_label, is_active, last_seen_at, updated_at)
  values(v_org, v_customer, trim(p_device_key_hash), nullif(trim(p_device_label), ''), true, now(), now())
  on conflict (organization_id, customer_id, device_key_hash) do update set last_seen_at = now(), updated_at = now(), is_active = true returning * into v_device;
  return v_device;
end; $$;
revoke all on function public.bind_customer_device(text,text) from public;
grant execute on function public.bind_customer_device(text,text) to authenticated;

create or replace function public.request_customer_device_change(p_device_key_hash text, p_device_label text default null, p_reason text default null)
returns public.device_change_requests language plpgsql security definer set search_path = public as $$
declare v_org uuid := public.current_organization_id(); v_customer uuid := public.current_customer_id(); v_request public.device_change_requests; v_current uuid;
begin
  if auth.uid() is null or v_customer is null or v_org is null then raise exception 'غير مصرح.'; end if;
  if p_device_key_hash is null or length(trim(p_device_key_hash)) < 32 or length(trim(p_device_key_hash)) > 256 then raise exception 'معرف الجهاز غير صالح.'; end if;
  select id into v_current from public.customer_devices where organization_id = v_org and customer_id = v_customer and is_active limit 1;
  if exists (select 1 from public.device_change_requests where organization_id = v_org and customer_id = v_customer and status = 'pending') then raise exception 'يوجد طلب تغيير جهاز قيد المراجعة.'; end if;
  insert into public.device_change_requests(organization_id, customer_id, current_device_id, requested_device_key_hash, requested_device_label, reason)
  values(v_org, v_customer, v_current, trim(p_device_key_hash), nullif(trim(p_device_label), ''), nullif(trim(p_reason), '')) returning * into v_request;
  return v_request;
end; $$;
revoke all on function public.request_customer_device_change(text,text,text) from public;
grant execute on function public.request_customer_device_change(text,text,text) to authenticated;

create or replace function public.review_device_change_request(p_request_id uuid, p_approve boolean, p_reason text default null)
returns public.device_change_requests language plpgsql security definer set search_path = public as $$
declare v_org uuid := public.current_organization_id(); v_request public.device_change_requests;
begin
  if auth.uid() is null or v_org is null or not public.is_staff() then raise exception 'غير مصرح.'; end if;
  select * into v_request from public.device_change_requests where id = p_request_id and organization_id = v_org and status = 'pending' for update;
  if not found then raise exception 'طلب تغيير الجهاز غير موجود أو تمت معالجته.'; end if;
  if p_approve then
    update public.customer_devices set is_active = false, updated_at = now() where organization_id = v_org and customer_id = v_request.customer_id and is_active;
    insert into public.customer_devices(organization_id, customer_id, device_key_hash, device_label, is_active, last_seen_at, updated_at)
    values(v_org, v_request.customer_id, v_request.requested_device_key_hash, v_request.requested_device_label, true, now(), now())
    on conflict (organization_id, customer_id, device_key_hash) do update set is_active = true, last_seen_at = now(), updated_at = now();
  end if;
  update public.device_change_requests set status = case when p_approve then 'approved' else 'rejected' end, reviewed_by = auth.uid(), reviewed_at = now(), reason = coalesce(nullif(trim(p_reason), ''), reason) where id = v_request.id returning * into v_request;
  return v_request;
end; $$;
revoke all on function public.review_device_change_request(uuid,boolean,text) from public;
grant execute on function public.review_device_change_request(uuid,boolean,text) to authenticated;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'غير مصرح.'; end if;
  update public.notifications set read_at = coalesce(read_at, now()) where id = p_notification_id and organization_id = public.current_organization_id() and (customer_id = public.current_customer_id() or recipient_user_id = auth.uid());
  if not found then raise exception 'الإشعار غير موجود.'; end if;
end; $$;
revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;

create or replace function public.notify_order_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.to_status is distinct from old.to_status then
    insert into public.notifications(organization_id, customer_id, kind, title, body, entity_type, entity_id)
    select new.organization_id, o.customer_id, 'order', 'تحديث حالة الطلب', 'تم تحديث الطلب رقم ' || o.order_number::text || ' إلى: ' || new.to_status::text || '.', 'order', o.id
    from public.orders o where o.id = new.order_id;
  end if;
  return new;
end; $$;
revoke all on function public.notify_order_status_change() from public;
drop trigger if exists trg_order_status_notification on public.order_status_history;
create trigger trg_order_status_notification after insert on public.order_status_history for each row execute function public.notify_order_status_change();

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.device_change_requests;