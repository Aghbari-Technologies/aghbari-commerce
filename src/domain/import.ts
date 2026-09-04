export interface ImportRow {
  rowNumber: number;
  sku: string;
  name: string;
  unit: string;
  category: string;
  quantity: number;
  prices: { retail: number; wholesale: number; distributor: number };
}

export interface ImportDiagnostic { rowNumber: number; field: string; message: string; }

export const MAX_IMPORT_ROWS = 50_000;

export function normalizeSku(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

export function validateImportRows(rows: ImportRow[]): ImportDiagnostic[] {
  const diagnostics: ImportDiagnostic[] = [];
  if (rows.length > MAX_IMPORT_ROWS) {
    diagnostics.push({ rowNumber: 0, field: 'file', message: `File cannot contain more than ${MAX_IMPORT_ROWS} data rows` });
    return diagnostics;
  }

  const seen = new Set<string>();
  for (const row of rows) {
    const sku = normalizeSku(row.sku);
    const name = String(row.name ?? '').trim();
    const unit = String(row.unit ?? '').trim();
    const category = String(row.category ?? '').trim();
    if (!sku) diagnostics.push({ rowNumber: row.rowNumber, field: 'sku', message: 'SKU is required' });
    else if (seen.has(sku)) diagnostics.push({ rowNumber: row.rowNumber, field: 'sku', message: 'Duplicate SKU in file' });
    else seen.add(sku);
    if (!name) diagnostics.push({ rowNumber: row.rowNumber, field: 'name', message: 'Name is required' });
    if (!unit) diagnostics.push({ rowNumber: row.rowNumber, field: 'unit', message: 'Unit is required' });
    if (!category) diagnostics.push({ rowNumber: row.rowNumber, field: 'category', message: 'Category is required' });
    if (!Number.isInteger(row.quantity) || row.quantity < 0) diagnostics.push({ rowNumber: row.rowNumber, field: 'quantity', message: 'Quantity must be a non-negative integer' });
    for (const [tier, price] of Object.entries(row.prices)) {
      if (!Number.isFinite(price) || price < 0) diagnostics.push({ rowNumber: row.rowNumber, field: `price.${tier}`, message: 'Price must be a non-negative number' });
    }
  }
  return diagnostics;
}

function canonicalize(rows: ImportRow[]): string {
  return JSON.stringify(rows.map((row) => ({
    sku: normalizeSku(row.sku),
    name: String(row.name ?? '').trim(),
    unit: String(row.unit ?? '').trim(),
    category: String(row.category ?? '').trim(),
    quantity: row.quantity,
    prices: {
      retail: row.prices.retail,
      wholesale: row.prices.wholesale,
      distributor: row.prices.distributor
    }
  })));
}

/** SHA-256 over canonical import content; stable across equivalent formatting. */
export async function fingerprintImport(rows: ImportRow[]): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalize(rows));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
