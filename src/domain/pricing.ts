import type { CustomerTier, ProductPrice } from './types';

/**
 * Client-side code may display a price already returned by the server, but it
 * must never be treated as authoritative. The server/RPC must resolve tier and
 * effective price from the authenticated customer context.
 */
export function resolveDisplayPrice(
  prices: ProductPrice[],
  tier: CustomerTier,
  now = new Date()
): ProductPrice | undefined {
  return prices
    .filter((price) => price.tier === tier)
    .filter((price) => new Date(price.validFrom) <= now)
    .filter((price) => !price.validTo || new Date(price.validTo) > now)
    .sort((a, b) => Date.parse(b.validFrom) - Date.parse(a.validFrom))[0];
}

export function effectiveCatalogPrice(
  tiers: Array<{ min_quantity: number; unit_price: number }>,
  basePrice: number | null | undefined,
  quantity: number
): number {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return 0;
  const match = tiers
    .filter((tier) =>
      Number.isSafeInteger(tier.min_quantity) &&
      tier.min_quantity > 0 &&
      Number.isFinite(tier.unit_price) &&
      tier.unit_price >= 0
    )
    .sort((a, b) => b.min_quantity - a.min_quantity)
    .find((tier) => quantity >= tier.min_quantity);
  if (match) return match.unit_price;
  return typeof basePrice === 'number' && Number.isFinite(basePrice) && basePrice >= 0 ? basePrice : 0;
}

export function formatMoney(amount: number, currency = 'YER'): string {
  return new Intl.NumberFormat('ar-YE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}
