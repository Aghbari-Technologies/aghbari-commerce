-- Customer order templates are durable business data, never browser-only state.
-- Keep the existing customer-owned RLS boundary and make the JSON payload fail closed.

alter table public.order_templates
  drop constraint if exists order_templates_lines_is_array;
alter table public.order_templates
  add constraint order_templates_lines_is_array
  check (jsonb_typeof(lines) = 'array');

alter table public.order_templates
  drop constraint if exists order_templates_lines_count;
alter table public.order_templates
  add constraint order_templates_lines_count
  check (jsonb_array_length(lines) between 1 and 100);

revoke all on table public.order_templates from anon;
grant select, insert, update, delete on table public.order_templates to authenticated;

comment on table public.order_templates is 'Durable customer-owned B2B order templates; browser storage is not authoritative.';
