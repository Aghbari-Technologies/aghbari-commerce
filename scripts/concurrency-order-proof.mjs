import { createClient } from '@supabase/supabase-js';

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required; concurrency proof must never silently skip.`);
  return value;
};

const url = env('SUPABASE_URL');
const anonKey = env('SUPABASE_ANON_KEY');
const staffEmail = env('CONCURRENCY_STAFF_EMAIL');
const staffPassword = env('CONCURRENCY_STAFF_PASSWORD');
const emailA = env('CONCURRENCY_EMAIL_A');
const passwordA = env('CONCURRENCY_PASSWORD_A');
const emailB = env('CONCURRENCY_EMAIL_B');
const passwordB = env('CONCURRENCY_PASSWORD_B');
const exactSha = env('CONCURRENCY_EXACT_SHA');
if (!/^[0-9a-f]{40}$/.test(exactSha)) throw new Error(`Invalid CONCURRENCY_EXACT_SHA: ${exactSha}`);

const staff = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const clientA = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const clientB = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function signIn(client, email, password, label) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(`${label} login failed: ${error?.message ?? 'user missing'}`);
  return data.user;
}

const staffUser = await signIn(staff, staffEmail, staffPassword, 'staff');
const userA = await signIn(clientA, emailA, passwordA, 'customer A');
const userB = await signIn(clientB, emailB, passwordB, 'customer B');

const [{ data: profileA, error: profileAError }, { data: profileB, error: profileBError }] = await Promise.all([
  staff.from('profiles').select('organization_id,customer_id,role').eq('id', userA.id).single(),
  staff.from('profiles').select('organization_id,customer_id,role').eq('id', userB.id).single(),
]);
if (profileAError || !profileA) throw new Error(`Customer A profile lookup failed: ${profileAError?.message ?? 'missing profile'}`);
if (profileBError || !profileB) throw new Error(`Customer B profile lookup failed: ${profileBError?.message ?? 'missing profile'}`);
if (profileA.organization_id !== profileB.organization_id) throw new Error('Concurrency proof requires Customer A and B in the same organization.');
if (!profileA.customer_id || !profileB.customer_id || profileA.customer_id === profileB.customer_id) throw new Error('Concurrency proof requires two distinct customer contexts.');

const orgId = profileA.organization_id;
const [{ data: warehouse, error: warehouseError }, { data: commonCatalogA, error: catalogAError }, { data: commonCatalogB, error: catalogBError }] = await Promise.all([
  staff.from('warehouses').select('id,name').eq('organization_id', orgId).eq('is_active', true).limit(1).maybeSingle(),
  clientA.rpc('get_catalog', { p_search: null, p_category_id: null, p_limit: 100, p_offset: 0 }),
  clientB.rpc('get_catalog', { p_search: null, p_category_id: null, p_limit: 100, p_offset: 0 }),
]);
if (warehouseError || !warehouse) throw new Error(`Active warehouse unavailable: ${warehouseError?.message ?? 'missing warehouse'}`);
if (catalogAError) throw new Error(`Customer A catalog lookup failed: ${catalogAError.message}`);
if (catalogBError) throw new Error(`Customer B catalog lookup failed: ${catalogBError.message}`);
const productsB = new Map((commonCatalogB ?? []).map((row) => [row.id, row]));
const shared = (commonCatalogA ?? []).find((row) => productsB.has(row.id));
if (!shared) throw new Error('No common authorized product is visible to both customer contexts.');
const productId = shared.id;

const { data: before, error: beforeError } = await staff.from('inventory_balances').select('quantity').eq('organization_id', orgId).eq('warehouse_id', warehouse.id).eq('product_id', productId).maybeSingle();
if (beforeError) throw new Error(`Inventory lookup failed: ${beforeError.message}`);
const initialQuantity = before?.quantity ?? 0;
const setToFiveDelta = 5 - initialQuantity;
if (setToFiveDelta !== 0) {
  const { error } = await staff.rpc('adjust_inventory', {
    p_warehouse_id: warehouse.id,
    p_product_id: productId,
    p_delta: setToFiveDelta,
    p_reason: `certification concurrency fixture ${exactSha}`,
  });
  if (error) throw new Error(`Failed to seed Stock=5: ${error.message}`);
}

const keyA = `conc-${exactSha.slice(0, 12)}-a-${Date.now()}`;
const keyB = `conc-${exactSha.slice(0, 12)}-b-${Date.now()}`;
const payload = (key) => ({ p_idempotency_key: key, p_warehouse_id: warehouse.id, p_lines: [{ product_id: productId, quantity: 5 }] });

let resultA;
let resultB;
try {
  [resultA, resultB] = await Promise.all([
    clientA.rpc('create_order', payload(keyA)),
    clientB.rpc('create_order', payload(keyB)),
  ]);
} finally {
  const { data: afterRace } = await staff.from('inventory_balances').select('quantity').eq('organization_id', orgId).eq('warehouse_id', warehouse.id).eq('product_id', productId).maybeSingle();
  const currentQuantity = afterRace?.quantity ?? 0;
  const restoreDelta = initialQuantity - currentQuantity;
  if (restoreDelta !== 0) {
    const { error } = await staff.rpc('adjust_inventory', {
      p_warehouse_id: warehouse.id,
      p_product_id: productId,
      p_delta: restoreDelta,
      p_reason: `restore concurrency fixture ${exactSha}`,
    });
    if (error) throw new Error(`Failed to restore inventory fixture: ${error.message}`);
  }
}

const successes = [resultA, resultB].filter((result) => !result.error && result.data?.length === 1);
const failures = [resultA, resultB].filter((result) => result.error);
console.log(JSON.stringify({
  exact_sha: exactSha,
  organization_id: orgId,
  warehouse_id: warehouse.id,
  product_id: productId,
  initial_stock: initialQuantity,
  requested: { customer_a: 5, customer_b: 5 },
  success_count: successes.length,
  failure_count: failures.length,
  customer_a: resultA?.error ? { ok: false, code: resultA.error.code, message: resultA.error.message } : { ok: true, data: resultA.data },
  customer_b: resultB?.error ? { ok: false, code: resultB.error.code, message: resultB.error.message } : { ok: true, data: resultB.data },
}, null, 2));

if (successes.length !== 1 || failures.length !== 1) throw new Error('CONCURRENCY FAIL: expected exactly one successful 5-unit order and one rejected order.');
const rejected = failures[0].error;
if (!['P0001', '40001', '23505'].includes(rejected.code)) throw new Error(`CONCURRENCY FAIL: unexpected rejection code ${rejected.code}`);

const { data: stockCheck, error: stockError } = await staff.from('inventory_balances').select('quantity').eq('organization_id', orgId).eq('warehouse_id', warehouse.id).eq('product_id', productId).maybeSingle();
if (stockError) throw new Error(`Post-proof inventory lookup failed: ${stockError.message}`);
if ((stockCheck?.quantity ?? -1) !== initialQuantity) throw new Error(`CONCURRENCY FAIL: inventory was not restored to ${initialQuantity}.`);

console.log('CONCURRENCY PROOF: PASS (Stock=5, A=5, B=5 => exactly one order succeeds; no oversell; fixture restored).');
