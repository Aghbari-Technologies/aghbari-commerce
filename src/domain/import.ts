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
export const MAX_IMPORT_SKU_LENGTH = 80;
export const MAX_IMPORT_NAME_LENGTH = 240;
export const MAX_IMPORT_UNIT_LENGTH = 80;
export const MAX_IMPORT_CATEGORY_LENGTH = 120;
export const MAX_IMPORT_QUANTITY = 10_000;
export const MAX_IMPORT_PRICE = 9_007_199_254_740_991 / 100;

export function normalizeSku(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function isValidMoney(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= MAX_IMPORT_PRICE
    && Number.isSafeInteger(Math.round(value * 100));
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
    else if (sku.length > MAX_IMPORT_SKU_LENGTH) diagnostics.push({ rowNumber: row.rowNumber, field: 'sku', message: `SKU cannot exceed ${MAX_IMPORT_SKU_LENGTH} characters` });
    else if (seen.has(sku)) diagnostics.push({ rowNumber: row.rowNumber, field: 'sku', message: 'Duplicate SKU in file' });
    else seen.add(sku);
    if (!name) diagnostics.push({ rowNumber: row.rowNumber, field: 'name', message: 'Name is required' });
    else if (name.length > MAX_IMPORT_NAME_LENGTH) diagnostics.push({ rowNumber: row.rowNumber, field: 'name', message: `Name cannot exceed ${MAX_IMPORT_NAME_LENGTH} characters` });
    if (!unit) diagnostics.push({ rowNumber: row.rowNumber, field: 'unit', message: 'Unit is required' });
    else if (unit.length > MAX_IMPORT_UNIT_LENGTH) diagnostics.push({ rowNumber: row.rowNumber, field: 'unit', message: `Unit cannot exceed ${MAX_IMPORT_UNIT_LENGTH} characters` });
    if (!category) diagnostics.push({ rowNumber: row.rowNumber, field: 'category', message: 'Category is required' });
    else if (category.length > MAX_IMPORT_CATEGORY_LENGTH) diagnostics.push({ rowNumber: row.rowNumber, field: 'category', message: `Category cannot exceed ${MAX_IMPORT_CATEGORY_LENGTH} characters` });
    if (!Number.isSafeInteger(row.quantity) || row.quantity < 0 || row.quantity > MAX_IMPORT_QUANTITY) diagnostics.push({ rowNumber: row.rowNumber, field: 'quantity', message: `Quantity must be a non-negative safe integer not exceeding ${MAX_IMPORT_QUANTITY}` });
    for (const [tier, price] of Object.entries(row.prices)) {
      if (!isValidMoney(price)) diagnostics.push({ rowNumber: row.rowNumber, field: `price.${tier}`, message: 'Price must be a non-negative finite amount with safe cent precision' });
    }
  }
  return diagnostics;
}

function canonicalize(rows: ImportRow[]): string {
  // Row number and spreadsheet order are transport details, not product identity.
  return JSON.stringify([...rows]
    .map((row) => ({
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
    }))
    .sort((a, b) => a.sku.localeCompare(b.sku)));
}

/** SHA-256 over canonical import content; stable across equivalent formatting and row order. */
export async function fingerprintImport(rows: ImportRow[]): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalize(rows));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
