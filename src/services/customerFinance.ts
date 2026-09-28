import { requireSupabase } from '../lib/supabase';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INVOICE_STATUSES = new Set(['issued', 'partially_paid', 'paid', 'void']);

export interface CustomerInvoiceSummary {
  id: string;
  order_id: string;
  invoice_number: number;
  status: 'issued' | 'partially_paid' | 'paid' | 'void';
  currency: string;
  subtotal: number;
  total: number;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayment {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
}

export interface CustomerStatementLine {
  invoice: CustomerInvoiceSummary;
  paid: number;
  outstanding: number;
}

export interface CustomerStatementTotal {
  currency: string;
  invoiced: number;
  paid: number;
  outstanding: number;
}

export interface CustomerStatement {
  lines: CustomerStatementLine[];
  totals: CustomerStatementTotal[];
}

export interface CustomerInvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

function finiteNumber(value: unknown, allowZero = true) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || (!allowZero && parsed <= 0) || (allowZero && parsed < 0)) {
    throw new Error('البيان المالي يحتوي قيمة غير صالحة.');
  }
  return parsed;
}

function assertInvoice(value: unknown): CustomerInvoiceSummary {
  if (!value || typeof value !== 'object') throw new Error('استجابة الفاتورة غير صالحة.');
  const item = value as Record<string, unknown>;
  const invoiceNumber = Number(item.invoice_number);
  if (
    typeof item.id !== 'string' || !UUID_PATTERN.test(item.id) ||
    typeof item.order_id !== 'string' || !UUID_PATTERN.test(item.order_id) ||
    !Number.isSafeInteger(invoiceNumber) || invoiceNumber <= 0 ||
    typeof item.status !== 'string' || !INVOICE_STATUSES.has(item.status) ||
    typeof item.currency !== 'string' || !/^[A-Z]{3}$/.test(item.currency) ||
    typeof item.created_at !== 'string' || Number.isNaN(Date.parse(item.created_at)) ||
    typeof item.updated_at !== 'string' || Number.isNaN(Date.parse(item.updated_at)) ||
    (item.due_at !== null && item.due_at !== undefined && (typeof item.due_at !== 'string' || Number.isNaN(Date.parse(item.due_at))))
  ) throw new Error('استجابة الفاتورة تحتوي بيانات غير صالحة.');
  const subtotal = finiteNumber(item.subtotal);
  const total = finiteNumber(item.total);
  if (total < subtotal) throw new Error('إجمالي الفاتورة غير متسق.');
  return {
    id: item.id as string,
    order_id: item.order_id as string,
    invoice_number: invoiceNumber,
    status: item.status as CustomerInvoiceSummary['status'],
    currency: item.currency as string,
    subtotal,
    total,
    due_at: (item.due_at as string | null | undefined) ?? null,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string
  };
}

function assertPayment(value: unknown): CustomerPayment {
  if (!value || typeof value !== 'object') throw new Error('استجابة الدفعة غير صالحة.');
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string' || !UUID_PATTERN.test(item.id) ||
    typeof item.invoice_id !== 'string' || !UUID_PATTERN.test(item.invoice_id) ||
    typeof item.method !== 'string' || item.method.trim() === '' ||
    (item.reference !== null && item.reference !== undefined && typeof item.reference !== 'string') ||
    typeof item.paid_at !== 'string' || Number.isNaN(Date.parse(item.paid_at))
  ) throw new Error('استجابة الدفعة تحتوي بيانات غير صالحة.');
  const amount = finiteNumber(item.amount, false);
  return {
    id: item.id as string,
    invoice_id: item.invoice_id as string,
    amount,
    method: item.method as string,
    reference: (item.reference as string | null | undefined) ?? null,
    paid_at: item.paid_at as string
  };
}

