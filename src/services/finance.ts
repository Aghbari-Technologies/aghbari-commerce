import { requireSupabase } from '../lib/supabase';

export type InvoiceStatus = 'issued' | 'partially_paid' | 'paid' | 'void';
export interface OperationalInvoice { id: string; order_id: string; customer_id: string; invoice_number: number; status: InvoiceStatus; currency: string; subtotal: number; total: number; due_at: string | null; created_at: string; }
export interface OperationalInvoiceDetailItem { id:string; product_id:string; description:string; quantity:number; unit_price:number; line_total:number; }
export interface OperationalInvoicePayment { id:string; amount:number; method:string; reference:string|null; paid_at:string; }
export interface OperationalInvoiceDetail extends OperationalInvoice {
  items: OperationalInvoiceDetailItem[];
  payments: OperationalInvoicePayment[];
  paid_total: number;
  balance_due: number;
}
export interface CashBalance { id: string; name: string; currency: string; opening_balance: number; received: number; spent: number; current_balance: number; }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const PAYMENT_METHODS = new Set(['cash', 'bank_transfer', 'card', 'other']);
const MAX_MONEY = Number.MAX_SAFE_INTEGER;

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`${field} يجب أن يكون نصًا.`);
  return value;
}

function requireUuid(value: unknown, field: string): string {
  const normalized = requireString(value, field).trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error(`${field} غير صالح.`);
  return normalized;
}

function requirePositiveAmount(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0 || value > MAX_MONEY) throw new Error(`${field} يجب أن يكون رقمًا أكبر من صفر وضمن الدقة الآمنة.`);
  return value;
}

function requireCurrency(value: unknown): string {
  const normalized = requireString(value, 'العملة').trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(normalized)) throw new Error('العملة يجب أن تكون رمزًا من ثلاثة أحرف.');
  return normalized;
}

function requireIdempotencyKey(value: unknown): string {
  const normalized = requireString(value, 'مفتاح منع التكرار').trim();
  if (normalized.length < 16 || normalized.length > 200) throw new Error('مفتاح منع التكرار يجب أن يكون بين 16 و200 حرف.');
  return normalized;
}

export function validatePaymentInput(invoiceId: string, amount: number, method: string, cashAccountId: string | null, reference: string): void {
  requireUuid(invoiceId, 'الفاتورة');
  requirePositiveAmount(amount, 'مبلغ الدفع');
  const normalizedMethod = requireString(method, 'طريقة الدفع').trim();
  if (!PAYMENT_METHODS.has(normalizedMethod)) throw new Error('طريقة الدفع غير مسموحة.');
  if (cashAccountId !== null) requireUuid(cashAccountId, 'حساب النقدية');
  const normalizedReference = requireString(reference, 'مرجع الدفع');
  if (normalizedReference.length > 200) throw new Error('مرجع الدفع طويل جدًا.');
}

export function validateExpenseInput(branchId: string, cashAccountId: string, category: string, amount: number, currency: string, description: string): void {
  requireUuid(branchId, 'الفرع');
  requireUuid(cashAccountId, 'حساب النقدية');
  const normalizedCategory = requireString(category, 'تصنيف المصروف').trim();
  if (!normalizedCategory || normalizedCategory.length > 200) throw new Error('تصنيف المصروف مطلوب وبحد أقصى 200 حرف.');
  requirePositiveAmount(amount, 'مبلغ المصروف');
  requireCurrency(currency);
  const normalizedDescription = requireString(description, 'وصف المصروف');
  if (normalizedDescription.length > 2000) throw new Error('وصف المصروف طويل جدًا.');
}

export function validateCashAccountInput(branchId: string, name: string, currency: string, openingBalance: number): void {
  requireUuid(branchId, 'الفرع');
  const normalizedName = requireString(name, 'اسم حساب النقدية').trim();
  if (!normalizedName || normalizedName.length > 200) throw new Error('اسم حساب النقدية مطلوب وبحد أقصى 200 حرف.');
  requireCurrency(currency);
  if (!Number.isFinite(openingBalance) || openingBalance < 0 || openingBalance > MAX_MONEY) throw new Error('الرصيد الافتتاحي يجب أن يكون رقمًا غير سالب وضمن الدقة الآمنة.');
}

