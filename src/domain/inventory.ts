export interface InventoryLot {
  readonly lotId: string;
  readonly productId: string;
  readonly warehouseId: string;
  readonly quantity: number;
  readonly expiresAt?: string;
}

export interface LotAllocation {
  readonly lotId: string;
  readonly quantity: number;
}

export function availableQuantity(quantity: number, reservedQuantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error('VALIDATION_FAILED:quantity');
  if (!Number.isInteger(reservedQuantity) || reservedQuantity < 0 || reservedQuantity > quantity) {
    throw new Error('VALIDATION_FAILED:reservedQuantity');
  }
  return quantity - reservedQuantity;
}

export function validateMovement(quantityDelta: number, operationId: string): void {
  if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
    throw new Error('VALIDATION_FAILED:quantityDelta');
  }
  if (!operationId) throw new Error('VALIDATION_FAILED:operationId');
}

export function allocateFefo(
  lots: readonly InventoryLot[],
  requiredQuantity: number,
  at: string,
): readonly LotAllocation[] {
  if (!Number.isInteger(requiredQuantity) || requiredQuantity <= 0) {
    throw new Error('VALIDATION_FAILED:requiredQuantity');
  }
  const now = Date.parse(at);
  if (!Number.isFinite(now)) throw new Error('VALIDATION_FAILED:at');

  const eligible = lots
    .filter((lot) => Number.isInteger(lot.quantity) && lot.quantity > 0)
    .filter((lot) => !lot.expiresAt || Date.parse(lot.expiresAt) > now)
    .sort((a, b) => {
      const aExpiry = a.expiresAt ? Date.parse(a.expiresAt) : Number.POSITIVE_INFINITY;
      const bExpiry = b.expiresAt ? Date.parse(b.expiresAt) : Number.POSITIVE_INFINITY;
      return aExpiry - bExpiry || a.lotId.localeCompare(b.lotId);
    });

  const total = eligible.reduce((sum, lot) => sum + lot.quantity, 0);
  if (total < requiredQuantity) throw new Error('CONFLICT:INSUFFICIENT_FEFO_STOCK');

  let remaining = requiredQuantity;
  const allocations: LotAllocation[] = [];
  for (const lot of eligible) {
    if (remaining === 0) break;
    const take = Math.min(remaining, lot.quantity);
    allocations.push({ lotId: lot.lotId, quantity: take });
    remaining -= take;
  }
  return allocations;
}
