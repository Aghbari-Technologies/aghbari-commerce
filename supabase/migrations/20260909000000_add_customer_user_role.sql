-- Customer accounts require an explicit customer role before invitation functions are created.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer';
