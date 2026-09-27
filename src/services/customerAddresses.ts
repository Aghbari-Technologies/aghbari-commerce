import { normalizeCustomerAddressInput, type CustomerAddressInput } from '../domain/customerAddresses';
import { requireSupabase } from '../lib/supabase';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CustomerAddress {
  id: string;
  organization_id: string;
  customer_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

function assertAddress(value: unknown): CustomerAddress {
  if (!value || typeof value !== 'object') throw new Error('استجابة العنوان غير صالحة.');
  const item = value as Record<string, unknown>;
  const ids = ['id', 'organization_id', 'customer_id'] as const;
  if (ids.some((key) => typeof item[key] !== 'string' || !UUID_PATTERN.test(item[key] as string))) {
    throw new Error('معرّفات العنوان غير صالحة.');
  }
  const requiredText: Array<[keyof CustomerAddress, string]> = [
    ['label', 'اسم العنوان'],
    ['recipient_name', 'اسم المستلم'],
    ['phone', 'هاتف المستلم'],
    ['address_line1', 'العنوان'],
    ['city', 'المدينة'],
  ];
  for (const [key, label] of requiredText) {
    if (typeof item[key] !== 'string' || !(item[key] as string).trim()) throw new Error(`بيانات ${label} غير صالحة.`);
  }
  for (const key of ['address_line2', 'district', 'notes'] as const) {
    if (item[key] !== null && item[key] !== undefined && typeof item[key] !== 'string') {
      throw new Error('بيانات العنوان الاختيارية غير صالحة.');
    }
  }
  for (const key of ['created_at', 'updated_at'] as const) {
    if (typeof item[key] !== 'string' || Number.isNaN(Date.parse(item[key] as string))) {
      throw new Error('تواريخ العنوان غير صالحة.');
    }
  }
  if (typeof item.is_default !== 'boolean') throw new Error('حالة العنوان الافتراضي غير صالحة.');
  return {
    id: item.id as string,
    organization_id: item.organization_id as string,
    customer_id: item.customer_id as string,
    label: item.label as string,
    recipient_name: item.recipient_name as string,
    phone: item.phone as string,
    address_line1: item.address_line1 as string,
    address_line2: (item.address_line2 as string | null | undefined) ?? null,
    city: item.city as string,
    district: (item.district as string | null | undefined) ?? null,
    notes: (item.notes as string | null | undefined) ?? null,
    is_default: item.is_default as boolean,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
  };
}

function rpcRow(data: unknown): unknown {
  return Array.isArray(data) ? data[0] : data;
}

function safeLimit(limit: number) {
  const value = Number.isFinite(limit) ? Math.trunc(limit) : 50;
  return Math.min(Math.max(value, 1), 100);
}

export async function getCustomerAddresses(limit = 50): Promise<CustomerAddress[]> {
  const { data, error } = await requireSupabase()
    .from('customer_addresses')
    .select('id,organization_id,customer_id,label,recipient_name,phone,address_line1,address_line2,city,district,notes,is_default,created_at,updated_at')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(safeLimit(limit));
  if (error) throw error;
  return (data ?? []).map(assertAddress);
}

export async function createCustomerAddress(input: CustomerAddressInput): Promise<CustomerAddress> {
  const value = normalizeCustomerAddressInput(input);
  const { data, error } = await requireSupabase().rpc('create_customer_address', {
    p_label: value.label,
    p_recipient_name: value.recipientName,
    p_phone: value.phone,
    p_address_line1: value.addressLine1,
    p_address_line2: value.addressLine2,
    p_city: value.city,
    p_district: value.district,
    p_notes: value.notes,
    p_is_default: Boolean(value.isDefault),
  });
  if (error) throw error;
  return assertAddress(rpcRow(data));
}

export async function updateCustomerAddress(addressId: string, input: CustomerAddressInput): Promise<CustomerAddress> {
  if (!UUID_PATTERN.test(addressId)) throw new Error('معرّف العنوان غير صالح.');
  const value = normalizeCustomerAddressInput(input);
  const { data, error } = await requireSupabase().rpc('update_customer_address', {
    p_address_id: addressId,
    p_label: value.label,
    p_recipient_name: value.recipientName,
    p_phone: value.phone,
    p_address_line1: value.addressLine1,
    p_address_line2: value.addressLine2,
    p_city: value.city,
    p_district: value.district,
    p_notes: value.notes,
    p_is_default: Boolean(value.isDefault),
  });
  if (error) throw error;
  return assertAddress(rpcRow(data));
}

export async function deleteCustomerAddress(addressId: string): Promise<boolean> {
  if (!UUID_PATTERN.test(addressId)) throw new Error('معرّف العنوان غير صالح.');
  const { data, error } = await requireSupabase().rpc('delete_customer_address', { p_address_id: addressId });
  if (error) throw error;
  if (data !== true) throw new Error('تعذر تأكيد حذف العنوان.');
  return true;
}
