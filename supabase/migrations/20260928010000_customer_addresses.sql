-- Canonical customer delivery addresses.
-- Customer-owned saved addresses are tenant/customer scoped.
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  district text,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(label)) between 1 and 80),
  check (length(trim(recipient_name)) between 1 and 120),
  check (length(trim(phone)) between 3 and 40),
  check (length(trim(address_line1)) between 1 and 240),
  check (address_line2 is null or length(trim(address_line2)) <= 240),
  check (length(trim(city)) between 1 and 100),
  check (district is null or length(trim(district)) <= 120),
  check (notes is null or length(trim(notes)) <= 300),
  unique (organization_id, id),
  constraint customer_addresses_customer_org_fk
    foreign key (organization_id, customer_id)
    references public.customers(organization_id, id)
    on delete cascade
);

create index if not exists customer_addresses_customer_idx
  on public.customer_addresses(customer_id, is_default desc, created_at desc);

create index if not exists customer_addresses_org_customer_idx
  on public.customer_addresses(organization_id, customer_id, created_at desc);

create unique index if not exists customer_addresses_one_default_idx
  on public.customer_addresses(customer_id)
  where is_default = true;

alter table public.customer_addresses enable row level security;
alter table public.customer_addresses force row level security;

revoke all on public.customer_addresses from anon, authenticated;
grant select on public.customer_addresses to authenticated;

drop policy if exists customer_addresses_select_own on public.customer_addresses;
create policy customer_addresses_select_own
  on public.customer_addresses
  for select
  to authenticated
  using (
    organization_id = public.current_organization_id()
    and customer_id = public.current_customer_id()
  );

create or replace function public.audit_customer_address_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  o uuid := coalesce(new.organization_id, old.organization_id);
  target uuid := coalesce(new.id, old.id);
  action_name text := case tg_op
    when 'INSERT' then 'customer.address_create'
    when 'UPDATE' then 'customer.address_update'
    else 'customer.address_delete'
  end;
begin
  insert into public.audit_events(organization_id, actor_id, action, target_type, target_id, result, metadata)
  values(o, auth.uid(), action_name, 'customer_address', target, 'success',
         jsonb_build_object('operation', tg_op));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists customer_addresses_audit on public.customer_addresses;
create trigger customer_addresses_audit
after insert or update or delete on public.customer_addresses
for each row execute function public.audit_customer_address_change();

create or replace function public.save_customer_address(
  p_address_id uuid,
  p_customer_id uuid,
  p_label text,
  p_recipient_name text,
  p_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_district text,
  p_notes text,
  p_is_default boolean
)
returns public.customer_addresses
language plpgsql
security definer
set search_path = ''
as $$
declare
  o uuid := public.current_organization_id();
  current_customer uuid := public.current_customer_id();
  r public.user_role := public.current_role();
  existing public.customer_addresses%rowtype;
  result_row public.customer_addresses%rowtype;
