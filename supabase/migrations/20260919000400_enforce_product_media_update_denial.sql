-- Storage ACLs for storage.objects are managed by Supabase's storage owner role.
-- Enforce the application invariant at the RLS layer instead: authenticated/anonymous
-- clients must never rename/update product-media objects. The application replacement
-- path is delete + insert; service_role remains available for server-side maintenance.
DROP POLICY IF EXISTS product_media_update_deny ON storage.objects;
CREATE POLICY product_media_update_deny
ON storage.objects
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (bucket_id <> 'product-media')
WITH CHECK (bucket_id <> 'product-media');
