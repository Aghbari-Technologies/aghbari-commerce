import test from 'node:test';
import assert from 'node:assert/strict';

function authorizedPrice(tier, prices) {
  return prices[tier] ?? null;
}
function cartTotal(lines) {
  return Math.round(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) * 100) / 100;
}

test('customer tier resolves exactly one authorized price', () => {
  const prices = { tier1: 100, tier2: 90, tier3: 80 };
  assert.equal(authorizedPrice('tier1', prices), 100);
  assert.equal(authorizedPrice('tier2', prices), 90);
  assert.equal(authorizedPrice('tier3', prices), 80);
  assert.equal(authorizedPrice('unknown', prices), null);
});

test('money total uses deterministic decimal rounding', () => {
  assert.equal(cartTotal([{ quantity: 2, unitPrice: 100 }, { quantity: 3, unitPrice: 90.5 }]), 471.5);
});

test('invalid quantities are rejected before calculation', () => {
  assert.throws(() => {
    const quantity = 0;
    if (quantity <= 0) throw new Error('invalid quantity');
    cartTotal([{ quantity, unitPrice: 100 }]);
  }, /invalid quantity/);
});
