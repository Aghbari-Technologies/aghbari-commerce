import * as XLSX from 'xlsx';

export type ImportRow = Record<string, unknown>;
export type ImportDiagnostic = { row: number; field?: string; code: string; message: string };
export type ProductImportResult = { rows: ImportRow[]; normalized: ImportRow[]; diagnostics: ImportDiagnostic[]; fingerprint: string };

const required = ['sku', 'name', 'unit'];
const aliases: Record<string, string> = { SKU: 'sku', sku: 'sku', الاسم: 'name', Name: 'name', name: 'name', الوحدة: 'unit', Unit: 'unit', unit: 'unit', description: 'description', الوصف: 'description' };

function normalizeKey(key: string) { return aliases[key.trim()] ?? key.trim().toLowerCase(); }
function normalizeRow(row: ImportRow) { return Object.fromEntries(Object.entries(row).map(([k, v]) => [normalizeKey(k), typeof v === 'string' ? v.trim() : v])); }

export async function parseProductWorkbook(file: File): Promise<ProductImportResult> {
  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: 'array', raw: false, cellFormula: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('IMPORT_EMPTY_WORKBOOK');
  const raw = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: null });
  const diagnostics: ImportDiagnostic[] = [];
  const normalized = raw.map((row, index) => {
    const value = normalizeRow(row);
    for (const field of required) if (!String(value[field] ?? '').trim()) diagnostics.push({ row: index + 2, field, code: 'REQUIRED', message: `${field} is required` });
    if (value.sku && String(value.sku).length > 120) diagnostics.push({ row: index + 2, field: 'sku', code: 'TOO_LONG', message: 'sku exceeds 120 characters' });
    return value;
  });
  const seen = new Map<string, number>();
  normalized.forEach((row, index) => {
    const sku = String(row.sku ?? '').trim().toUpperCase();
    if (!sku) return;
    const previous = seen.get(sku);
    if (previous) diagnostics.push({ row: index + 2, field: 'sku', code: 'DUPLICATE', message: `duplicate sku; first seen on row ${previous}` });
    else seen.set(sku, index + 2);
    row.sku = sku;
  });
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const fingerprint = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { rows: raw, normalized, diagnostics, fingerprint };
}
