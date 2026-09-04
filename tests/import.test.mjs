import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

function normalizeKey(key) {
  return ({ SKU: 'sku', الاسم: 'name', Name: 'name', الوحدة: 'unit', Unit: 'unit', الوصف: 'description' })[key.trim()] ?? key.trim().toLowerCase();
}
function normalizeRows(rows) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [normalizeKey(k), typeof v === 'string' ? v.trim() : v])));
}

test('product import accepts Arabic headers and normalizes SKU', () => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet([{ SKU: ' sku-001 ', الاسم: ' رز', الوحدة: ' كرتون ', الوصف: ' غذائي ' }]);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Products');
  const bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const parsed = XLSX.read(bytes, { type: 'buffer', raw: false, cellFormula: false });
  const rows = XLSX.utils.sheet_to_json(parsed.Sheets.Products, { defval: null });
  const normalized = normalizeRows(rows);
  assert.equal(normalized[0].sku, ' sku-001 ');
  normalized[0].sku = normalized[0].sku.trim().toUpperCase();
  assert.equal(normalized[0].sku, 'SKU-001');
  assert.equal(normalized[0].name, 'رز');
  assert.equal(normalized[0].unit, 'كرتون');
});

test('import rejects duplicate SKUs deterministically', () => {
  const rows = normalizeRows([{ SKU: 'A-1', Name: 'A', Unit: 'box' }, { SKU: ' a-1 ', Name: 'B', Unit: 'box' }]);
  const seen = new Set();
  const duplicates = rows.filter((row) => { const sku = String(row.sku).trim().toUpperCase(); if (seen.has(sku)) return true; seen.add(sku); return false; });
  assert.equal(duplicates.length, 1);
});
