import { describe, expect, it } from 'vitest';
import { parseProductWorkbook } from './importExcel';

describe('XLSX import guardrails', () => {
  it('rejects non-XLSX files before parsing', async () => {
    await expect(parseProductWorkbook(new File(['x'], 'products.csv', { type: 'text/csv' })))
      .rejects.toThrow('XLSX');
  });

  it('rejects oversized workbooks before invoking the parser', async () => {
    const file = new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'products.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    await expect(parseProductWorkbook(file)).rejects.toThrow('20 MB');
  });
});
