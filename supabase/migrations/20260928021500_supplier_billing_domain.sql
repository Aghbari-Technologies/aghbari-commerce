-- Restore the canonical supplier billing domain that already exists in the
-- reviewed production schema. Mutations remain server-authoritative through RPCs.
begin;

create table if not exists public.supplier_bills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  supplier_id uuid not null references public.suppliers(id),
  purchase_order_id uuid references public.purchase_orders(id),
  bill_number text not null,
  status public.invoice_status not null default 'issued',
  currency text not null default 'YER',
  subtotal numeric not null,
  total numeric not null,
  due_at timestamptz,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_bills_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint supplier_bills_subtotal_check check (subtotal >= 0),
  constraint supplier_bills_total_check check (total > 0),
  constraint supplier_bills_org_supplier_bill_number_key unique (organization_id,supplier_id,bill_number)
);

create table if not exists public.supplier_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  supplier_id uuid not null references public.suppliers(id),
  supplier_bill_id uuid references public.supplier_bills(id),
  reference text,
  description text not null,
  debit numeric not null default 0,
  credit numeric not null default 0,
  currency text not null default 'YER',
  due_date date,
  entry_status text not null default 'posted',
  source_type text not null,
  source_id uuid not null,
  idempotency_key text not null,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  payment_method public.payment_method,
  cash_account_id uuid references public.cash_accounts(id),
  idempotency_payload_hash text,
  constraint supplier_ledger_entries_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint supplier_ledger_entries_debit_check check (debit >= 0),
  constraint supplier_ledger_entries_credit_check check (credit >= 0),
  constraint supplier_ledger_entries_check check (not (debit > 0 and credit > 0)),
  constraint supplier_ledger_entries_entry_status_check check (entry_status in ('posted','void'))
);

create unique index if not exists supplier_ledger_entries_organization_id_idempotency_key_key
  on public.supplier_ledger_entries(organization_id,idempotency_key);
create index if not exists supplier_bills_organization_supplier_idx
  on public.supplier_bills(organization_id,supplier_id);
create index if not exists supplier_bills_purchase_order_idx
  on public.supplier_bills(organization_id,purchase_order_id);
create index if not exists supplier_ledger_entries_organization_supplier_idx
  on public.supplier_ledger_entries(organization_id,supplier_id);
create index if not exists supplier_ledger_entries_supplier_bill_idx
  on public.supplier_ledger_entries(organization_id,supplier_bill_id);

alter table public.supplier_bills enable row level security;
alter table public.supplier_bills force row level security;
alter table public.supplier_ledger_entries enable row level security;
alter table public.supplier_ledger_entries force row level security;

drop policy if exists supplier_bills_select_staff on public.supplier_bills;
create policy supplier_bills_select_staff
on public.supplier_bills
for select to authenticated
using (organization_id=public.current_organization_id() and public.is_staff_reader());

drop policy if exists supplier_ledger_entries_select_staff on public.supplier_ledger_entries;
create policy supplier_ledger_entries_select_staff
on public.supplier_ledger_entries
for select to authenticated
using (organization_id=public.current_organization_id() and public.is_staff_reader());

revoke all on table public.supplier_bills, public.supplier_ledger_entries from anon;
revoke insert,update,delete on table public.supplier_bills, public.supplier_ledger_entries from authenticated;
grant select on table public.supplier_bills, public.supplier_ledger_entries to authenticated;

create or replace function public.create_supplier(
  p_name text,
  p_phone text default null,
  p_email text default null,
  p_address text default null
)
returns public.suppliers
language plpgsql
security definer
set search_path to ''
as $function$
declare
  o uuid:=public.current_organization_id();
  r public.user_role:=public.current_role();
  s public.suppliers%rowtype;
  n text:=trim(coalesce(p_name,''));
begin
  if o is null or r not in('owner','admin','warehouse') then
    raise exception using errcode='42501';
  end if;
  if n='' or length(n)>200 then
    raise exception using errcode='22023',message='invalid supplier name';
  end if;
  if p_phone is not null and length(trim(p_phone))>50 then
    raise exception using errcode='22023',message='invalid supplier phone';
  end if;
  if p_email is not null and length(trim(p_email))>320 then
    raise exception using errcode='22023',message='invalid supplier email';
  end if;
  if p_address is not null and length(trim(p_address))>500 then
    raise exception using errcode='22023',message='invalid supplier address';
  end if;
  insert into public.suppliers(organization_id,name,phone,email,address)
  values(o,n,nullif(trim(p_phone),''),nullif(trim(p_email),''),nullif(trim(p_address),''))
  returning * into s;
  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(o,auth.uid(),'supplier.create','supplier',s.id,'success',jsonb_build_object('name',s.name));
  return s;
end;
$function$;

