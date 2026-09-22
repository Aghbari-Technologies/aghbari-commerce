import { requireSupabase } from '../lib/supabase';

export type SupplierBillStatus = 'issued' | 'partially_paid' | 'paid' | 'void';
export type SupplierPaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'other';
export interface SupplierBill { id:string; supplier_id:string; purchase_order_id:string|null; bill_number:string; status:SupplierBillStatus; currency:string; subtotal:number; total:number; due_at:string|null; notes:string|null; created_at:string; }
export interface SupplierLedgerEntry { id:string; supplier_id:string; supplier_bill_id:string|null; reference:string|null; description:string; debit:number; credit:number; currency:string; due_date:string|null; entry_status:'posted'|'void'; source_type:string; source_id:string; created_at:string; }

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURRENCY=/^[A-Z]{3}$/;
const METHODS=new Set<SupplierPaymentMethod>(['cash','bank_transfer','card','other']);
const MAX_MONEY=Number.MAX_SAFE_INTEGER;

function requireUuid(value:string,field:string){const normalized=value.trim();if(!UUID.test(normalized))throw new Error(field+' غير صالح.');return normalized;}
function requirePositive(value:number,field:string){if(!Number.isFinite(value)||value<=0||value>MAX_MONEY)throw new Error(field+' يجب أن يكون موجبًا وضمن الدقة الآمنة.');return value;}
function requireIdempotency(value:string){const normalized=value.trim();if(normalized.length<16||normalized.length>200)throw new Error('مفتاح منع التكرار يجب أن يكون بين 16 و200 حرف.');return normalized;}
function requireCurrency(value:string){const normalized=value.trim().toUpperCase();if(!CURRENCY.test(normalized))throw new Error('العملة يجب أن تكون رمزًا من ثلاثة أحرف.');return normalized;}

export function validateSupplierBillInput(input:{supplierId:string;billNumber:string;total:number;currency:string;idempotencyKey:string;notes?:string}){requireUuid(input.supplierId,'المورد');const number=input.billNumber.trim();if(!number||number.length>100)throw new Error('رقم فاتورة المورد مطلوب وبحد أقصى 100 حرف.');requirePositive(input.total,'إجمالي الفاتورة');requireCurrency(input.currency);requireIdempotency(input.idempotencyKey);if(input.notes!==undefined&&input.notes.length>2000)throw new Error('ملاحظات فاتورة المورد طويلة جدًا.');}
export function validateSupplierPaymentInput(input:{supplierBillId:string;amount:number;method:string;cashAccountId:string|null;reference:string;idempotencyKey:string}){requireUuid(input.supplierBillId,'فاتورة المورد');requirePositive(input.amount,'مبلغ السداد');if(!METHODS.has(input.method.trim() as SupplierPaymentMethod))throw new Error('طريقة السداد غير مسموحة.');if(input.cashAccountId!==null)requireUuid(input.cashAccountId,'حساب النقدية');if(input.reference.length>200)throw new Error('مرجع السداد طويل جدًا.');requireIdempotency(input.idempotencyKey);}

export async function getSupplierAccounting(supplierId:string,currencyCode='YER'){
 const supplier=requireUuid(supplierId,'المورد'); const code=requireCurrency(currencyCode); const client=requireSupabase();
 const [{data:bills,error:billError},{data:entries,error:entryError}]=await Promise.all([
  client.from('supplier_bills').select('id,supplier_id,purchase_order_id,bill_number,status,currency,subtotal,total,due_at,notes,created_at').eq('supplier_id',supplier).eq('currency',code).order('created_at',{ascending:false}).limit(100),
  client.from('supplier_ledger_entries').select('id,supplier_id,supplier_bill_id,reference,description,debit,credit,currency,due_date,entry_status,source_type,source_id,created_at').eq('supplier_id',supplier).eq('currency',code).order('created_at',{ascending:false}).limit(200)
 ]);
 if(billError)throw billError;if(entryError)throw entryError;
 return {bills:(bills??[]).map(item=>({...item,subtotal:Number(item.subtotal),total:Number(item.total)})) as SupplierBill[],entries:(entries??[]).map(item=>({...item,debit:Number(item.debit),credit:Number(item.credit)})) as SupplierLedgerEntry[]};
}
export async function createSupplierBill(input:{supplierId:string;billNumber:string;total:number;currency?:string;dueAt?:string|null;purchaseOrderId?:string|null;idempotencyKey:string;notes?:string}){
 const code=input.currency?.trim().toUpperCase()??'YER';validateSupplierBillInput({supplierId:input.supplierId,billNumber:input.billNumber,total:input.total,currency:code,idempotencyKey:input.idempotencyKey,notes:input.notes});
 const {data,error}=await requireSupabase().rpc('create_supplier_bill',{p_supplier_id:input.supplierId.trim(),p_bill_number:input.billNumber.trim(),p_total:input.total,p_currency:code,p_due_at:input.dueAt??null,p_purchase_order_id:input.purchaseOrderId??null,p_idempotency_key:input.idempotencyKey.trim(),p_notes:input.notes?.trim()||null});
 if(error)throw error;return data as SupplierBill;
}
export async function recordSupplierPayment(input:{supplierBillId:string;amount:number;method:SupplierPaymentMethod;cashAccountId:string|null;reference:string;idempotencyKey:string}){
 validateSupplierPaymentInput(input);
 const {data,error}=await requireSupabase().rpc('record_supplier_payment',{p_supplier_bill_id:input.supplierBillId.trim(),p_amount:input.amount,p_method:input.method.trim(),p_cash_account_id:input.cashAccountId?.trim()??null,p_reference:input.reference.trim()||null,p_idempotency_key:input.idempotencyKey.trim()});
 if(error)throw error;return data as SupplierLedgerEntry;
}
