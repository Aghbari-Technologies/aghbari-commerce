import { requireSupabase } from '../lib/supabase';
import type { CustomerTier } from '../domain/types';

export interface StaffCustomer {
  id: string;
  name: string;
  phone: string | null;
  tier: CustomerTier;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCustomers(limit = 200) {
  const { data, error } = await requireSupabase()
    .from('customers')
    .select('id,name,phone,tier,is_active,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 500));
  if (error) throw error;
  return (data ?? []) as StaffCustomer[];
}

export async function createCustomer(name: string, phone: string, tier: CustomerTier) {
  const { data, error } = await requireSupabase().rpc('create_customer', {
    p_name: name,
    p_phone: phone || null,
    p_tier: tier
  });
  if (error) throw error;
  return data as StaffCustomer;
}

export async function setCustomerTier(customerId: string, tier: CustomerTier) {
  const { data, error } = await requireSupabase().rpc('set_customer_tier', {
    p_customer_id: customerId,
    p_tier: tier
  });
  if (error) throw error;
  return data as StaffCustomer;
}

export async function setCustomerActive(customerId: string, isActive: boolean) {
  const { data, error } = await requireSupabase().rpc('set_customer_active', {
    p_customer_id: customerId,
    p_is_active: isActive
  });
  if (error) throw error;
  return data as StaffCustomer;
}
