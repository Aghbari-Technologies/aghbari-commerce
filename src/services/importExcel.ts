import { readSheet } from 'read-excel-file/browser';
import { fingerprintImport, normalizeSku, validateImportRows, type ImportRow } from '../domain/import';

const REQUIRED_HEADERS = ['SKU','Name','Unit','Category','Quantity','Retail Price','Wholesale Price','Distributor Price'];

export async function parseProductWorkbook(file: File) {
  if (!file.name.toLowerCase().endsWith('.xlsx')) throw new Error('يجب رفع ملف XLSX');
  const rows = await readSheet(file);
  const [header = [], ...data] = rows;
  const normalizedHeaders = header.map((cell) => String(cell ?? '').trim());
  const missing = REQUIRED_HEADERS.filter((name) => !normalizedHeaders.includes(name));
  if (missing.length) throw new Error(`أعمدة ناقصة: ${missing.join(', ')}`);

  const index = (name: string) => normalizedHeaders.indexOf(name);
  const toNumber = (value: unknown) => Number(String(value ?? '').replace(/,/g, '').trim());
  const parsed: ImportRow[] = data.map((row, i) => ({
    rowNumber: i + 2,
    sku: normalizeSku(row[index('SKU')]),
    name: String(row[index('Name')] ?? '').trim(),
    unit: String(row[index('Unit')] ?? '').trim(),
    category: String(row[index('Category')] ?? '').trim(),
    quantity: toNumber(row[index('Quantity')]),
    prices: {
      retail: toNumber(row[index('Retail Price')]),
      wholesale: toNumber(row[index('Wholesale Price')]),
      distributor: toNumber(row[index('Distributor Price')])
    }
  }));

  return { rows: parsed, diagnostics: validateImportRows(parsed), fingerprint: fingerprintImport(parsed) };
}
