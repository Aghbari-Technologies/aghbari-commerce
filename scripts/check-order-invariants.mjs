import fs from 'node:fs';
import assert from 'node:assert/strict';

const sql = fs.readFileSync('supabase/migrations/0025_idempotency_race_authority_hardening.sql', 'utf8');
assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\(v_org::text \|\| ':' \|\| v_requested_key, 0\)\)/);
assert.match(sql, /active-cart conversion/);
assert.match(sql, /status = 'converted'/);
assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.create_order\(text, uuid, jsonb\) TO authenticated/);
assert.match(sql, /REVOKE EXECUTE ON FUNCTION public\.create_order\(text, uuid, jsonb\) FROM anon/);
assert.match(sql, /duplicate product line/);
assert.match(sql, /idempotency key payload conflict/);
console.log('Order invariant static contract: PASS');
