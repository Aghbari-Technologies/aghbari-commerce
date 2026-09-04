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

export function normalizeSku(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

export function validateImportRows(rows: ImportRow[]): ImportDiagnostic[] {
  const diagnostics: ImportDiagnostic[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const sku = normalizeSku(row.sku);
    if (!sku) diagnostics.push({ rowNumber: row.rowNumber, field: 'sku', message: 'SKU is required' });
    else if (seen.has(sku)) diagnostics.push({ rowNumber: row.rowNumber, field: 'sku', message: 'Duplicate SKU in file' });
    else seen.add(sku);
    if (!row.name.trim()) diagnostics.push({ rowNumber: row.rowNumber, field: 'name', message: 'Name is required' });
    if (!row.unit.trim()) diagnostics.push({ rowNumber: row.rowNumber, field: 'unit', message: 'Unit is required' });
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
    name: row.name.trim(),
    unit: row.unit.trim(),
    category: row.category.trim(),
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
