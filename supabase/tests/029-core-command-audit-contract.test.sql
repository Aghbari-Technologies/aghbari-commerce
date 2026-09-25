begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

select ok(
  exists(select 1 from pg_proc where oid='public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)'::regprocedure),
  'record_payment six-argument command exists'
);
select ok(
  (select proconfig @> array['search_path=""'] from pg_proc where oid='public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)'::regprocedure),
  'record_payment pins empty search_path'
);
select ok(
  has_function_privilege('authenticated','public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)','EXECUTE'),
  'authenticated can execute record_payment'
);
select ok(
  not has_function_privilege('anon','public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)','EXECUTE'),
  'anon cannot execute record_payment'
);
select ok(
  position('isfinite' in lower(pg_get_functiondef('public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)'::regprocedure))) = 0,
  'record_payment does not use unsupported numeric isfinite'
);
select ok(
  position('idempotency_payload_hash' in pg_get_functiondef('public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)'::regprocedure)) > 0,
  'record_payment verifies idempotency payload'
);
select ok(
  position('audit_events' in pg_get_functiondef('public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)'::regprocedure)) > 0,
  'record_payment emits audit event'
);
select ok(
  position('outbox_events' in pg_get_functiondef('public.record_payment(uuid,numeric,public.payment_method,uuid,text,text)'::regprocedure)) > 0,
  'record_payment emits outbox event'
);
select ok(
  position('audit_events' in pg_get_functiondef('public.create_invoice_from_order(uuid,timestamptz)'::regprocedure)) > 0,
  'invoice creation emits audit event'
);
select ok(
  position('outbox_events' in pg_get_functiondef('public.create_invoice_from_order(uuid,timestamptz)'::regprocedure)) > 0,
  'invoice creation emits outbox event'
);
select ok(
  position('audit_events' in pg_get_functiondef('public.create_purchase_order(uuid,uuid,text,jsonb,text,text)'::regprocedure)) > 0,
  'purchase creation emits audit event'
);
select ok(
  position('outbox_events' in pg_get_functiondef('public.create_purchase_order(uuid,uuid,text,jsonb,text,text)'::regprocedure)) > 0,
  'purchase creation emits outbox event'
);
select ok(
  position('audit_events' in pg_get_functiondef('public.submit_purchase_order(uuid)'::regprocedure)) > 0,
  'purchase submission emits audit event'
);
select ok(
  position('outbox_events' in pg_get_functiondef('public.submit_purchase_order(uuid)'::regprocedure)) > 0,
  'purchase submission emits outbox event'
);
select ok(
  position('audit_events' in pg_get_functiondef('public.approve_purchase_order(uuid)'::regprocedure)) > 0,
  'purchase approval emits audit event'
);
select ok(
  position('outbox_events' in pg_get_functiondef('public.approve_purchase_order(uuid)'::regprocedure)) > 0,
  'purchase approval emits outbox event'
);
select ok(
  position('jsonb_array_length(p_lines)>100' in replace(replace(pg_get_functiondef('public.create_purchase_order(uuid,uuid,text,jsonb,text,text)'::regprocedure),' ',''),E'
','')) > 0,
  'purchase creation enforces the 100-line server cap'
);
select ok(
  position('jsonb_array_length(p_lines)>100' in replace(replace(pg_get_functiondef('public.receive_purchase_order(uuid,text,jsonb,text)'::regprocedure),' ',''),E'
','')) > 0,
  'receipt creation enforces the 100-line server cap'
);

select * from finish();
rollback;