import { requireSupabase } from '../lib/supabase';

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'approved' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseLineInput { productId: string; quantity: number; unitCost: number; }
export interface PurchaseOrderInput {
  supplierId: string;
  warehouseId: string;
  idempotencyKey: string;
  lines: PurchaseLineInput[];
  currency?: string;
  notes?: string;
}
export interface ReceiveLineInput { purchaseOrderItemId: string; productId: string; quantity: number; }

export async function createSupplier(input: { name: string; phone?: string; email?: string; address?: string; }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_supplier', {
    p_name: input.name, p_phone: input.phone ?? null, p_email: input.email ?? null, p_address: input.address ?? null
  });
  if (error) throw error;
  return data;
}

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  if (!input.idempotencyKey || input.idempotencyKey.length < 16) throw new Error('A stable idempotency key of at least 16 characters is required.');
  if (!input.lines.length) throw new Error('At least one purchase line is required.');
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_purchase_order', {
    p_supplier_id: input.supplierId, p_warehouse_id: input.warehouseId, p_idempotency_key: input.idempotencyKey,
    p_lines: input.lines, p_currency: input.currency ?? 'YER', p_notes: input.notes ?? null
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function submitPurchaseOrder(purchaseOrderId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('submit_purchase_order', { p_purchase_order_id: purchaseOrderId });
  if (error) throw error;
  return data;
}

export async function approvePurchaseOrder(purchaseOrderId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('approve_purchase_order', { p_purchase_order_id: purchaseOrderId });
  if (error) throw error;
  return data;
}

export async function receivePurchaseOrder(input: { purchaseOrderId: string; idempotencyKey: string; lines: ReceiveLineInput[]; notes?: string; }) {
  if (!input.idempotencyKey || input.idempotencyKey.length < 16) throw new Error('A stable idempotency key of at least 16 characters is required.');
  if (!input.lines.length) throw new Error('At least one receipt line is required.');
  const client = requireSupabase();
  const { data, error } = await client.rpc('receive_purchase_order', {
    p_purchase_order_id: input.purchaseOrderId, p_idempotency_key: input.idempotencyKey,
    p_lines: input.lines, p_notes: input.notes ?? null
  });
  if (error) throw error;
  return data?.[0] ?? null;
}
