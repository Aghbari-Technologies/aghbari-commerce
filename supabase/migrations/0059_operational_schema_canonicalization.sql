-- Canonical operational schema reconciliation.
-- Reproduces the live customer/purchasing/cash surface without relying on
-- out-of-band database state. Safe on databases where the objects already exist.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace='public'::regnamespace AND typname='purchase_order_status') THEN
    CREATE TYPE public.purchase_order_status AS ENUM ('draft','submitted','approved','partially_received','received','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace='public'::regnamespace AND typname='cash_transaction_direction') THEN
    CREATE TYPE public.cash_transaction_direction AS ENUM ('in','out');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace='public'::regnamespace AND typname='payment_method') THEN
    CREATE TYPE public.payment_method AS ENUM ('cash','bank_transfer','card','other');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  supplier_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  purchase_order_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  status public.purchase_order_status NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'YER',
  subtotal numeric NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0),
  idempotency_key text NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  FOREIGN KEY (supplier_id, organization_id) REFERENCES public.suppliers(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (warehouse_id, organization_id) REFERENCES public.warehouses(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  purchase_order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_ordered integer NOT NULL CHECK (quantity_ordered > 0 AND quantity_ordered <= 100000),
  quantity_received integer NOT NULL DEFAULT 0 CHECK (quantity_received >= 0 AND quantity_received <= quantity_ordered),
  unit_cost numeric NOT NULL CHECK (unit_cost >= 0),
  line_total numeric GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (purchase_order_id, product_id),
  FOREIGN KEY (purchase_order_id, organization_id) REFERENCES public.purchase_orders(id, organization_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id, organization_id) REFERENCES public.products(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.purchase_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  purchase_order_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  receipt_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  idempotency_key text NOT NULL,
  received_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  FOREIGN KEY (purchase_order_id, organization_id) REFERENCES public.purchase_orders(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (warehouse_id, organization_id) REFERENCES public.warehouses(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.purchase_receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  receipt_id uuid NOT NULL,
  purchase_order_item_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_received integer NOT NULL CHECK (quantity_received > 0),
  unit_cost numeric NOT NULL CHECK (unit_cost >= 0),
  line_total numeric GENERATED ALWAYS AS (quantity_received * unit_cost) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (receipt_id, purchase_order_item_id),
  FOREIGN KEY (receipt_id, organization_id) REFERENCES public.purchase_receipts(id, organization_id) ON DELETE CASCADE,
  FOREIGN KEY (purchase_order_item_id, organization_id) REFERENCES public.purchase_order_items(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (product_id, organization_id) REFERENCES public.products(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.cash_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  branch_id uuid NOT NULL,
  name text NOT NULL,
  currency text NOT NULL DEFAULT 'YER',
  opening_balance numeric NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name),
  FOREIGN KEY (branch_id, organization_id) REFERENCES public.branches(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  cash_account_id uuid NOT NULL,
  direction public.cash_transaction_direction NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  source_type text NOT NULL,
  source_id uuid,
  note text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (cash_account_id, organization_id) REFERENCES public.cash_accounts(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  branch_id uuid NOT NULL,
  cash_account_id uuid,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'YER',
  description text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (branch_id, organization_id) REFERENCES public.branches(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (cash_account_id, organization_id) REFERENCES public.cash_accounts(id, organization_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  invoice_id uuid NOT NULL,
  cash_account_id uuid,
  amount numeric NOT NULL CHECK (amount > 0),
  method public.payment_method NOT NULL,
  reference text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (invoice_id, organization_id) REFERENCES public.operational_invoices(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (cash_account_id, organization_id) REFERENCES public.cash_accounts(id, organization_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS suppliers_org_idx ON public.suppliers(organization_id, name);
CREATE INDEX IF NOT EXISTS purchase_orders_org_status_idx ON public.purchase_orders(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS purchase_order_items_order_idx ON public.purchase_order_items(organization_id, purchase_order_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_order_idx ON public.purchase_receipts(organization_id, purchase_order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cash_transactions_account_idx ON public.cash_transactions(organization_id, cash_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS expenses_org_date_idx ON public.expenses(organization_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS payments_invoice_idx ON public.payments(organization_id, invoice_id, paid_at DESC);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='suppliers' AND policyname='suppliers_staff_read') THEN
    CREATE POLICY suppliers_staff_read ON public.suppliers FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_orders' AND policyname='purchase_orders_staff_read') THEN
    CREATE POLICY purchase_orders_staff_read ON public.purchase_orders FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_items' AND policyname='purchase_order_items_staff_read') THEN
    CREATE POLICY purchase_order_items_staff_read ON public.purchase_order_items FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_receipts' AND policyname='purchase_receipts_staff_read') THEN
    CREATE POLICY purchase_receipts_staff_read ON public.purchase_receipts FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_receipt_items' AND policyname='purchase_receipt_items_staff_read') THEN
    CREATE POLICY purchase_receipt_items_staff_read ON public.purchase_receipt_items FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cash_accounts' AND policyname='cash_accounts_staff_read') THEN
    CREATE POLICY cash_accounts_staff_read ON public.cash_accounts FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cash_transactions' AND policyname='cash_transactions_staff_read') THEN
    CREATE POLICY cash_transactions_staff_read ON public.cash_transactions FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expenses' AND policyname='expenses_staff_read') THEN
    CREATE POLICY expenses_staff_read ON public.expenses FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='payments_staff_read') THEN
    CREATE POLICY payments_staff_read ON public.payments FOR SELECT TO authenticated USING (organization_id=public.current_organization_id() AND public.is_staff());
  END IF;
END $$;

-- Execution privileges are finalized separately so the public/anon surface is explicit.
