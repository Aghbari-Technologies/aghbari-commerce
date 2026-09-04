import type { CartLine, OrderDraft } from './types';

export const MAX_ORDER_LINES = 100;
export const MAX_ORDER_QUANTITY_PER_LINE = 10000;

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export function validateOrderDraft(draft: OrderDraft, inventory: Map<string, number>): void {
  if (!draft.customerId?.trim()) throw new OrderValidationError('customerId is required');
  if (!draft.idempotencyKey?.trim() || draft.idempotencyKey.trim().length < 16) {
    throw new OrderValidationError('idempotencyKey must be at least 16 characters');
  }
  if (!Array.isArray(draft.lines) || draft.lines.length === 0) throw new OrderValidationError('order must contain at least one line');
  if (draft.lines.length > MAX_ORDER_LINES) throw new OrderValidationError(`order cannot contain more than ${MAX_ORDER_LINES} lines`);

  const seen = new Set<string>();
  for (const line of draft.lines) {
    if (!line.productId?.trim()) throw new OrderValidationError('productId is required');
    if (seen.has(line.productId)) throw new OrderValidationError('duplicate product line');
    seen.add(line.productId);
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new OrderValidationError('quantity must be a positive integer');
    }
    if (line.quantity > MAX_ORDER_QUANTITY_PER_LINE) {
      throw new OrderValidationError(`quantity cannot exceed ${MAX_ORDER_QUANTITY_PER_LINE}`);
    }
    const available = inventory.get(line.productId) ?? 0;
    if (!Number.isInteger(available) || available < 0) throw new OrderValidationError('invalid inventory quantity');
    if (line.quantity > available) throw new OrderValidationError('insufficient stock');
  }
}

export function calculateClientPreviewTotal(lines: CartLine[]): number {
  // Preview only. The canonical order total must be recalculated server-side.
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
