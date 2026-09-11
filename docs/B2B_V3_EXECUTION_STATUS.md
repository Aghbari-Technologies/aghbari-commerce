# B2B v3 Execution & Certification Status

## Current release candidate

- Repository: `Aghbari-Technologies/aghbari-commerce`
- Branch: `main`
- Latest source commit: `a8753e8b96ae6729161d5dd2e4abda76c39b4c61`
- Vercel deployment: `dpl_7zJcJZK9oR1QWaAWiZBjWFHVBRiE`
- Deployment target: Production
- Deployment state: READY

## Dynamic customer controls

The customer portal reads `client_ui_settings.config` and applies the following controls at runtime without a frontend rebuild:

- `showSearch`
- `showCategories`
- `showExcel`
- `showCredit`
- `showTemplates`
- `showInventory`
- `showRetailPrice`
- `showQuickOrder`
- `requireQuantityConfirmation`
- `showTieredPricing`
- `showSavingsCalculator`
- `showImageSearch`
- `showVoiceSearch`
- `showPaymentMethods`
- `paymentOnCredit`
- `paymentCash`
- `paymentTransfer`
- `minOrderValue`
- `maxOrderValue`
- `maxTemplates`

The portal subscribes to `client_ui_settings` through Supabase Realtime and also refreshes the configuration periodically as a resilience fallback.

## Enforcement completed in source

### Quantity confirmation

When `requireQuantityConfirmation=true`, every cart line must be explicitly confirmed before:

- navigating to another customer-portal section;
- submitting the order.

Changing a quantity clears that line's confirmation state.

### Tiered pricing

When `showTieredPricing=true`, available customer price tiers are displayed and the effective price is selected from the highest tier whose minimum quantity is satisfied.

When `showTieredPricing=false`, the tier table is not rendered.

### Savings calculator

When `showSavingsCalculator=true`, the customer is shown the quantity remaining to reach the next price tier.

When disabled, that guidance is not rendered.

### Payment controls

Checkout only presents payment methods whose corresponding `client_ui_settings` flags are enabled. A selected method that becomes disabled is rejected before order submission.

### Order limits

`minOrderValue` and `maxOrderValue` are checked before order submission.

## Server-authoritative order path

The customer portal does not trust a frontend-supplied warehouse as the authority when one is omitted. `src/services/orders.ts` resolves the active warehouse from the authenticated user's profile and organization before calling the `create_order` RPC.

## Security verification record

RLS tests were executed under the `authenticated` database role with a JWT subject set to each test customer. Cross-customer reads returned zero rows for:

- `carts`
- `cart_items`
- `orders`
- `order_items`
- `customer_ledger_entries`
- `customer_credit_accounts`

The test also confirmed the expected customer-owned records remain visible to the owning session.

## Dynamic toggle verification record

The `showQuickOrder` value was changed in `client_ui_settings` from `true` to `false` and read back as `false`, then restored to `true`, without a source change or deployment operation. This verifies persistence of the runtime control at the database layer.

## Certification boundary

`READY` and HTTP availability prove deployment/runtime availability only. Production certification remains blocked until an authenticated interactive browser session records the complete customer journey and verifies the visual/runtime behavior of the dynamic controls.

Required final evidence:

1. authenticated customer login;
2. catalog/search;
3. tiered pricing and savings behavior;
4. quantity confirmation enforcement;
5. side cart and quick order;
6. order template/re-order;
7. finance/ledger;
8. order submission and resulting status;
9. two authenticated customer sessions demonstrating cross-customer isolation;
10. admin toggle -> customer runtime reflection without redeploy.
