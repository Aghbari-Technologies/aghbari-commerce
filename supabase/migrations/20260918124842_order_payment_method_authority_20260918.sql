-- Restore the schema migration that exists in the live migration ledger but was
-- missing from the repository. The canonical order API uses this column as part
-- of server-authoritative payment selection and idempotency conflict checking.

begin;

alter table public.orders
  add column if not exists payment_method text not null default 'credit';

alter table public.orders
  add constraint orders_payment_method_chk
  check (payment_method = any (array['credit'::text, 'cash'::text, 'transfer'::text]));

comment on column public.orders.payment_method is
  'Server-authoritative payment method selected at checkout; valid values are credit, cash, transfer.';

commit;
