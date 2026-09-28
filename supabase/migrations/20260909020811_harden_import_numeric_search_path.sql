-- Harden import numeric parser against search_path manipulation.
create or replace function public.try_parse_import_numeric(p_value text)
returns numeric
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
begin
  if p_value is null or btrim(p_value) = '' then
    return null;
  end if;
  if btrim(p_value) !~ '^[+-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)$' then
    return null;
  end if;
  return btrim(p_value)::numeric;
exception when numeric_value_out_of_range or invalid_text_representation then
  return null;
end;
$$;
