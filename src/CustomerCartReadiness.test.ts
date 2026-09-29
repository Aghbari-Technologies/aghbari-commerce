import { describe, expect, it } from 'vitest';
import { MAX_ORDER_QUANTITY_PER_LINE } from './domain/order';

describe('customer cart readiness contract',()=>{
 it('keeps the existing per-line ceiling available to readiness surfaces',()=>expect(MAX_ORDER_QUANTITY_PER_LINE).toBeGreaterThan(0));
});
