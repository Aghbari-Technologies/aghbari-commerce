
alter table public.supplier_ledger_entries
  add column if not exists payment_method public.payment_method,
  add column if not exists cash_account_id uuid,
  add column if not exists idempotency_payload_hash text;

create or replace function public.record_supplier_payment(
  p_supplier_bill_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_cash_account_id uuid default null,
  p_reference text default null,
  p_idempotency_key text default null
)
returns public.supplier_ledger_entries
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_key text := trim(coalesce(p_idempotency_key,''));
  v_bill public.supplier_bills%rowtype;
  v_account public.cash_accounts%rowtype;
  v_paid numeric(18,2);
  v_entry public.supplier_ledger_entries%rowtype;
  v_source uuid := gen_random_uuid();
  v_reference text := nullif(trim(p_reference),'');
  v_hash text := pg_catalog.md5(
    v_bill.id::text || '|' ||
    round(p_amount,2)::text || '|' ||
    p_method::text || '|' ||
    coalesce(p_cash_account_id::text,'') || '|' ||
    coalesce(v_reference,'')
  );
begin
  if v_org is null or v_role not in ('owner','admin') then
    raise exception using errcode='42501',message='supplier payment access required';
  end if;
  if length(v_key)<16 or length(v_key)>128 then
    raise exception using errcode='22023',message='invalid idempotency key';
  end if;
  if p_amount is null or p_amount<=0 then
    raise exception using errcode='22023',message='supplier payment amount must be positive';
  end if;

  perform pg_advisory_xact_lock(pg_catalog.hashtextextended(v_org::text||':supplier-payment:'||v_key,0));

  select * into v_bill
  from public.supplier_bills
  where id=p_supplier_bill_id and organization_id=v_org
  for update;

  if not found then
    raise exception using errcode='P0002',message='supplier bill not found';
  end if;
  if v_bill.status='void' then
    raise exception using errcode='22023',message='void supplier bill cannot be paid';
  end if;

  v_hash := pg_catalog.md5(
    v_bill.id::text || '|' ||
    round(p_amount,2)::text || '|' ||
    p_method::text || '|' ||
    coalesce(p_cash_account_id::text,'') || '|' ||
    coalesce(v_reference,'')
  );

  select * into v_entry
  from public.supplier_ledger_entries
  where organization_id=v_org and idempotency_key=v_key
  for update;

  if found then
    if coalesce(v_entry.idempotency_payload_hash,'') <> v_hash
       or v_entry.supplier_bill_id <> v_bill.id
       or v_entry.debit <> round(p_amount,2)
       or coalesce(v_entry.payment_method::text,'') <> p_method::text
       or coalesce(v_entry.cash_account_id,'00000000-0000-0000-0000-000000000000') <>
          coalesce(p_cash_account_id,'00000000-0000-0000-0000-000000000000')
       or coalesce(v_entry.reference,'') <> coalesce(v_reference,'') then
      raise exception using errcode='40001',message='supplier payment idempotency payload conflict';
    end if;
    return v_entry;
  end if;

  select coalesce(sum(e.debit),0) into v_paid
  from public.supplier_ledger_entries e
  where e.organization_id=v_org and e.supplier_bill_id=v_bill.id and e.entry_status='posted';

  if p_amount > v_bill.total-v_paid then
    raise exception using errcode='22003',message='supplier payment exceeds bill balance';
  end if;

  if p_method='cash' and p_cash_account_id is null then
    raise exception using errcode='22023',message='cash account required for cash payment';
  end if;

  if p_cash_account_id is not null then
    select * into v_account
    from public.cash_accounts
    where id=p_cash_account_id and organization_id=v_org and is_active
    for update;
    if not found or v_account.currency<>v_bill.currency then
      raise exception using errcode='22023',message='cash account currency mismatch';
    end if;
  end if;

  insert into public.supplier_ledger_entries(
    organization_id,supplier_id,supplier_bill_id,reference,description,debit,credit,currency,due_date,
    entry_status,source_type,source_id,idempotency_key,actor_id,payment_method,cash_account_id,idempotency_payload_hash
  )
  values(
    v_org,v_bill.supplier_id,v_bill.id,v_reference,'سداد فاتورة المورد '||v_bill.bill_number,
    round(p_amount,2),0,v_bill.currency,null,'posted','supplier_payment',v_source,v_key,auth.uid(),
    p_method,p_cash_account_id,v_hash
  )
  returning * into v_entry;

  if p_cash_account_id is not null then
    insert into public.cash_transactions(
      organization_id,cash_account_id,direction,amount,source_type,source_id,note,actor_id
    )
    values(v_org,p_cash_account_id,'out',round(p_amount,2),'supplier_payment',v_entry.id,v_reference,auth.uid());
  end if;

  select coalesce(sum(e.debit),0) into v_paid
  from public.supplier_ledger_entries e
  where e.organization_id=v_org and e.supplier_bill_id=v_bill.id and e.entry_status='posted';

  update public.supplier_bills
  set status=case when v_paid>=total then 'paid' else 'partially_paid' end,updated_at=now()
  where id=v_bill.id;

  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(
    v_org,auth.uid(),'supplier_payment.create','supplier_ledger_entry',v_entry.id,'success',
    jsonb_build_object('supplier_bill_id',v_bill.id,'amount',p_amount,'method',p_method)
  );

  insert into public.outbox_events(organization_id,aggregate_type,aggregate_id,event_type,payload)
  values(
    v_org,'supplier_bill',v_bill.id,'supplier.payment.recorded',
    jsonb_build_object('supplier_bill_id',v_bill.id,'supplier_payment_id',v_entry.id,'amount',p_amount)
  );

  return v_entry;
end;
$function$;

revoke execute on function public.record_supplier_payment(uuid,numeric,public.payment_method,uuid,text,text) from public,anon;
grant execute on function public.record_supplier_payment(uuid,numeric,public.payment_method,uuid,text,text) to authenticated;
