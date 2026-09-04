import { requireSupabase } from '../lib/supabase';
import type { OrderStatus } from '../domain/types';

export interface CustomerOrderSummary {
  id: string;
  order_number: number;
  status: OrderStatus;
  total: number;
  currency: string;
  created_at: string;
}

export async function getCustomerOrders(limit = 20): Promise<CustomerOrderSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const { data, error } = await requireSupabase()
    .from('orders')
    .select('id,order_number,status,total,currency,created_at')
    .order('created_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []) as CustomerOrderSummary[];
}
