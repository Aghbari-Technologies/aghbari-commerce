-- Split customer-facing profiles from the read-only staff viewer role.
-- Keep the enum extension isolated so subsequent migrations can safely use the new value.
alter type public.user_role add value if not exists 'customer';
