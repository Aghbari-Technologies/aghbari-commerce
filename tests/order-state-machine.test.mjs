import test from 'node:test';
import assert from 'node:assert/strict';

const transitions = { draft: ['pending', 'cancelled'], pending: ['confirmed', 'cancelled'], confirmed: ['processing', 'cancelled'], processing: ['ready'], ready: ['delivered'], delivered: [], cancelled: [] };

test('order state machine rejects arbitrary jumps', () => {
  assert.equal(transitions.pending.includes('processing'), false);
  assert.equal(transitions.pending.includes('confirmed'), true);
  assert.equal(transitions.ready.includes('delivered'), true);
  assert.equal(transitions.delivered.includes('cancelled'), false);
});

test('customer cancellation is bounded to pre-fulfillment states', () => {
  assert.equal(transitions.draft.includes('cancelled'), true);
  assert.equal(transitions.pending.includes('cancelled'), true);
  assert.equal(transitions.confirmed.includes('cancelled'), true);
  assert.equal(transitions.processing.includes('cancelled'), false);
});
