import { DomainError } from './errors.js';
import type { InventoryBalance, UUID } from './types.js';

export interface InventoryRepository {
  getForUpdate(input: { warehouseId: UUID; productId: UUID }): InventoryBalance | undefined;
  save(balance: InventoryBalance): void;
}

/** Pure domain operation; the infrastructure repository must execute it inside one DB transaction. */
export function reserveInventory(
  repository: InventoryRepository,
  warehouseId: UUID,
  productId: UUID,
  quantity: number,
): InventoryBalance {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new DomainError('VALIDATION_FAILED', 'Reservation quantity must be a positive integer.');
  }

  const current = repository.getForUpdate({ warehouseId, productId });
  if (!current) {
    throw new DomainError('NOT_FOUND', 'Inventory balance was not found.', { warehouseId, productId });
  }

  if (current.available < quantity) {
    throw new DomainError('INSUFFICIENT_STOCK', 'Insufficient available inventory.', {
      warehouseId,
      productId,
      requested: quantity,
      available: current.available,
    });
  }

  const next: InventoryBalance = {
    ...current,
    available: current.available - quantity,
    reserved: current.reserved + quantity,
    version: current.version + 1,
  };
  repository.save(next);
  return next;
}
