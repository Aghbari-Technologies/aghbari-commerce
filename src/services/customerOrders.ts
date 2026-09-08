import { requireSupabase } from '../lib/supabase';
import type { OrderStatus } from '../domain/types';
import { retryRead } from '../lib/retry';

export interface CustomerOrderSummary {
  id: string;
  order_number: number;
  status: OrderStatus;
  total: number;
  currency: string;
  created_at: string;
}

export interface CustomerOrderDetail extends CustomerOrderSummary {
  updated_at: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES: ReadonlySet<string> = new Set(['draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

function assertDate(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim() || Number.isNaN(Date.parse(value))) throw new Error(`${label} غير صالح.`);
  return value;
}

export function assertCustomerOrderSummary(value: unknown): CustomerOrderSummary {
  if (!value || typeof value !== 'object') throw new Error('استجابة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || !UUID_PATTERN.test(item.id)) throw new Error('معرّف الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.order_number !== 'number' || !Number.isSafeInteger(item.order_number) || item.order_number <= 0) throw new Error('رقم الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.status !== 'string' || !ORDER_STATUSES.has(item.status)) throw new Error('حالة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  if (typeof item.total !== 'number' || !Number.isFinite(item.total) || item.total < 0) throw new Error('إجمالي الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if (typeof item.currency !== 'string' || !/^[A-Z]{3}$/.test(item.currency)) throw new Error('عملة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  assertDate(item.created_at, 'تاريخ الطلب');
  return { id: item.id, order_number: item.order_number, status: item.status as OrderStatus, total: item.total, currency: item.currency, created_at: item.created_at };
}

export async function getCustomerOrders(limit = 20): Promise<CustomerOrderSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const { data, error } = await retryRead(() => requireSupabase().from('orders').select('id,order_number,status,total,currency,created_at').order('created_at', { ascending: false }).limit(safeLimit).then((result) => { if (result.error) throw result.error; return result; }));
  return (data ?? []).map((item) => assertCustomerOrderSummary({ ...item, order_number: Number(item.order_number), total: typeof item.total === 'number' ? item.total : Number(item.total) }));
}

export async function getCustomerOrderDetail(id: string): Promise<CustomerOrderDetail> {
  if (!UUID_PATTERN.test(id)) throw new Error('معرّف الطلب غير صالح.');
  const { data, error } = await retryRead(() => requireSupabase().from('orders').select('id,order_number,status,total,currency,created_at,updated_at').eq('id', id).single().then((result) => { if (result.error) throw result.error; return result; }));
  if (!data) throw new Error('لم يتم العثور على الطلب.');
  const summary = assertCustomerOrderSummary({ ...data, order_number: Number(data.order_number), total: typeof data.total === 'number' ? data.total : Number(data.total) });
  return { ...summary, updated_at: assertDate(data.updated_at, 'تاريخ تحديث الطلب') };
}
