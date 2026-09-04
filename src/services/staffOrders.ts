import type { OrderStatus } from '../domain/types';
import { requireSupabase } from '../lib/supabase';

export interface StaffOrderSummary {
  id: string;
  order_number: number;
  customer_id: string;
  customer_name: string;
  warehouse_id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export async function getStaffOrders(limit = 50): Promise<StaffOrderSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const { data, error } = await requireSupabase()
    .from('orders')
    .select('id,order_number,customer_id,warehouse_id,status,total,currency,created_at,updated_at,customers(name)')
    .order('created_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []).map((row) => {
    const item = row as typeof row & { customers?: { name?: string } | null };
    return { ...item, customer_name: item.customers?.name ?? 'عميل غير معروف' } as StaffOrderSummary;
  });
}

export async function transitionOrder(orderId: string, toStatus: OrderStatus): Promise<StaffOrderSummary> {
  if (!orderId || !toStatus) throw new Error('بيانات انتقال الطلب غير مكتملة.');
  const { data, error } = await requireSupabase().rpc('transition_order', { p_order_id: orderId, p_to_status: toStatus });
  if (error) throw error;
  if (!data) throw new Error('لم يتم العثور على الطلب بعد تنفيذ الانتقال.');
  return data as StaffOrderSummary;
}
