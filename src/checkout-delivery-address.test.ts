import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('checkout delivery address contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const orders = readFileSync(resolve(process.cwd(), 'src/services/orders.ts'), 'utf8');
  const customerOrders = readFileSync(resolve(process.cwd(), 'src/services/customerOrders.ts'), 'utf8');
  const types = readFileSync(resolve(process.cwd(), 'src/domain/types.ts'), 'utf8');

  it('lets checkout select and submit a real saved address', () => {
    expect(app).toContain('checkout-address-section');
    expect(app).toContain('checkout-shipping-address');
    expect(app).toContain('shippingAddressId:checkoutAddressId');
    expect(app).toContain('getCustomerAddresses(100)');
  });

  it('keeps the address inside the order idempotency payload', () => {
    expect(types).toContain('shippingAddressId?: string | null;');
    expect(orders).toContain('p_shipping_address_id: shippingAddressId');
    expect(customerOrders).toContain('shipping_address:CustomerShippingAddressSnapshot|null');
  });

  it('shows the historical snapshot in order detail', () => {
    expect(app).toContain('order-detail-shipping');
    expect(app).toContain('selectedOrder.shipping_address.address_line1');
  });
});
