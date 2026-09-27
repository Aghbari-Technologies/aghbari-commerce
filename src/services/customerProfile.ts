import { requireSupabase } from '../lib/supabase';

const MAX_NAME = 200;
const MAX_PHONE = 40;

export interface CustomerSelfProfileInput {
  name: string;
  phone?: string | null;
}

export function normalizeCustomerSelfProfileInput(input: CustomerSelfProfileInput): CustomerSelfProfileInput {
  const name = input.name.trim();
  const phone = String(input.phone ?? '').trim();
  if (!name || name.length > MAX_NAME) throw new Error('اسم العميل مطلوب وبحد أقصى 200 حرف.');
  if (phone.length > MAX_PHONE) throw new Error('رقم الهاتف طويل جدًا.');
  return { name, phone: phone || null };
}

export async function updateCustomerSelfProfile(input: CustomerSelfProfileInput) {
  const value = normalizeCustomerSelfProfileInput(input);
  const { data, error } = await requireSupabase().rpc('update_customer_self_profile', {
    p_name: value.name,
    p_phone: value.phone,
  });
  if (error) throw error;
  return data;
}
