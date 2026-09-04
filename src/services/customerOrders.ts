import { requireSupabase } from '../lib/supabase';
import type { OrderStatus } from '../domain/types';
import { retryRead } from '../lib/retry';

export interface CustomerOrderSummary { id: string; order_number: number; status: OrderStatus; total: number; currency: string; created_at: string; }

type RawCustomerOrder = Omit<CustomerOrderSummary, 'order_number' | 'total'> & { order_number: unknown; total: unknown };

function finiteNumber(value: unknown): number { const parsed = typeof value === 'number' ? value : Number(value); if (!Number.isFinite(parsed) || parsed < 0) throw new Error('بيانات إجمالي الطلب غير صالحة.'); return parsed; }
export async function getCustomerOrders(limit = 20): Promise<CustomerOrderSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const { data } = await retryRead(() => requireSupabase().from('orders').select('id,order_number,status,total,currency,created_at').order('created_at', { ascending: false }).limit(safeLimit).then((result) => { if (result.error) throw result.error; return result; }));
  return (data as RawCustomerOrder[] | null ?? []).map((item: RawCustomerOrder) => ({ ...(item as Omit<CustomerOrderSummary, 'order_number' | 'total'>), order_number: Number(item.order_number), total: finiteNumber(item.total) })) as CustomerOrderSummary[];
}