create or replace function public.create_supplier_bill(
  p_supplier_id uuid,
  p_bill_number text,
  p_total numeric,
  p_currency text default 'YER',
  p_due_at timestamptz default null,
  p_purchase_order_id uuid default null,
  p_idempotency_key text default null,
  p_notes text default null
)
returns public.supplier_bills
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_key text := trim(coalesce(p_idempotency_key,''));
  v_currency text := upper(trim(coalesce(p_currency,'')));
  v_bill public.supplier_bills%rowtype;
  v_existing_key_bill public.supplier_bills%rowtype;
begin
  if v_org is null or v_role not in ('owner','admin') then
    raise exception using errcode='42501',message='supplier bill access required';
  end if;
  if p_supplier_id is null or not exists (
    select 1 from public.suppliers s
    where s.id=p_supplier_id and s.organization_id=v_org and s.is_active
  ) then
    raise exception using errcode='P0002',message='supplier not found';
  end if;
  if nullif(trim(coalesce(p_bill_number,'')),'') is null or length(trim(p_bill_number))>100 then
    raise exception using errcode='22023',message='supplier bill number required';
  end if;
  if p_total is null or p_total<=0 or p_total>99999999999999.99 then
    raise exception using errcode='22023',message='supplier bill total must be positive';
  end if;
  if length(v_currency)<>3 then
    raise exception using errcode='22023',message='invalid currency';
  end if;
  if length(v_key)<16 or length(v_key)>128 then
    raise exception using errcode='22023',message='invalid idempotency key';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_org::text||':supplier-bill:'||v_key,0));

  select b.* into v_existing_key_bill
  from public.supplier_ledger_entries e
  join public.supplier_bills b on b.id=e.supplier_bill_id and b.organization_id=e.organization_id
  where e.organization_id=v_org and e.idempotency_key=v_key
  limit 1;

  if found then
    if v_existing_key_bill.supplier_id<>p_supplier_id
       or v_existing_key_bill.bill_number<>trim(p_bill_number)
       or v_existing_key_bill.total<>round(p_total,2)
       or v_existing_key_bill.currency<>v_currency
       or coalesce(v_existing_key_bill.purchase_order_id,'00000000-0000-0000-0000-000000000000')<>coalesce(p_purchase_order_id,'00000000-0000-0000-0000-000000000000') then
      raise exception using errcode='40001',message='supplier bill idempotency payload conflict';
    end if;
    return v_existing_key_bill;
  end if;

  select * into v_bill
  from public.supplier_bills
  where organization_id=v_org and supplier_id=p_supplier_id and bill_number=trim(p_bill_number);

  if found then
    if v_bill.currency<>v_currency or v_bill.total<>round(p_total,2)
       or coalesce(v_bill.purchase_order_id,'00000000-0000-0000-0000-000000000000')<>coalesce(p_purchase_order_id,'00000000-0000-0000-0000-000000000000') then
      raise exception using errcode='40001',message='supplier bill payload conflict';
    end if;
    return v_bill;
  end if;

  if p_purchase_order_id is not null and not exists (
    select 1 from public.purchase_orders po
    where po.id=p_purchase_order_id and po.organization_id=v_org and po.supplier_id=p_supplier_id and po.status<>'cancelled'
  ) then
    raise exception using errcode='P0002',message='purchase order not found for supplier bill';
  end if;

  insert into public.supplier_bills(
    organization_id,supplier_id,purchase_order_id,bill_number,status,currency,subtotal,total,due_at,notes,created_by
  )
  values(
    v_org,p_supplier_id,p_purchase_order_id,trim(p_bill_number),'issued',v_currency,round(p_total,2),round(p_total,2),
    p_due_at,nullif(trim(p_notes),''),auth.uid()
  ) returning * into v_bill;

  insert into public.supplier_ledger_entries(
    organization_id,supplier_id,supplier_bill_id,reference,description,debit,credit,currency,due_date,entry_status,
    source_type,source_id,idempotency_key,actor_id
  )
  values(
    v_org,p_supplier_id,v_bill.id,v_bill.bill_number,'فاتورة مورد '||v_bill.bill_number,0,v_bill.total,v_currency,p_due_at::date,
    'posted','supplier_bill',v_bill.id,v_key,auth.uid()
  );

  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'supplier_bill.create','supplier_bill',v_bill.id,'success',
    jsonb_build_object('supplier_id',p_supplier_id,'total',v_bill.total,'currency',v_currency,'bill_number',v_bill.bill_number));
  insert into public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  values(v_org,'supplier_bill',v_bill.id,'supplier_bill.issued',
    jsonb_build_object('supplier_bill_id',v_bill.id,'bill_number',v_bill.bill_number,'total',v_bill.total));
  return v_bill;
end;
$function$;

grant execute on function public.create_supplier(text,text,text,text) to authenticated;
grant execute on function public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) to authenticated;
revoke execute on function public.create_supplier(text,text,text,text) from anon,public;
revoke execute on function public.create_supplier_bill(uuid,text,numeric,text,timestamptz,uuid,text,text) from anon,public;

commit;
