-- Runtime repair: make product-media authorization self-contained at the Storage RLS boundary.
-- This avoids relying on helper visibility/privilege behavior inside storage.objects RLS
-- while preserving tenant + staff + canonical-path enforcement.
DROP POLICY IF EXISTS product_media_insert ON storage.objects;
DROP POLICY IF EXISTS product_media_select ON storage.objects;
DROP POLICY IF EXISTS product_media_delete ON storage.objects;
DROP POLICY IF EXISTS product_media_update ON storage.objects;

CREATE POLICY product_media_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'product-media'
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id::text = split_part(name, '/', 2)
      AND p.organization_id::text = split_part(name, '/', 1)
      AND p.status = 'active'
  )
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);

CREATE POLICY product_media_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-media'
  AND owner_id = auth.uid()::text
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = (
    SELECT p.organization_id::text FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','admin','sales','warehouse')
  )
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id::text = split_part(name, '/', 2)
      AND p.organization_id::text = split_part(name, '/', 1)
  )
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);

CREATE POLICY product_media_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-media'
  AND owner_id = auth.uid()::text
  AND split_part(name, '/', 1) = (SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid())
)
WITH CHECK (
  bucket_id = 'product-media'
  AND owner_id = auth.uid()::text
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) = (SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid())
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id::text = split_part(name, '/', 2)
      AND p.organization_id::text = split_part(name, '/', 1)
  )
  AND split_part(name, '/', 3) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.]webp$'
);

CREATE POLICY product_media_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'product-media'
  AND owner_id = auth.uid()::text
  AND split_part(name, '/', 1) = (SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid())
);
