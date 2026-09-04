export interface PriceCandidate {
  readonly productId: string;
  readonly priceListId: string;
  readonly unitPrice: number;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly active: boolean;
}

export interface PricingContext {
  readonly customerId: string;
  readonly tierId: string;
  readonly at: string;
}

export function resolveAuthorizedPrice(
  productId: string,
  context: PricingContext,
  candidates: readonly PriceCandidate[],
): PriceCandidate {
  const at = Date.parse(context.at);
  if (!Number.isFinite(at)) throw new Error('VALIDATION_FAILED:pricing_context');

  const matches = candidates
    .filter((price) => price.productId === productId && price.active)
    .filter((price) => Date.parse(price.effectiveFrom) <= at)
    .filter((price) => !price.effectiveTo || at < Date.parse(price.effectiveTo))
    .filter((price) => price.priceListId === context.tierId);

  if (matches.length === 0) throw new Error(`NOT_FOUND:AUTHORIZED_PRICE:${productId}`);

  const sorted = [...matches].sort(
    (a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom),
  );

  const selected = sorted[0];
  if (!Number.isFinite(selected.unitPrice) || selected.unitPrice < 0) {
    throw new Error('VALIDATION_FAILED:price');
  }
  return selected;
}

export function calculateOrderTotal(lines: readonly { quantity: number; unitPrice: number }[]): number {
  let total = 0;
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error('VALIDATION_FAILED:quantity');
    }
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
      throw new Error('VALIDATION_FAILED:unitPrice');
    }
    total += line.quantity * line.unitPrice;
  }

  return Math.round((total + Number.EPSILON) * 100) / 100;
}