export async function getInvoices(limit = 100) {
  const normalizedLimit = Number.isSafeInteger(limit) ? Math.min(Math.max(limit,1),500) : 100;
  const { data, error } = await requireSupabase().from('operational_invoices').select('id,order_id,customer_id,invoice_number,status,currency,subtotal,total,due_at,created_at').order('created_at',{ascending:false}).limit(normalizedLimit);
  if (error) throw error;
  return (data ?? []) as OperationalInvoice[];
}
export async function getCashBalances() {
  const { data, error } = await requireSupabase().rpc('get_cash_account_balances');
  if (error) throw error;
  return (data ?? []) as CashBalance[];
}
export async function createCashAccount(branchId: string, name: string, currency: string, openingBalance: number) {
  validateCashAccountInput(branchId, name, currency, openingBalance);
  const { data, error } = await requireSupabase().rpc('create_cash_account',{p_branch_id:branchId.trim(),p_name:name.trim(),p_currency:currency.trim().toUpperCase(),p_opening_balance:openingBalance});
  if (error) throw error;
  return data as CashBalance;
}
export async function createInvoiceFromOrder(orderId: string) {
  const id = requireUuid(orderId, 'الطلب');
  const { data, error } = await requireSupabase().rpc('create_invoice_from_order',{p_order_id:id});
  if (error) throw error;
  return data as OperationalInvoice;
}
export async function recordPayment(invoiceId: string, amount: number, method: 'cash'|'bank_transfer'|'card'|'other', cashAccountId: string | null, reference: string, idempotencyKey = `agh-payment-${crypto.randomUUID()}`) {
  validatePaymentInput(invoiceId, amount, method, cashAccountId, reference);
  const key=requireIdempotencyKey(idempotencyKey);
  const { data, error } = await requireSupabase().rpc('record_payment',{p_invoice_id:invoiceId.trim(),p_amount:amount,p_method:method,p_cash_account_id:cashAccountId?.trim() ?? null,p_reference:reference.trim()||null,p_idempotency_key:key});
  if (error) throw error;
  return data;
}
export async function recordExpense(branchId: string, cashAccountId: string, category: string, amount: number, currency: string, description: string, idempotencyKey = `agh-expense-${crypto.randomUUID()}`) {
  validateExpenseInput(branchId, cashAccountId, category, amount, currency, description);
  const key=requireIdempotencyKey(idempotencyKey);
  const { data, error } = await requireSupabase().rpc('record_expense',{p_branch_id:branchId.trim(),p_cash_account_id:cashAccountId.trim(),p_category:category.trim(),p_amount:amount,p_currency:currency.trim().toUpperCase(),p_description:description.trim()||null,p_idempotency_key:key,p_expense_date:new Date().toISOString().slice(0,10)});
  if (error) throw error;
  return data;
}


function requireInvoiceDetailItem(value: unknown): OperationalInvoiceDetailItem {
  if (!value || typeof value !== 'object') throw new Error('بند الفاتورة غير صالح.');
  const item=value as Record<string,unknown>;
  if(typeof item.id!=='string'||!UUID_PATTERN.test(item.id))throw new Error('معرّف بند الفاتورة غير صالح.');
  if(typeof item.product_id!=='string'||!UUID_PATTERN.test(item.product_id))throw new Error('معرّف المنتج في الفاتورة غير صالح.');
  if(typeof item.description!=='string'||!item.description.trim())throw new Error('وصف بند الفاتورة غير صالح.');
  const quantity=typeof item.quantity==='number'?item.quantity:Number(item.quantity);
  const unitPrice=typeof item.unit_price==='number'?item.unit_price:Number(item.unit_price);
  const lineTotal=typeof item.line_total==='number'?item.line_total:Number(item.line_total);
  if(!Number.isSafeInteger(quantity)||quantity<1)throw new Error('كمية بند الفاتورة غير صالحة.');
  if(!Number.isFinite(unitPrice)||unitPrice<0||!Number.isFinite(lineTotal)||lineTotal<0)throw new Error('قيمة بند الفاتورة غير صالحة.');
  return {id:item.id as string,product_id:item.product_id as string,description:item.description as string,quantity,unit_price:unitPrice,line_total:lineTotal};
}

