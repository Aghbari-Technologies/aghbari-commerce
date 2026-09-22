begin;

-- Persist the server-authoritative payment method required by create_order.
alter table public.orders
  add column if not exists payment_method text;

update public.orders
set payment_method = 'credit'
where payment_method is null;

alter table public.orders
  alter column payment_method set default 'credit',
  alter column payment_method set not null;

alter table public.orders
  drop constraint if exists orders_payment_method_chk;

alter table public.orders
  add constraint orders_payment_method_chk
  check (payment_method in ('credit', 'cash', 'transfer'));

commit;
