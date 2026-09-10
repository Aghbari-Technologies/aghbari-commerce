-- Enterprise B2B v3 runtime persistence and server-authoritative customer isolation.
-- Extends the existing operational schema; no parallel customer/order engine is introduced.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);
create index if not exists profiles_customer_idx on public.profiles(customer_id);
create index if not exists profiles_org_idx on public.profiles(organization_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  order_number bigint generated always as identity unique,
  status text not null default 'pending' check (status in ('draft','pending','confirmed','preparing','ready','completed','cancelled')),
  total numeric(18,2) not null default 0 check (total >= 0),
  currency text not null default 'SAR' check (currency ~ '^[A-Z]{3}$'),
  idempotency_key text not null,
  quantity_confirmed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, idempotency_key)
);
create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_company_created_idx on public.orders(company_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(18,3) not null check (quantity > 0),
  unit text not null,
  unit_price numeric(18,2) not null check (unit_price >= 0),
  line_total numeric(18,2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  unique(order_id, product_id)
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(company_id,user_id)
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict, quantity integer not null check(quantity>0 and quantity<=100000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(cart_id,product_id)
);

create table if not exists public.customer_price_tiers (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
  min_quantity integer not null check(min_quantity>0), unit_price numeric(18,2) not null check(unit_price>=0),
  currency text not null default 'SAR' check(currency ~ '^[A-Z]{3}$'), created_at timestamptz not null default now(),
  unique(customer_id,product_id,min_quantity)
);
create index if not exists customer_price_tiers_lookup_idx on public.customer_price_tiers(customer_id,product_id,min_quantity desc);

create table if not exists public.order_templates (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade, name text not null check(length(trim(name)) between 1 and 120),
  branch_label text not null default 'الرئيسي', created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.order_template_items (
  id uuid primary key default gen_random_uuid(), template_id uuid not null references public.order_templates(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict, quantity integer not null check(quantity>0), unit text not null,
  created_at timestamptz not null default now(), unique(template_id,product_id)
);

create table if not exists public.customer_credit_accounts (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null unique references public.customers(id) on delete cascade, currency text not null default 'SAR' check(currency ~ '^[A-Z]{3}$'),
  credit_limit numeric(18,2) not null default 0 check(credit_limit>=0), outstanding_balance numeric(18,2) not null default 0 check(outstanding_balance>=0),
  available_credit numeric(18,2) generated always as (greatest(credit_limit-outstanding_balance,0)) stored, updated_at timestamptz not null default now()
);
create table if not exists public.customer_ledger_entries (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade, reference text, description text not null,
  debit numeric(18,2) not null default 0 check(debit>=0), credit numeric(18,2) not null default 0 check(credit>=0), due_date date,
  status text not null default 'open', source_type text, source_id uuid, created_at timestamptz not null default now(), check(debit>0 or credit>0)
);
create index if not exists customer_ledger_customer_created_idx on public.customer_ledger_entries(customer_id,created_at desc);

create table if not exists public.client_ui_settings (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null unique references public.companies(id) on delete cascade,
  config jsonb not null default '{"showSearch":true,"showCategories":true,"showExcel":true,"showCredit":true,"showTemplates":true,"showInventory":true,"showRetailPrice":false,"showQuickOrder":true}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.current_customer_id() returns uuid language sql stable security definer set search_path=public as $$ select p.customer_id from public.profiles p where p.id=auth.uid() limit 1; $$;
create or replace function public.current_customer_company_id() returns uuid language sql stable security definer set search_path=public as $$ select p.organization_id from public.profiles p where p.id=auth.uid() limit 1; $$;

alter table public.profiles enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security;
alter table public.carts enable row level security; alter table public.cart_items enable row level security; alter table public.customer_price_tiers enable row level security;
alter table public.order_templates enable row level security; alter table public.order_template_items enable row level security; alter table public.customer_credit_accounts enable row level security;
alter table public.customer_ledger_entries enable row level security; alter table public.client_ui_settings enable row level security;

drop policy if exists profiles_self_select on public.profiles; create policy profiles_self_select on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists orders_customer_select on public.orders; create policy orders_customer_select on public.orders for select to authenticated using(customer_id=public.current_customer_id() and company_id=public.current_customer_company_id());
drop policy if exists orders_customer_insert on public.orders; create policy orders_customer_insert on public.orders for insert to authenticated with check(customer_id=public.current_customer_id() and company_id=public.current_customer_company_id() and created_by=auth.uid());
drop policy if exists order_items_customer_select on public.order_items; create policy order_items_customer_select on public.order_items for select to authenticated using(company_id=public.current_customer_company_id() and exists(select 1 from public.orders o where o.id=order_id and o.customer_id=public.current_customer_id() and o.company_id=public.current_customer_company_id()));
drop policy if exists carts_self_select on public.carts; create policy carts_self_select on public.carts for select to authenticated using(user_id=auth.uid() and customer_id=public.current_customer_id() and company_id=public.current_customer_company_id());
drop policy if exists cart_items_self_select on public.cart_items; create policy cart_items_self_select on public.cart_items for select to authenticated using(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid() and c.customer_id=public.current_customer_id() and c.company_id=public.current_customer_company_id()));
drop policy if exists price_tiers_customer_select on public.customer_price_tiers; create policy price_tiers_customer_select on public.customer_price_tiers for select to authenticated using(customer_id=public.current_customer_id() and company_id=public.current_customer_company_id());
drop policy if exists templates_customer_select on public.order_templates; create policy templates_customer_select on public.order_templates for select to authenticated using(customer_id=public.current_customer_id() and company_id=public.current_customer_company_id());
drop policy if exists template_items_customer_select on public.order_template_items; create policy template_items_customer_select on public.order_template_items for select to authenticated using(exists(select 1 from public.order_templates t where t.id=template_id and t.customer_id=public.current_customer_id() and t.company_id=public.current_customer_company_id()));
drop policy if exists credit_customer_select on public.customer_credit_accounts; create policy credit_customer_select on public.customer_credit_accounts for select to authenticated using(customer_id=public.current_customer_id() and company_id=public.current_customer_company_id());
drop policy if exists ledger_customer_select on public.customer_ledger_entries; create policy ledger_customer_select on public.customer_ledger_entries for select to authenticated using(customer_id=public.current_customer_id() and company_id=public.current_customer_company_id());
drop policy if exists ui_settings_customer_select on public.client_ui_settings; create policy ui_settings_customer_select on public.client_ui_settings for select to authenticated using(organization_id=public.current_customer_company_id());

create or replace function public.get_cart() returns table(product_id uuid,sku text,name text,unit text,quantity integer,authorized_price numeric,currency text) language plpgsql stable security definer set search_path=public as $$ begin return query select p.id,p.sku,p.name,p.unit,ci.quantity,coalesce((select cpt.unit_price from public.customer_price_tiers cpt where cpt.customer_id=public.current_customer_id() and cpt.product_id=p.id and cpt.company_id=public.current_customer_company_id() and cpt.min_quantity<=ci.quantity order by cpt.min_quantity desc limit 1),p.selling_price),coalesce((select c.currency from public.companies c where c.id=public.current_customer_company_id()),'SAR') from public.carts c join public.cart_items ci on ci.cart_id=c.id join public.products p on p.id=ci.product_id where c.user_id=auth.uid() and c.customer_id=public.current_customer_id() and c.company_id=public.current_customer_company_id(); end; $$;
create or replace function public.set_cart_item(p_product_id uuid,p_quantity integer) returns void language plpgsql security definer set search_path=public as $$ declare v_cart uuid;v_company uuid;v_customer uuid;v_available numeric;begin v_company:=public.current_customer_company_id();v_customer:=public.current_customer_id();if v_company is null or v_customer is null then raise exception 'customer context required';end if;select coalesce(sum(ib.quantity),0) into v_available from public.inventory_balances ib where ib.company_id=v_company and ib.product_id=p_product_id;if p_quantity<1 or p_quantity>100000 or p_quantity>v_available then raise exception 'quantity exceeds available stock';end if;insert into public.carts(company_id,customer_id,user_id) values(v_company,v_customer,auth.uid()) on conflict(company_id,user_id) do update set updated_at=now() returning id into v_cart;insert into public.cart_items(cart_id,product_id,quantity) values(v_cart,p_product_id,p_quantity) on conflict(cart_id,product_id) do update set quantity=excluded.quantity,updated_at=now();end; $$;
create or replace function public.remove_cart_item(p_product_id uuid) returns void language plpgsql security definer set search_path=public as $$ begin delete from public.cart_items ci using public.carts c where ci.cart_id=c.id and ci.product_id=p_product_id and c.user_id=auth.uid() and c.customer_id=public.current_customer_id() and c.company_id=public.current_customer_company_id();end; $$;
create or replace function public.clear_cart() returns void language plpgsql security definer set search_path=public as $$ begin delete from public.cart_items ci using public.carts c where ci.cart_id=c.id and c.user_id=auth.uid() and c.customer_id=public.current_customer_id() and c.company_id=public.current_customer_company_id();end; $$;
create or replace function public.create_order(p_idempotency_key text,p_warehouse_id uuid,p_lines jsonb) returns table(id uuid,order_number bigint) language plpgsql security definer set search_path=public as $$ declare v_company uuid;v_customer uuid;v_order uuid;v_number bigint;v_total numeric(18,2):=0;v_line jsonb;v_product record;v_qty numeric;v_price numeric;begin v_company:=public.current_customer_company_id();v_customer:=public.current_customer_id();if v_company is null or v_customer is null or auth.uid() is null then raise exception 'authenticated customer context required';end if;if not exists(select 1 from public.warehouses where id=p_warehouse_id and company_id=v_company and is_active=true) then raise exception 'warehouse is not available';end if;select o.id,o.order_number into v_order,v_number from public.orders o where o.company_id=v_company and o.idempotency_key=trim(p_idempotency_key) limit 1;if v_order is not null then return query select v_order,v_number;return;end if;if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)=0 or jsonb_array_length(p_lines)>100 then raise exception 'invalid order lines';end if;insert into public.orders(company_id,customer_id,warehouse_id,idempotency_key,created_by,quantity_confirmed_at,status) values(v_company,v_customer,p_warehouse_id,trim(p_idempotency_key),auth.uid(),now(),'pending') returning orders.id,orders.order_number into v_order,v_number;for v_line in select * from jsonb_array_elements(p_lines) loop v_qty:=(v_line->>'quantity')::numeric;if (v_line->>'productId') is null or v_qty<=0 or v_qty<>trunc(v_qty) then raise exception 'invalid order line';end if;select p.id,p.company_id,p.name,p.unit,p.selling_price into v_product from public.products p where p.id=(v_line->>'productId')::uuid and p.company_id=v_company and p.is_active=true for share;if not found then raise exception 'product is not available';end if;if v_qty>coalesce((select sum(ib.quantity) from public.inventory_balances ib where ib.company_id=v_company and ib.product_id=v_product.id),0) then raise exception 'insufficient stock';end if;select cpt.unit_price into v_price from public.customer_price_tiers cpt where cpt.company_id=v_company and cpt.customer_id=v_customer and cpt.product_id=v_product.id and cpt.min_quantity<=v_qty order by cpt.min_quantity desc limit 1;v_price:=coalesce(v_price,v_product.selling_price,0);insert into public.order_items(order_id,company_id,product_id,quantity,unit,unit_price,line_total) values(v_order,v_company,v_product.id,v_qty,v_product.unit,v_price,round(v_qty*v_price,2));v_total:=v_total+round(v_qty*v_price,2);end loop;update public.orders set total=v_total,updated_at=now() where orders.id=v_order;return query select v_order,v_number;end; $$;

grant execute on function public.current_customer_id() to authenticated;
grant execute on function public.current_customer_company_id() to authenticated;
grant execute on function public.get_cart() to authenticated;
grant execute on function public.set_cart_item(uuid,integer) to authenticated;
grant execute on function public.remove_cart_item(uuid) to authenticated;
grant execute on function public.clear_cart() to authenticated;
grant execute on function public.create_order(text,uuid,jsonb) to authenticated;
