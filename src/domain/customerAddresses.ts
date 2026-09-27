export type CustomerAddressInput = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district?: string | null;
  notes?: string | null;
  isDefault?: boolean;
};

export const CUSTOMER_ADDRESS_LIMITS = {
  label: 80,
  recipientName: 120,
  phone: 40,
  addressLine1: 240,
  addressLine2: 240,
  city: 100,
  district: 120,
  notes: 300,
} as const;

function normalizeRequired(value: string, field: string, max: number): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} مطلوب.`);
  if (normalized.length > max) throw new Error(`${field} يتجاوز الحد المسموح.`);
  return normalized;
}

function normalizeOptional(value: string | null | undefined, max: number): string | null {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized.slice(0, max) : null;
}

export function normalizeCustomerAddressInput(input: CustomerAddressInput): CustomerAddressInput {
  return {
    label: normalizeRequired(input.label, 'اسم العنوان', CUSTOMER_ADDRESS_LIMITS.label),
    recipientName: normalizeRequired(input.recipientName, 'اسم المستلم', CUSTOMER_ADDRESS_LIMITS.recipientName),
    phone: normalizeRequired(input.phone, 'هاتف المستلم', CUSTOMER_ADDRESS_LIMITS.phone),
    addressLine1: normalizeRequired(input.addressLine1, 'العنوان', CUSTOMER_ADDRESS_LIMITS.addressLine1),
    addressLine2: normalizeOptional(input.addressLine2, CUSTOMER_ADDRESS_LIMITS.addressLine2),
    city: normalizeRequired(input.city, 'المدينة', CUSTOMER_ADDRESS_LIMITS.city),
    district: normalizeOptional(input.district, CUSTOMER_ADDRESS_LIMITS.district),
    notes: normalizeOptional(input.notes, CUSTOMER_ADDRESS_LIMITS.notes),
    isDefault: Boolean(input.isDefault),
  };
}
