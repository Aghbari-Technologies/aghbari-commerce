-- Defense-in-depth for product media storage.
-- Application processing already converts uploads to WebP and caps output at 5 MiB;
-- the storage bucket must enforce the same boundary server-side.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'product-media') then
    raise exception 'Required product-media bucket does not exist';
  end if;

  update storage.buckets
  set
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/webp']::text[]
  where id = 'product-media';
end;
$$;
