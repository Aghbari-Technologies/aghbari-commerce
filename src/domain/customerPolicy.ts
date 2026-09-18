export type PaymentMethod = 'credit' | 'cash' | 'transfer';

export type ClientUiConfig = {
  showSearch: boolean; showCategories: boolean; showExcel: boolean; showCredit: boolean; showTemplates: boolean;
  showInventory: boolean; showRetailPrice: boolean; showQuickOrder: boolean; requireQuantityConfirmation: boolean;
  showTieredPricing: boolean; showSavingsCalculator: boolean; showImageSearch: boolean; showVoiceSearch: boolean;
  showPaymentMethods: boolean; paymentOnCredit: boolean; paymentCash: boolean; paymentTransfer: boolean;
  minOrderValue: number; maxOrderValue: number; maxTemplates: number;
};

export const DEFAULT_CUSTOMER_PORTAL_CONFIG: ClientUiConfig = {
  showSearch:true, showCategories:true, showExcel:true, showCredit:true, showTemplates:true, showInventory:true,
  showRetailPrice:false, showQuickOrder:true, requireQuantityConfirmation:true, showTieredPricing:true,
  showSavingsCalculator:true, showImageSearch:false, showVoiceSearch:false, showPaymentMethods:true,
  paymentOnCredit:true, paymentCash:true, paymentTransfer:true, minOrderValue:0, maxOrderValue:0, maxTemplates:50,
};

export function isPaymentMethodEnabled(config: ClientUiConfig, method: PaymentMethod): boolean {
  if (method === 'credit') return config.paymentOnCredit;
  if (method === 'cash') return config.paymentCash;
  return config.paymentTransfer;
}
export function firstEnabledPaymentMethod(config: ClientUiConfig): PaymentMethod | null {
  return (['credit','cash','transfer'] as PaymentMethod[]).find((method) => isPaymentMethodEnabled(config, method)) ?? null;
}
export function validateCheckoutPolicy(input: {
  config: ClientUiConfig; paymentMethod: PaymentMethod; total: number;
  lineProductIds: string[]; confirmedProductIds: Set<string>;
}): string | null {
  const { config, paymentMethod, total, lineProductIds, confirmedProductIds } = input;
  if (!Number.isFinite(total) || total < 0) return 'إجمالي الطلب غير صالح.';
  if (!isPaymentMethodEnabled(config, paymentMethod)) return 'طريقة الدفع المختارة غير متاحة حاليًا.';
  if (config.minOrderValue > 0 && total < config.minOrderValue) return `الحد الأدنى للطلب هو ${config.minOrderValue.toLocaleString('ar-YE')}.`;
  if (config.maxOrderValue > 0 && total > config.maxOrderValue) return `الحد الأعلى للطلب هو ${config.maxOrderValue.toLocaleString('ar-YE')}.`;
  if (config.requireQuantityConfirmation && lineProductIds.some((id) => !confirmedProductIds.has(id))) return 'يجب تأكيد كمية كل صنف قبل إرسال الطلب.';
  return null;
}
