export type CustomerPriceTier = {
  minQuantity: number;
  unitPrice: number;
  currency: string;
};

export function resolveCustomerPortalPrice(input: {
  authorizedPrice: number | null | undefined;
  authorizedCurrency: string | null | undefined;
  tiers: CustomerPriceTier[];
  quantity: number;
}) {
  const basePrice = Number.isFinite(input.authorizedPrice) && (input.authorizedPrice ?? 0) >= 0 ? input.authorizedPrice! : 0;
  const baseCurrency = input.authorizedCurrency?.trim() || 'YER';
  const safeQuantity = Number.isSafeInteger(input.quantity) && input.quantity >= 1 ? input.quantity : 1;
  const tier = [...input.tiers]
    .filter((item) => Number.isSafeInteger(item.minQuantity) && item.minQuantity >= 1 && Number.isFinite(item.unitPrice) && item.unitPrice >= 0 && item.currency.trim())
    .filter((item) => item.minQuantity <= safeQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return tier
    ? { unitPrice: tier.unitPrice, currency: tier.currency.trim() }
    : { unitPrice: basePrice, currency: baseCurrency };
}
