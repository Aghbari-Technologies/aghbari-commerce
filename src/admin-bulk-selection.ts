export const MAX_BULK_ORDER_SELECTION = 100;

export function canSelectBulkOrder(currentSelectionSize: number, requestedAdditional = 1): boolean {
  return Number.isInteger(currentSelectionSize)
    && currentSelectionSize >= 0
    && Number.isInteger(requestedAdditional)
    && requestedAdditional >= 0
    && currentSelectionSize + requestedAdditional <= MAX_BULK_ORDER_SELECTION;
}
