-- Keep exactly one primary product image object per organization/product.
-- Storage upsert requires INSERT + SELECT + UPDATE permission on storage.objects.

CREATE POLICY "product_media_update_staff"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-media'
  AND is_staff()
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND (split_part(name, '/', 1))::uuid = current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = (split_part(objects.name, '/', 2))::uuid
      AND p.organization_id = current_organization_id()
  )
  AND split_part(name, '/', 3) ~* '^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|main)[.]webp$'
)
WITH CHECK (
  bucket_id = 'product-media'
  AND is_staff()
  AND array_length(string_to_array(name, '/'), 1) = 3
  AND split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND (split_part(name, '/', 1))::uuid = current_organization_id()
  AND split_part(name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = (split_part(objects.name, '/', 2))::uuid
      AND p.organization_id = current_organization_id()
  )
  AND split_part(name, '/', 3) ~* '^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|main)[.]webp$'
);

CREATE OR REPLACE FUNCTION public.register_product_media(
  p_product_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_byte_size bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_media_id uuid;
  v_object storage.objects%rowtype;
  v_object_mime text;
  v_object_size bigint;
BEGIN
  IF v_org IS NULL OR v_role NOT IN ('owner','admin','sales') THEN
    RAISE EXCEPTION USING errcode='42501',message='product media registration access required';
  END IF;
  IF p_product_id IS NULL OR p_storage_path IS NULL OR p_storage_path !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|main)[.]webp$' THEN
    RAISE EXCEPTION USING errcode='22023',message='invalid product media path';
  END IF;
  IF split_part(p_storage_path,'/',1)::uuid <> v_org OR split_part(p_storage_path,'/',2)::uuid <> p_product_id THEN
    RAISE EXCEPTION USING errcode='42501',message='product media tenant binding failed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id=p_product_id AND p.organization_id=v_org) THEN
    RAISE EXCEPTION USING errcode='P0002',message='product not found';
  END IF;
  IF lower(coalesce(p_mime_type,'')) <> 'image/webp' THEN
    RAISE EXCEPTION USING errcode='22023',message='product images must be WebP';
  END IF;
  IF p_width IS NULL OR p_height IS NULL OR p_width<1 OR p_height<1 OR p_width>4096 OR p_height>4096 THEN
    RAISE EXCEPTION USING errcode='22023',message='invalid product image dimensions';
  END IF;
  IF p_byte_size IS NULL OR p_byte_size<1 OR p_byte_size>5*1024*1024 THEN
    RAISE EXCEPTION USING errcode='22023',message='product image size must be between 1 byte and 5 MB';
  END IF;
  SELECT * INTO v_object FROM storage.objects WHERE bucket_id='product-media' AND name=p_storage_path;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING errcode='P0002',message='uploaded product media not found';
  END IF;
  v_object_mime := lower(coalesce(v_object.metadata->>'mimetype',''));
  v_object_size := nullif(v_object.metadata->>'size','')::bigint;
  IF v_object_mime <> 'image/webp' OR v_object_size IS NULL OR v_object_size <> p_byte_size THEN
    RAISE EXCEPTION USING errcode='22023',message='uploaded product media metadata mismatch';
  END IF;
  IF v_object.owner_id IS NOT NULL AND v_object.owner_id <> auth.uid()::text THEN
    RAISE EXCEPTION USING errcode='42501',message='product media owner mismatch';
  END IF;

  UPDATE public.product_media
  SET sort_order = sort_order + 1
  WHERE organization_id=v_org AND product_id=p_product_id AND storage_path<>p_storage_path;

  INSERT INTO public.product_media(
    organization_id,product_id,storage_path,mime_type,width,height,byte_size,sort_order
  )
  VALUES(v_org,p_product_id,p_storage_path,'image/webp',p_width,p_height,p_byte_size,0)
  ON CONFLICT (organization_id,storage_path)
  DO UPDATE SET
    product_id=EXCLUDED.product_id,
    mime_type=EXCLUDED.mime_type,
    width=EXCLUDED.width,
    height=EXCLUDED.height,
    byte_size=EXCLUDED.byte_size,
    sort_order=0
  RETURNING id INTO v_media_id;

  INSERT INTO public.audit_events(
    organization_id,actor_id,action,target_type,target_id,result,metadata
  )
  VALUES(
    v_org,auth.uid(),'product-media.register','product_media',v_media_id,'success',
    jsonb_build_object(
      'product_id',p_product_id,
      'mime_type','image/webp',
      'bytes',p_byte_size,
      'storage_mode',CASE WHEN p_storage_path LIKE '%/main.webp' THEN 'single-object' ELSE 'legacy' END
    )
  );
  RETURN v_media_id;
END;
$function$;
