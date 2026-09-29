import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer server-paged orders integration contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  it('consumes getCustomerOrdersPage as a direct array result', () => {
    expect(source).toContain('const [orderRows,{data:account,error:accountError},{data:ledger,error:ledgerError}]');
    expect(source).not.toContain('const [{data:orderRows,error:ordersError}');
  });
});
