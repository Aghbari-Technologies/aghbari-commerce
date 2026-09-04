-- Server-authoritative product-media registration.
-- The browser may upload only to a tenant/product-bound path; the canonical media row is
-- created through this command so product_media cannot be forged from the client.
create or replace function public.register_product_media(
  p_product_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_byte_size bigint
)
returns uuid
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_org uuid := public.current_organization_id();
  v_role public.user_role := public.current_role();
  v_media_id uuid;
  v_object storage.objects%rowtype;
begin
  if v_org is null or v_role not in ('owner','admin','sales') then
    raise exception using errcode='42501', message='product media registration access required';
  end if;
  if p_product_id is null or p_storage_path is null or p_storage_path !~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/[^/]+\\.(webp|png|jpe?g)$' then
    raise exception using errcode='22023', message='invalid product media path';
  end if;
  if split_part(p_storage_path,'/',1)::uuid <> v_org or split_part(p_storage_path,'/',2)::uuid <> p_product_id then
    raise exception using errcode='42501', message='product media tenant binding failed';
  end if;
  if not exists (select 1 from public.products p where p.id=p_product_id and p.organization_id=v_org) then
    raise exception using errcode='P0002', message='product not found';
  end if;
  if lower(coalesce(p_mime_type,'')) not in ('image/webp','image/png','image/jpeg') then
    raise exception using errcode='22023', message='unsupported product image type';
  end if;
  if p_width is null or p_height is null or p_width < 1 or p_height < 1 or p_width > 4096 or p_height > 4096 then
    raise exception using errcode='22023', message='invalid product image dimensions';
  end if;
  if p_byte_size is null or p_byte_size < 1 or p_byte_size > 5 * 1024 * 1024 then
    raise exception using errcode='22023', message='product image size must be between 1 byte and 5 MB';
  end if;

  select * into v_object
  from storage.objects
  where bucket_id='product-media' and name=p_storage_path;
  if not found then
    raise exception using errcode='P0002', message='uploaded product media not found';
  end if;
  if v_object.owner_id is not null and v_object.owner_id <> auth.uid() then
    raise exception using errcode='42501', message='product media owner mismatch';
  end if;

  insert into public.product_media(organization_id,product_id,storage_path,mime_type,width,height,byte_size,sort_order)
  values(
    v_org,p_product_id,p_storage_path,lower(p_mime_type),p_width,p_height,p_byte_size,
    coalesce((select max(sort_order)+1 from public.product_media where organization_id=v_org and product_id=p_product_id),0)
  )
  returning id into v_media_id;

  insert into public.audit_events(organization_id,actor_id,action,target_type,target_id,result,metadata)
  values(v_org,auth.uid(),'product-media.register','product_media',v_media_id,'success',jsonb_build_object('product_id',p_product_id,'mime_type',lower(p_mime_type),'bytes',p_byte_size));

  return v_media_id;
end;
$$;

grant execute on function public.register_product_media(uuid,text,text,integer,integer,bigint) to authenticated;
revoke execute on function public.register_product_media(uuid,text,text,integer,integer,bigint) from anon;

comment on function public.register_product_media(uuid,text,text,integer,integer,bigint) is 'Registers an uploaded product image only after server-side tenant/product/path/type/dimension/size validation.';
