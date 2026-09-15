-- Customer accounts require an explicit customer role in the authoritative profile enum.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer';
