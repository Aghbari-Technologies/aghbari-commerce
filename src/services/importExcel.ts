import { readSheet } from 'read-excel-file/browser';
import { fingerprintImport, normalizeSku, validateImportRows, type ImportRow } from '../domain/import';
import { requireSupabase } from '../lib/supabase';

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

  return { rows: parsed, diagnostics: validateImportRows(parsed), fingerprint: await fingerprintImport(parsed) };
}

export async function stageProductImport(file: File) {
  const parsed = await parseProductWorkbook(file);
  if (parsed.diagnostics.length) return { ...parsed, jobId: null };
  const { data, error } = await requireSupabase().rpc('stage_product_import', {
    p_source_name: file.name,
    p_source_fingerprint: parsed.fingerprint,
    p_rows: parsed.rows
  });
  if (error) throw error;
  return { ...parsed, jobId: data as string };
}

export async function commitProductImport(importJobId: string, warehouseId: string) {
  const { data, error } = await requireSupabase().rpc('commit_product_import', {
    p_import_job_id: importJobId,
    p_warehouse_id: warehouseId
  });
  if (error) throw error;
  return data?.[0] ?? null;
}
