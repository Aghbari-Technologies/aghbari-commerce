-- Storage policy checks must not inherit the read-only visibility rule of public.products.
-- products_read intentionally hides inactive products from SELECT. The Storage write/delete
-- boundary, however, is an organization-ownership check and must remain independent of that
-- read policy. This SECURITY DEFINER helper returns only the boolean ownership fact.

CREATE OR REPLACE FUNCTION public.product_belongs_to_current_organization(p_product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_staff()
     AND EXISTS (
       SELECT 1
       FROM public.products p
       WHERE p.id = p_product_id
         AND p.organization_id = public.current_organization_id()
     );
$$;

REVOKE EXECUTE ON FUNCTION public.product_belongs_to_current_organization(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.product_belongs_to_current_organization(uuid) TO authenticated;

DROP POLICY IF EXISTS product_media_insert ON storage.objects;

CREATE POLICY product_media_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-media'
  AND public.is_staff()
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND split_part(name, '/', 1)::uuid = public.current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND public.product_belongs_to_current_organization(split_part(name, '/', 2)::uuid)
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);

DROP POLICY IF EXISTS product_media_delete ON storage.objects;

CREATE POLICY product_media_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'product-media'
  AND public.is_staff()
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND split_part(name, '/', 1)::uuid = public.current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND public.product_belongs_to_current_organization(split_part(name, '/', 2)::uuid)
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);
