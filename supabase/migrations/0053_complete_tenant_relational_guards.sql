-- Tenant relational guards for the authoritative organization-based schema.
-- This migration intentionally owns only composite uniqueness/FK guards that
-- prevent cross-tenant relationships. Product-media Storage policies remain
-- authoritative from migration 0020_product_media_policy_and_registration_hardening.sql.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.branches'::regclass AND conname='branches_id_organization_unique') THEN
    ALTER TABLE public.branches ADD CONSTRAINT branches_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.categories'::regclass AND conname='categories_id_organization_unique') THEN
    ALTER TABLE public.categories ADD CONSTRAINT categories_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.warehouses'::regclass AND conname='warehouses_id_organization_unique') THEN
    ALTER TABLE public.warehouses ADD CONSTRAINT warehouses_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.products'::regclass AND conname='products_id_organization_unique') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.customers'::regclass AND conname='customers_id_organization_unique') THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.orders'::regclass AND conname='orders_id_organization_unique') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.order_items'::regclass AND conname='order_items_id_organization_unique') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_id_organization_unique UNIQUE (id, organization_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.order_status_history'::regclass AND conname='order_status_history_id_organization_unique') THEN
    ALTER TABLE public.order_status_history ADD CONSTRAINT order_status_history_id_organization_unique UNIQUE (id, organization_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.warehouses'::regclass AND conname='warehouses_branch_organization_fk') THEN
    ALTER TABLE public.warehouses
      ADD CONSTRAINT warehouses_branch_organization_fk
      FOREIGN KEY (branch_id, organization_id)
      REFERENCES public.branches (id, organization_id)
      ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.categories'::regclass AND conname='categories_parent_organization_fk') THEN
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_parent_organization_fk
      FOREIGN KEY (parent_id, organization_id)
      REFERENCES public.categories (id, organization_id)
      ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.products'::regclass AND conname='products_category_organization_fk') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_organization_fk
      FOREIGN KEY (category_id, organization_id)
      REFERENCES public.categories (id, organization_id)
      ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.inventory_balances'::regclass AND conname='inventory_balances_product_organization_fk') THEN
    ALTER TABLE public.inventory_balances
      ADD CONSTRAINT inventory_balances_product_organization_fk
      FOREIGN KEY (product_id, organization_id)
      REFERENCES public.products (id, organization_id)
      ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.inventory_movements'::regclass AND conname='inventory_movements_product_organization_fk') THEN
    ALTER TABLE public.inventory_movements
      ADD CONSTRAINT inventory_movements_product_organization_fk
      FOREIGN KEY (product_id, organization_id)
      REFERENCES public.products (id, organization_id)
      ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.order_items'::regclass AND conname='order_items_order_organization_fk') THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_order_organization_fk
      FOREIGN KEY (order_id, organization_id)
      REFERENCES public.orders (id, organization_id)
      ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.order_status_history'::regclass AND conname='order_history_order_organization_fk') THEN
    ALTER TABLE public.order_status_history
      ADD CONSTRAINT order_history_order_organization_fk
      FOREIGN KEY (order_id, organization_id)
      REFERENCES public.orders (id, organization_id)
      ON DELETE CASCADE;
  END IF;
END $$;

COMMENT ON CONSTRAINT warehouses_branch_organization_fk ON public.warehouses IS 'Warehouse branch must belong to the same organization as the warehouse.';
COMMENT ON CONSTRAINT categories_parent_organization_fk ON public.categories IS 'Category hierarchy cannot reference a parent from another organization.';
COMMENT ON CONSTRAINT products_category_organization_fk ON public.products IS 'Product category must belong to the same organization as the product.';
COMMENT ON CONSTRAINT inventory_balances_product_organization_fk ON public.inventory_balances IS 'Inventory balance cannot reference a product from another organization.';
COMMENT ON CONSTRAINT inventory_movements_product_organization_fk ON public.inventory_movements IS 'Inventory movement cannot reference a product from another organization.';
COMMENT ON CONSTRAINT order_items_order_organization_fk ON public.order_items IS 'Order item cannot reference an order from another organization.';
COMMENT ON CONSTRAINT order_history_order_organization_fk ON public.order_status_history IS 'Order history cannot reference an order from another organization.';
