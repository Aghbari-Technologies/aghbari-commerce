export const MAX_BULK_PRODUCT_SELECTION = 50;

export function canSelectBulkProduct(currentSelectionSize: number, requestedAdditional = 1) {
  if (!Number.isInteger(currentSelectionSize) || !Number.isInteger(requestedAdditional)) return false;
  if (currentSelectionSize < 0 || requestedAdditional < 0) return false;
  return currentSelectionSize + requestedAdditional <= MAX_BULK_PRODUCT_SELECTION;
}