export async function getCustomerInvoices(customerId: string, limit = 50): Promise<CustomerInvoiceSummary[]> {
  if (!UUID_PATTERN.test(customerId)) throw new Error('معرّف العميل غير صالح.');
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const { data, error } = await requireSupabase()
    .from('operational_invoices')
    .select('id,order_id,invoice_number,status,currency,subtotal,total,due_at,created_at,updated_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []).map(assertInvoice);
}

export async function getCustomerInvoiceItems(customerId: string, invoiceId: string, limit = 100): Promise<CustomerInvoiceItem[]> {
  if (!UUID_PATTERN.test(customerId) || !UUID_PATTERN.test(invoiceId)) throw new Error('معرّف الفاتورة غير صالح.');
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const client = requireSupabase();
  const { data: invoice, error: invoiceError } = await client
    .from('operational_invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('customer_id', customerId)
    .maybeSingle();
  if (invoiceError) throw invoiceError;
  if (!invoice) throw new Error('الفاتورة غير متاحة لهذا الحساب.');

  const { data, error } = await client
    .from('operational_invoice_items')
    .select('id,invoice_id,product_id,description,quantity,unit_price,line_total')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true })
    .limit(safeLimit);
  if (error) throw error;

  return (data ?? []).map((value) => {
    if (!value || typeof value !== 'object') throw new Error('بيانات بند الفاتورة غير صالحة.');
    const item = value as Record<string, unknown>;
    const quantity = Number(item.quantity);
    const unitPrice = finiteNumber(item.unit_price);
    const computedLineTotal = quantity * unitPrice;
    const lineTotal = item.line_total == null ? computedLineTotal : finiteNumber(item.line_total);
    if (
      typeof item.id !== 'string' || !UUID_PATTERN.test(item.id) ||
      typeof item.invoice_id !== 'string' || !UUID_PATTERN.test(item.invoice_id) || item.invoice_id !== invoiceId ||
      typeof item.product_id !== 'string' || !UUID_PATTERN.test(item.product_id) ||
      typeof item.description !== 'string' || item.description.trim() === '' ||
      !Number.isSafeInteger(quantity) || quantity <= 0 ||
      !Number.isFinite(computedLineTotal)
    ) throw new Error('بيانات بند الفاتورة تحتوي قيمة غير صالحة.');
    if (Math.abs(lineTotal - computedLineTotal) > 0.01) {
      throw new Error('إجمالي بند الفاتورة غير متسق.');
    }
    return {
      id: item.id as string,
      invoice_id: item.invoice_id as string,
      product_id: item.product_id as string,
      description: item.description as string,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal
    };
  });
}

export async function getCustomerInvoicePayments(customerId: string, invoiceId: string, limit = 50): Promise<CustomerPayment[]> {
  if (!UUID_PATTERN.test(customerId) || !UUID_PATTERN.test(invoiceId)) throw new Error('معرّف الفاتورة غير صالح.');
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const client = requireSupabase();
  const { data: invoice, error: invoiceError } = await client
    .from('operational_invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('customer_id', customerId)
    .maybeSingle();
  if (invoiceError) throw invoiceError;
  if (!invoice) throw new Error('الفاتورة غير متاحة لهذا الحساب.');
  const { data, error } = await client
    .from('payments')
    .select('id,invoice_id,amount,method,reference,paid_at')
    .eq('invoice_id', invoiceId)
    .order('paid_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []).map(assertPayment).filter((payment) => payment.invoice_id === invoiceId);
}

export function calculateInvoicePaid(payments: CustomerPayment[]) {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculateInvoiceLineTotal(quantity: number, unitPrice: number) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error('بيانات بند الفاتورة غير صالحة.');
  }
  return quantity * unitPrice;
}

export function buildCustomerStatementLines(
  invoices: CustomerInvoiceSummary[],
  payments: CustomerPayment[],
): CustomerStatementLine[] {
  const invoiceIds = new Set(invoices.map((invoice) => invoice.id));
  const paidByInvoice = new Map<string, number>();
  for (const payment of payments) {
    if (!invoiceIds.has(payment.invoice_id)) continue;
    paidByInvoice.set(payment.invoice_id, (paidByInvoice.get(payment.invoice_id) ?? 0) + payment.amount);
  }
  return invoices.map((invoice) => {
    const paid = paidByInvoice.get(invoice.id) ?? 0;
    return { invoice, paid, outstanding: Math.max(0, invoice.total - paid) };
  });
}

export async function getCustomerStatement(customerId: string, limit = 100): Promise<CustomerStatement> {
  if (!UUID_PATTERN.test(customerId)) throw new Error('معرّف العميل غير صالح.');
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const invoices = await getCustomerInvoices(customerId, safeLimit);
  if (!invoices.length) return { lines: [], totals: [] };

  const invoiceIds = invoices.map((invoice) => invoice.id);
  const client = requireSupabase();
  const payments: CustomerPayment[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from('payments')
      .select('id,invoice_id,amount,method,reference,paid_at')
      .in('invoice_id', invoiceIds)
      .order('paid_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    const page = (data ?? []).map(assertPayment);
    payments.push(...page);
    if (page.length < pageSize) break;
  }

  const lines = buildCustomerStatementLines(invoices, payments);
  const totalsByCurrency = new Map<string, CustomerStatementTotal>();
  for (const line of lines) {
    const current = totalsByCurrency.get(line.invoice.currency) ?? {
      currency: line.invoice.currency,
      invoiced: 0,
      paid: 0,
      outstanding: 0,
    };
    current.invoiced += line.invoice.total;
    current.paid += line.paid;
    current.outstanding += line.outstanding;
    totalsByCurrency.set(line.invoice.currency, current);
  }

  return {
    lines,
    totals: Array.from(totalsByCurrency.values()).sort((a, b) => a.currency.localeCompare(b.currency)),
  };
}