export function assertOperationalInvoiceDetail(value: unknown): OperationalInvoiceDetail {
  if(!value||typeof value!=='object')throw new Error('تفاصيل الفاتورة غير صالحة. لم يتم إثبات نجاح العملية.');
  const item=value as Record<string,unknown>;
  const base=getInvoiceBase(item);
  if(!Array.isArray(item.items)||!Array.isArray(item.payments))throw new Error('تفاصيل بنود أو تحصيلات الفاتورة غير صالحة.');
  const items=(item.items as unknown[]).map(requireInvoiceDetailItem);
  const payments=(item.payments as unknown[]).map(payment=>{
    if(!payment||typeof payment!=='object')throw new Error('بيانات التحصيل غير صالحة.');
    const p=payment as Record<string,unknown>;
    if(typeof p.id!=='string'||!UUID_PATTERN.test(p.id))throw new Error('معرّف التحصيل غير صالح.');
    const amount=typeof p.amount==='number'?p.amount:Number(p.amount);
    if(!Number.isFinite(amount)||amount<=0)throw new Error('مبلغ التحصيل غير صالح.');
    if(typeof p.method!=='string'||!p.method.trim())throw new Error('طريقة التحصيل غير صالحة.');
    if(p.reference!==null&&p.reference!==undefined&&typeof p.reference!=='string')throw new Error('مرجع التحصيل غير صالح.');
    if(typeof p.paid_at!=='string'||Number.isNaN(Date.parse(p.paid_at)))throw new Error('تاريخ التحصيل غير صالح.');
    return {id:p.id as string,amount,method:p.method as string,reference:(p.reference??null) as string|null,paid_at:p.paid_at as string};
  });
  const paidTotal=typeof item.paid_total==='number'?item.paid_total:Number(item.paid_total);
  const balanceDue=typeof item.balance_due==='number'?item.balance_due:Number(item.balance_due);
  if(!Number.isFinite(paidTotal)||paidTotal<0||!Number.isFinite(balanceDue)||balanceDue<0)throw new Error('أرصدة الفاتورة غير صالحة.');
  return {...base,items,payments,paid_total:paidTotal,balance_due:balanceDue};
}

function getInvoiceBase(item: Record<string,unknown>): OperationalInvoice {
  if(typeof item.id!=='string'||!UUID_PATTERN.test(item.id))throw new Error('معرّف الفاتورة غير صالح.');
  if(typeof item.order_id!=='string'||!UUID_PATTERN.test(item.order_id))throw new Error('معرّف الطلب في الفاتورة غير صالح.');
  if(typeof item.customer_id!=='string'||!UUID_PATTERN.test(item.customer_id))throw new Error('معرّف العميل في الفاتورة غير صالح.');
  const invoiceNumber=typeof item.invoice_number==='number'?item.invoice_number:Number(item.invoice_number);
  const subtotal=typeof item.subtotal==='number'?item.subtotal:Number(item.subtotal);
  const total=typeof item.total==='number'?item.total:Number(item.total);
  if(!Number.isSafeInteger(invoiceNumber)||invoiceNumber<1)throw new Error('رقم الفاتورة غير صالح.');
  if(typeof item.status!=='string'||!['issued','partially_paid','paid','void'].includes(item.status))throw new Error('حالة الفاتورة غير صالحة.');
  if(typeof item.currency!=='string'||!CURRENCY_PATTERN.test(item.currency))throw new Error('عملة الفاتورة غير صالحة.');
  if(!Number.isFinite(subtotal)||subtotal<0||!Number.isFinite(total)||total<0)throw new Error('إجمالي الفاتورة غير صالح.');
  if(typeof item.created_at!=='string'||Number.isNaN(Date.parse(item.created_at)))throw new Error('تاريخ الفاتورة غير صالح.');
  return {id:item.id,order_id:item.order_id,customer_id:item.customer_id,invoice_number:invoiceNumber,status:item.status as InvoiceStatus,currency:item.currency,subtotal,total,due_at:(item.due_at??null) as string|null,created_at:item.created_at};
}

export async function getOperationalInvoiceDetail(invoiceId:string):Promise<OperationalInvoiceDetail>{
  const id=requireUuid(invoiceId,'الفاتورة');
  const client=requireSupabase();
  const {data:invoice,error:invoiceError}=await client.from('operational_invoices').select('id,order_id,customer_id,invoice_number,status,currency,subtotal,total,due_at,created_at').eq('id',id).maybeSingle();
  if(invoiceError)throw invoiceError;
  if(!invoice)throw new Error('الفاتورة غير موجودة أو غير متاحة لهذا الحساب.');
  const [{data:items,error:itemsError},{data:payments,error:paymentsError}]=await Promise.all([
    client.from('operational_invoice_items').select('id,product_id,description,quantity,unit_price,line_total').eq('invoice_id',id).order('created_at'),
    client.from('payments').select('id,amount,method,reference,paid_at').eq('invoice_id',id).order('paid_at')
  ]);
  if(itemsError)throw itemsError;if(paymentsError)throw paymentsError;
  const detailItems=(items??[]).map(requireInvoiceDetailItem);
  const detailPayments=(payments??[]).map(p=>({id:p.id,amount:typeof p.amount==='number'?p.amount:Number(p.amount),method:String(p.method),reference:p.reference??null,paid_at:p.paid_at}));
  const base=getInvoiceBase({...invoice,invoice_number:Number(invoice.invoice_number),subtotal:Number(invoice.subtotal),total:Number(invoice.total)});
  return assertOperationalInvoiceDetail({...base,items:detailItems,payments:detailPayments,paid_total:detailPayments.reduce((sum,p)=>sum+p.amount,0),balance_due:Math.max(0,base.total-detailPayments.reduce((sum,p)=>sum+p.amount,0))});
}
