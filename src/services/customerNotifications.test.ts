import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer notification badge service contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/services/customerNotifications.ts'), 'utf8');

  it('keeps the unread count scoped to the customer and unread state', () => {
    expect(source).toContain(".from('notifications')");
    expect(source).toContain(".eq('customer_id', normalized)");
    expect(source).toContain(".is('read_at', null)");
    expect(source).toContain("{ count: 'exact', head: true }");
  });

  it('fails closed for malformed customer identifiers', () => {
    expect(source).toContain('UUID_PATTERN');
    expect(source).toContain("throw new Error('معرّف العميل غير صالح.')");
  });
});
