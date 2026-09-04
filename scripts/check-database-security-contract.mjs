import fs from 'node:fs';
import path from 'node:path';

const migrationDir = 'supabase/migrations';
const files = fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
const sql = files.map((name) => fs.readFileSync(path.join(migrationDir, name), 'utf8')).join('\n');

const tenantTables = [
  'organizations', 'branches', 'warehouses', 'customers', 'profiles', 'categories', 'products',
  'product_media', 'price_lists', 'product_prices', 'inventory_balances', 'inventory_movements',
  'carts', 'cart_items', 'orders', 'order_items', 'order_status_history', 'outbox_events', 'audit_events'
];

for (const table of tenantTables) {
  const enabled = new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security\\s*;`, 'i').test(sql);
  if (!enabled) throw new Error(`RLS missing for public.${table}`);
}

if (/grant\s+execute\s+on\s+function\s+[^;]+\s+to\s+anon\s*;/i.test(sql)) {
  throw new Error('Anonymous EXECUTE grant detected on a database function.');
}

const functionChunks = sql.split(/(?=^create\s+(?:or\s+replace\s+)?function\s+public\.)/gim);
for (const chunk of functionChunks) {
  if (!/security\s+definer/i.test(chunk)) continue;
  const definition = chunk.slice(0, chunk.indexOf('$$') === -1 ? chunk.length : chunk.indexOf('$$'));
  if (!/set\s+search_path\s*=\s*public/i.test(definition)) {
    throw new Error('SECURITY DEFINER function without explicit SET search_path = public detected.');
  }
}

const requiredStoragePolicies = [
  'product_media_select', 'product_media_insert', 'product_media_update', 'product_media_delete'
];
for (const policy of requiredStoragePolicies) {
  if (!new RegExp(`create\\s+policy\\s+${policy}\\s+on\\s+storage\\.objects`, 'i').test(sql)) {
    throw new Error(`Required product-media storage policy missing: ${policy}`);
  }
}

console.log(`Database security contract: PASS (${files.length} migrations scanned)`);
