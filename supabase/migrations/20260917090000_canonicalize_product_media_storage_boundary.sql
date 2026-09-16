-- Canonical product-media Storage boundary.
-- Corrects the late/live SELECT policy drift where the product lookup referenced
-- the policy table alias instead of the storage object's product path segment.
-- Keep UPDATE intentionally unsupported; replacement is delete + insert through the app pipeline.

DROP POLICY IF EXISTS product_media_select ON storage.objects;
DROP POLICY IF EXISTS product_media_insert ON storage.objects;
DROP POLICY IF EXISTS product_media_update ON storage.objects;
DROP POLICY IF EXISTS product_media_delete ON storage.objects;

CREATE POLICY product_media_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'product-media'
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND split_part(name, '/', 1)::uuid = public.current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = split_part(storage.objects.name, '/', 2)::uuid
      AND p.organization_id = public.current_organization_id()
      AND p.status = 'active'
  )
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);

CREATE POLICY product_media_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-media'
  AND public.is_staff()
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND split_part(name, '/', 1)::uuid = public.current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = split_part(storage.objects.name, '/', 2)::uuid
      AND p.organization_id = public.current_organization_id()
  )
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);

CREATE POLICY product_media_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'product-media'
  AND public.is_staff()
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND split_part(name, '/', 1)::uuid = public.current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = split_part(storage.objects.name, '/', 2)::uuid
      AND p.organization_id = public.current_organization_id()
  )
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);
