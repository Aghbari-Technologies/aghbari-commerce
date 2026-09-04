import type { CartLine, OrderDraft } from './types';

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export function validateOrderDraft(draft: OrderDraft, inventory: Map<string, number>): void {
  if (!draft.customerId) throw new OrderValidationError('customerId is required');
  if (!draft.idempotencyKey || draft.idempotencyKey.length < 16) {
    throw new OrderValidationError('idempotencyKey must be at least 16 characters');
  }
  if (draft.lines.length === 0) throw new OrderValidationError('order must contain at least one line');

  const seen = new Set<string>();
  for (const line of draft.lines) {
    if (seen.has(line.productId)) throw new OrderValidationError('duplicate product line');
    seen.add(line.productId);
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new OrderValidationError('quantity must be a positive integer');
    }
    const available = inventory.get(line.productId) ?? 0;
    if (line.quantity > available) throw new OrderValidationError('insufficient stock');
  }
}

export function calculateClientPreviewTotal(lines: CartLine[]): number {
  // Preview only. The canonical order total must be recalculated server-side.
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