begin
  if auth.uid() is null or o is null or r is null then
    raise exception using errcode='42501', message='غير مصرح.';
  end if;

  if p_customer_id is null then
    raise exception using errcode='22023', message='معرف العميل مطلوب.';
  end if;

  if not (p_customer_id = current_customer or r in ('owner','admin','sales')) then
    raise exception using errcode='42501', message='لا تملك صلاحية إدارة هذا العنوان.';
  end if;

  if length(trim(coalesce(p_label,''))) not between 1 and 80
     or length(trim(coalesce(p_recipient_name,''))) not between 1 and 120
     or length(trim(coalesce(p_phone,''))) not between 3 and 40
     or length(trim(coalesce(p_address_line1,''))) not between 1 and 240
     or length(trim(coalesce(p_city,''))) not between 1 and 100 then
    raise exception using errcode='22023', message='بيانات العنوان الأساسية غير صالحة.';
  end if;

  if p_address_id is not null then
    select * into existing
    from public.customer_addresses
    where id=p_address_id
      and organization_id=o
      and customer_id=p_customer_id
    for update;

    if not found then
      raise exception using errcode='P0002', message='العنوان غير موجود.';
    end if;
  end if;

  if coalesce(p_is_default,false) then
    perform pg_advisory_xact_lock(hashtextextended(p_customer_id::text, 0));
    update public.customer_addresses
    set is_default=false, updated_at=now()
    where organization_id=o
      and customer_id=p_customer_id
      and (p_address_id is null or id<>p_address_id)
      and is_default;
  end if;

  if p_address_id is null then
    insert into public.customer_addresses(
      organization_id, customer_id, label, recipient_name, phone,
      address_line1, address_line2, city, district, notes, is_default
    )
    values(
      o, p_customer_id, btrim(p_label), btrim(p_recipient_name), btrim(p_phone),
      btrim(p_address_line1), nullif(btrim(coalesce(p_address_line2,'')),''),
      btrim(p_city), nullif(btrim(coalesce(p_district,'')),''),
      nullif(btrim(coalesce(p_notes,'')),''), coalesce(p_is_default,false)
    )
    returning * into result_row;
  else
    update public.customer_addresses
    set label=btrim(p_label),
        recipient_name=btrim(p_recipient_name),
        phone=btrim(p_phone),
        address_line1=btrim(p_address_line1),
        address_line2=nullif(btrim(coalesce(p_address_line2,'')),''),
        city=btrim(p_city),
        district=nullif(btrim(coalesce(p_district,'')),''),
        notes=nullif(btrim(coalesce(p_notes,'')),''),
        is_default=coalesce(p_is_default,false),
        updated_at=now()
    where id=p_address_id
      and organization_id=o
      and customer_id=p_customer_id
    returning * into result_row;

    if not found then
      raise exception using errcode='P0002', message='العنوان غير موجود.';
    end if;
  end if;

  return result_row;
end;
$$;

create or replace function public.create_customer_address(
  p_label text,
  p_recipient_name text,
  p_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_district text,
  p_notes text,
  p_is_default boolean
)
returns public.customer_addresses
language sql
security definer
set search_path = ''
as $$
  select * from public.save_customer_address(
    null,
    public.current_customer_id(),
    p_label,
    p_recipient_name,
    p_phone,
    p_address_line1,
    p_address_line2,
    p_city,
    p_district,
    p_notes,
    p_is_default
  );
$$;

create or replace function public.update_customer_address(
  p_address_id uuid,
  p_label text,
  p_recipient_name text,
  p_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_district text,
  p_notes text,
  p_is_default boolean
)
returns public.customer_addresses
language sql
security definer
set search_path = ''
as $$
  select * from public.save_customer_address(
    p_address_id,
    public.current_customer_id(),
    p_label,
    p_recipient_name,
    p_phone,
    p_address_line1,
    p_address_line2,
    p_city,
    p_district,
    p_notes,
    p_is_default
  );
$$;

create or replace function public.delete_customer_address(p_address_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  o uuid := public.current_organization_id();
  current_customer uuid := public.current_customer_id();
  r public.user_role := public.current_role();
  target public.customer_addresses%rowtype;
begin
  if auth.uid() is null or o is null or r is null then
    raise exception using errcode='42501', message='غير مصرح.';
  end if;

  select * into target
  from public.customer_addresses
  where id=p_address_id
    and organization_id=o
    and (customer_id=current_customer or r in ('owner','admin','sales'))
  for update;

  if not found then
    raise exception using errcode='P0002', message='العنوان غير موجود.';
  end if;

  delete from public.customer_addresses where id=target.id;
  return true;
end;
$$;

revoke all on function public.audit_customer_address_change() from public, anon, authenticated;
revoke all on function public.save_customer_address(uuid,uuid,text,text,text,text,text,text,text,text,boolean) from public, anon, authenticated;
revoke all on function public.create_customer_address(text,text,text,text,text,text,text,text,boolean) from public, anon;
grant execute on function public.create_customer_address(text,text,text,text,text,text,text,text,boolean) to authenticated;
revoke all on function public.update_customer_address(uuid,text,text,text,text,text,text,text,text,boolean) from public, anon;
grant execute on function public.update_customer_address(uuid,text,text,text,text,text,text,text,text,boolean) to authenticated;
revoke all on function public.delete_customer_address(uuid) from public, anon;
grant execute on function public.delete_customer_address(uuid) to authenticated;

comment on table public.customer_addresses is
  'Canonical customer-owned delivery addresses; tenant/customer scoped and not an alternate transactional truth.';