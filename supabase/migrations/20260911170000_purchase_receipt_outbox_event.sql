-- Ensure every committed purchase receipt emits exactly one durable outbox event.
-- The receipt idempotency boundary prevents duplicate receipt rows, so this AFTER INSERT
-- trigger gives receiving the same durable event contract already used by order creation
-- and purchase-order creation/approval.

create or replace function public.enqueue_purchase_receipt_outbox()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.outbox_events(
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload
  )
  values (
    new.organization_id,
    'purchase_receipt',
    new.id,
    'purchase.received',
    pg_catalog.jsonb_build_object(
      'receipt_id', new.id,
      'receipt_number', new.receipt_number,
      'purchase_order_id', new.purchase_order_id
    )
  );
  return new;
end;
$$;

revoke all on function public.enqueue_purchase_receipt_outbox() from public, anon, authenticated;

drop trigger if exists purchase_receipt_outbox_after_insert on public.purchase_receipts;
create trigger purchase_receipt_outbox_after_insert
after insert on public.purchase_receipts
for each row
execute function public.enqueue_purchase_receipt_outbox();

comment on function public.enqueue_purchase_receipt_outbox() is
  'Emits one durable purchase.received outbox event for each committed purchase receipt.';
