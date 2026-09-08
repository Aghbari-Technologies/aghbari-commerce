import type { OrderStatus } from '../domain/types';
import { requireSupabase } from '../lib/supabase';
import { retryRead } from '../lib/retry';

export interface CustomerOrderSummary { id: string; order_number: number; status: OrderStatus; total: number; currency: string; created_at: string; }
export interface CustomerOrderDetail extends CustomerOrderSummary { updated_at: string; history: CustomerOrderHistoryItem[]; }
export interface CustomerOrderHistoryItem { id: string; from_status: OrderStatus | null; to_status: OrderStatus; created_at: string; }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_STATUSES: ReadonlySet<string> = new Set(['draft','pending','confirmed','preparing','ready','completed','cancelled']);
function assertDate(value: unknown, label: string) { if (typeof value !== 'string' || !value.trim() || Number.isNaN(Date.parse(value))) throw new Error(`${label} غير صالح.`); return value; }
export function assertCustomerOrderSummary(value: unknown): CustomerOrderSummary {
  if (!value || typeof value !== 'object') throw new Error('استجابة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  const item=value as Record<string,unknown>;
  if(typeof item.id!=='string'||!UUID_PATTERN.test(item.id)) throw new Error('معرّف الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if(typeof item.order_number!=='number'||!Number.isSafeInteger(item.order_number)||item.order_number<=0) throw new Error('رقم الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if(typeof item.status!=='string'||!ORDER_STATUSES.has(item.status)) throw new Error('حالة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  if(typeof item.total!=='number'||!Number.isFinite(item.total)||item.total<0) throw new Error('إجمالي الطلب غير صالح. لم يتم إثبات نجاح العملية.');
  if(typeof item.currency!=='string'||!/^[A-Z]{3}$/.test(item.currency)) throw new Error('عملة الطلب غير صالحة. لم يتم إثبات نجاح العملية.');
  assertDate(item.created_at,'تاريخ الطلب');
  return {id:item.id,order_number:item.order_number,status:item.status as OrderStatus,total:item.total,currency:item.currency,created_at:item.created_at};
}
export async function getCustomerOrders(limit=20): Promise<CustomerOrderSummary[]> { const safeLimit=Math.min(Math.max(Math.trunc(limit),1),50); const {data,error}=await retryRead(()=>requireSupabase().from('orders').select('id,order_number,status,total,currency,created_at').order('created_at',{ascending:false}).limit(safeLimit).then(result=>{if(result.error)throw result.error;return result;})); return (data??[]).map(item=>assertCustomerOrderSummary({...item,order_number:Number(item.order_number),total:typeof item.total==='number'?item.total:Number(item.total)})); }
export async function getCustomerOrderDetail(id:string): Promise<CustomerOrderDetail> {
  if(!UUID_PATTERN.test(id)) throw new Error('معرّف الطلب غير صالح.');
  const {data,error}=await retryRead(()=>requireSupabase().from('orders').select('id,order_number,status,total,currency,created_at,updated_at').eq('id',id).single().then(result=>{if(result.error)throw result.error;return result;}));
  if(!data) throw new Error('لم يتم العثور على الطلب.');
  const summary=assertCustomerOrderSummary({...data,order_number:Number(data.order_number),total:typeof data.total==='number'?data.total:Number(data.total)});
  const historyResult=await retryRead(()=>requireSupabase().from('order_status_history').select('id,from_status,to_status,created_at').eq('order_id',id).order('created_at',{ascending:true}));
  if(historyResult.error) throw historyResult.error;
  const history=(historyResult.data??[]).map((item)=>{if(typeof item.id!=='string'||!UUID_PATTERN.test(item.id)) throw new Error('سجل حالة الطلب غير صالح.'); if(typeof item.to_status!=='string'||!ORDER_STATUSES.has(item.to_status)) throw new Error('حالة في سجل الطلب غير صالحة.'); if(item.from_status!==null&&(typeof item.from_status!=='string'||!ORDER_STATUSES.has(item.from_status))) throw new Error('الحالة السابقة في سجل الطلب غير صالحة.'); return {id:item.id,from_status:item.from_status as OrderStatus|null,to_status:item.to_status as OrderStatus,created_at:assertDate(item.created_at,'تاريخ سجل الطلب')};});
  return {...summary,updated_at:assertDate(data.updated_at,'تاريخ تحديث الطلب'),history};
}
