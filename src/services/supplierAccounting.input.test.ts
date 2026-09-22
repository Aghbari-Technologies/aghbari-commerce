import { describe, expect, it } from 'vitest';
import { validateSupplierBillInput, validateSupplierPaymentInput } from './supplierAccounting';
const supplier='11111111-1111-4111-8111-111111111111';
const bill='22222222-2222-4222-8222-222222222222';
const cash='33333333-3333-4333-8333-333333333333';
const key='supplier-key-20260922-01';
describe('supplier accounting input boundaries',()=>{
 it('accepts valid bill and payment',()=>{
  expect(()=>validateSupplierBillInput({supplierId:supplier,billNumber:'INV-100',total:1250,currency:'YER',idempotencyKey:key})).not.toThrow();
  expect(()=>validateSupplierPaymentInput({supplierBillId:bill,amount:50,method:'cash',cashAccountId:cash,reference:'REF-1',idempotencyKey:key})).not.toThrow();
 });
 it('rejects malformed bill values',()=>{
  expect(()=>validateSupplierBillInput({supplierId:'bad',billNumber:'INV',total:1,currency:'YER',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierBillInput({supplierId:supplier,billNumber:' ',total:1,currency:'YER',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierBillInput({supplierId:supplier,billNumber:'INV',total:0,currency:'YER',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierBillInput({supplierId:supplier,billNumber:'INV',total:1,currency:'Y',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierBillInput({supplierId:supplier,billNumber:'INV',total:1,currency:'YER',idempotencyKey:'short'})).toThrow();
 });
 it('rejects malformed payment values',()=>{
  expect(()=>validateSupplierPaymentInput({supplierBillId:'bad',amount:50,method:'cash',cashAccountId:cash,reference:'x',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierPaymentInput({supplierBillId:bill,amount:0,method:'cash',cashAccountId:cash,reference:'x',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierPaymentInput({supplierBillId:bill,amount:50,method:'crypto',cashAccountId:null,reference:'x',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierPaymentInput({supplierBillId:bill,amount:50,method:'cash',cashAccountId:'bad',reference:'x',idempotencyKey:key})).toThrow();
  expect(()=>validateSupplierPaymentInput({supplierBillId:bill,amount:50,method:'cash',cashAccountId:null,reference:'x'.repeat(201),idempotencyKey:key})).toThrow();
 });
});
