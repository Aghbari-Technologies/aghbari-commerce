import { requireSupabase } from '../lib/supabase';

export type InvoiceStatus = 'issued' | 'partially_paid' | 'paid' | 'void';
export interface OperationalInvoice { id: string; order_id: string; customer_id: string; invoice_number: number; status: InvoiceStatus; currency: string; subtotal: number; total: number; due_at: string | null; created_at: string; }
export interface CashBalance { id: string; name: string; currency: string; opening_balance: number; received: number; spent: number; current_balance: number; }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const PAYMENT_METHODS = new Set(['cash', 'bank_transfer', 'card', 'other']);

function requireUuid(value: string, field: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error(`${field} غير صالح.`);
  return normalized;
}

function requirePositiveAmount(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${field} يجب أن يكون رقمًا أكبر من صفر.`);
  return value;
}

function requireCurrency(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(normalized)) throw new Error('العملة يجب أن تكون رمزًا من ثلاثة أحرف.');
  return normalized;
}

export function validatePaymentInput(invoiceId: string, amount: number, method: string, cashAccountId: string | null, reference: string): void {
  requireUuid(invoiceId, 'الفاتورة');
  requirePositiveAmount(amount, 'مبلغ الدفع');
  if (!PAYMENT_METHODS.has(method)) throw new Error('طريقة الدفع غير مسموحة.');
  if (method === 'cash' && cashAccountId !== null) requireUuid(cashAccountId, 'حساب النقدية');
  if (method !== 'cash' && cashAccountId !== null) requireUuid(cashAccountId, 'حساب النقدية');
  if (reference.length > 200) throw new Error('مرجع الدفع طويل جدًا.');
}

export function validateExpenseInput(branchId: string, cashAccountId: string, category: string, amount: number, currency: string, description: string): void {
  requireUuid(branchId, 'الفرع');
  requireUuid(cashAccountId, 'حساب النقدية');
  if (!category.trim() || category.trim().length > 200) throw new Error('تصنيف المصروف مطلوب وبحد أقصى 200 حرف.');
  requirePositiveAmount(amount, 'مبلغ المصروف');
  requireCurrency(currency);
  if (description.length > 2000) throw new Error('وصف المصروف طويل جدًا.');
}

export function validateCashAccountInput(branchId: string, name: string, currency: string, openingBalance: number): void {
  requireUuid(branchId, 'الفرع');
  if (!name.trim() || name.trim().length > 200) throw new Error('اسم حساب النقدية مطلوب وبحد أقصى 200 حرف.');
  requireCurrency(currency);
  if (!Number.isFinite(openingBalance) || openingBalance < 0) throw new Error('الرصيد الافتتاحي يجب أن يكون رقمًا غير سالب.');
}

export async function getInvoices(limit = 100) {
  const { data, error } = await requireSupabase().from('operational_invoices').select('id,order_id,customer_id,invoice_number,status,currency,subtotal,total,due_at,created_at').order('created_at',{ascending:false}).limit(Math.min(Math.max(limit,1),500));
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
export async function recordPayment(invoiceId: string, amount: number, method: 'cash'|'bank_transfer'|'card'|'other', cashAccountId: string | null, reference: string) {
  validatePaymentInput(invoiceId, amount, method, cashAccountId, reference);
  const { data, error } = await requireSupabase().rpc('record_payment',{p_invoice_id:invoiceId.trim(),p_amount:amount,p_method:method,p_cash_account_id:cashAccountId?.trim() ?? null,p_reference:reference.trim()||null});
  if (error) throw error;
  return data;
}
export async function recordExpense(branchId: string, cashAccountId: string, category: string, amount: number, currency: string, description: string) {
  validateExpenseInput(branchId, cashAccountId, category, amount, currency, description);
  const { data, error } = await requireSupabase().rpc('record_expense',{p_branch_id:branchId.trim(),p_cash_account_id:cashAccountId.trim(),p_category:category.trim(),p_amount:amount,p_currency:currency.trim().toUpperCase(),p_description:description.trim()||null});
  if (error) throw error;
  return data;
}
