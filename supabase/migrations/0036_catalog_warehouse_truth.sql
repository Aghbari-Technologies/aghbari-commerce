-- Catalog availability must be resolved for the warehouse used by checkout.
-- The previous RPC selected the most recently updated balance across warehouses,
-- which could show a customer stock from the wrong location.

CREATE OR REPLACE FUNCTION public.get_catalog(
  p_search text default null,
  p_category_id uuid default null,
  p_limit integer default 24,
  p_offset integer default 0,
  p_warehouse_id uuid default null
)
RETURNS TABLE (
  id uuid,
  sku text,
  name text,
  unit text,
  category_id uuid,
  description text,
  status text,
  available_quantity integer,
  image_path text,
  authorized_price numeric,
  currency text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_org uuid := public.current_organization_id();
  v_customer uuid := public.current_customer_id();
  v_tier public.customer_tier;
BEGIN
  IF v_org IS NULL OR v_customer IS NULL THEN
    RAISE EXCEPTION USING errcode = '42501', message = 'authenticated customer context required';
  END IF;
  IF p_limit < 1 OR p_limit > 100 OR p_offset < 0 THEN
    RAISE EXCEPTION USING errcode = '22023', message = 'invalid pagination';
  END IF;
  IF p_warehouse_id IS NULL THEN
    RAISE EXCEPTION USING errcode = '22023', message = 'warehouse is required';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.warehouses
    WHERE id = p_warehouse_id AND organization_id = v_org AND is_active
  ) THEN
    RAISE EXCEPTION USING errcode = '42501', message = 'warehouse not available';
  END IF;

  SELECT c.tier INTO v_tier
  FROM public.customers c
  WHERE c.id = v_customer AND c.organization_id = v_org AND c.is_active;
  IF v_tier IS NULL THEN
    RAISE EXCEPTION USING errcode = '42501', message = 'active customer required';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.sku, p.name, p.unit, p.category_id, p.description, p.status,
    COALESCE((
      SELECT ib.quantity
      FROM public.inventory_balances ib
      WHERE ib.organization_id = v_org
        AND ib.warehouse_id = p_warehouse_id
        AND ib.product_id = p.id
    ), 0) AS available_quantity,
    (
      SELECT pm.storage_path
      FROM public.product_media pm
      WHERE pm.organization_id = v_org AND pm.product_id = p.id
      ORDER BY pm.sort_order, pm.created_at
      LIMIT 1
    ) AS image_path,
    (
      SELECT pp.amount
      FROM public.product_prices pp
      JOIN public.price_lists pl ON pl.id = pp.price_list_id
      WHERE pp.organization_id = v_org
        AND pp.product_id = p.id
        AND pl.organization_id = v_org
        AND pl.tier = v_tier
        AND pl.is_active
        AND pp.valid_from <= now()
        AND (pp.valid_to IS NULL OR pp.valid_to > now())
      ORDER BY pp.valid_from DESC
      LIMIT 1
    ) AS authorized_price,
    COALESCE((
      SELECT pl.currency
      FROM public.price_lists pl
      WHERE pl.organization_id = v_org AND pl.tier = v_tier AND pl.is_active
      LIMIT 1
    ), 'YER') AS currency
  FROM public.products p
  WHERE p.organization_id = v_org
    AND p.status = 'active'
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (
      p_search IS NULL OR p_search = ''
      OR p.name ILIKE '%' || p_search || '%'
      OR p.sku ILIKE '%' || p_search || '%'
      OR COALESCE(p.barcode, '') = p_search
    )
  ORDER BY p.name
  LIMIT p_limit OFFSET p_offset;
END;
$$;

DROP FUNCTION public.get_catalog(text, uuid, integer, integer);

REVOKE ALL ON FUNCTION public.get_catalog(text, uuid, integer, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_catalog(text, uuid, integer, integer, uuid) TO authenticated;

COMMENT ON FUNCTION public.get_catalog(text, uuid, integer, integer, uuid)
IS 'Server-authoritative customer catalog projection with warehouse-specific availability and authorized effective pricing.';
