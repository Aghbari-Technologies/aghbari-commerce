import { requireSupabase } from '../lib/supabase';

export type InvoiceStatus = 'issued' | 'partially_paid' | 'paid' | 'void';
export interface OperationalInvoice { id: string; order_id: string; customer_id: string; invoice_number: number; status: InvoiceStatus; currency: string; subtotal: number; total: number; due_at: string | null; created_at: string; }
export interface CashBalance { id: string; name: string; currency: string; opening_balance: number; received: number; spent: number; current_balance: number; }

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
export async function createInvoiceFromOrder(orderId: string) {
  const { data, error } = await requireSupabase().rpc('create_invoice_from_order',{p_order_id:orderId});
  if (error) throw error;
  return data as OperationalInvoice;
}
export async function recordPayment(invoiceId: string, amount: number, method: 'cash'|'bank_transfer'|'card'|'other', cashAccountId: string | null, reference: string) {
  const { data, error } = await requireSupabase().rpc('record_payment',{p_invoice_id:invoiceId,p_amount:amount,p_method:method,p_cash_account_id:cashAccountId,p_reference:reference||null});
  if (error) throw error;
  return data;
}
export async function recordExpense(branchId: string, cashAccountId: string, category: string, amount: number, currency: string, description: string) {
  const { data, error } = await requireSupabase().rpc('record_expense',{p_branch_id:branchId,p_cash_account_id:cashAccountId,p_category:category,p_amount:amount,p_currency:currency,p_description:description||null});
  if (error) throw error;
  return data;
}
