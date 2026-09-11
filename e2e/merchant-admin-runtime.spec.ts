import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(password);
  await form.getByRole('button', { name: 'دخول آمن' }).click();
}

test('merchant authenticates into admin control plane with server-backed operational data', async ({ page }) => {
  const email = process.env.E2E_MERCHANT_EMAIL?.trim();
  const password = process.env.E2E_MERCHANT_PASSWORD;
  if (!email || !password) throw new Error('E2E_MERCHANT_EMAIL/E2E_MERCHANT_PASSWORD are required; merchant runtime must never silently skip.');

  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

  await login(page, email, password);
  await expect(page.getByText('بوابة الأغبري · مركز الإدارة')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('مركز التحكم')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('إدارة الطلبات')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('الصلاحيات تُفرض على الخادم أيضًا')).toBeVisible();

  const session = await page.evaluate(async () => {
    const response = await fetch('/');
    if (!response.ok) throw new Error(`Application root returned HTTP ${response.status}`);
    const entries = Object.values(localStorage);
    const authEntry = entries.find((value) => value.includes('access_token') && value.includes('refresh_token'));
    if (!authEntry) throw new Error('Authenticated browser session was not persisted');
    const parsed = JSON.parse(authEntry) as { access_token?: string; user?: { id?: string } };
    if (!parsed.access_token || !parsed.user?.id) throw new Error('Authenticated browser session is incomplete');
    return { accessToken: parsed.access_token, userId: parsed.user.id };
  });
  expect(session.userId).toMatch(/^[0-9a-f-]{36}$/i);

  const restOrigin = await page.evaluate(() => {
    const entry = performance.getEntriesByType('resource').find((item) => item.name.includes('/rest/v1/'));
    if (!entry) throw new Error('Supabase REST origin was not observed after authenticated admin load');
    return new URL(entry.name).origin;
  });
  const scripts = await page.evaluate(() => performance.getEntriesByType('resource').filter((item) => item.name.endsWith('.js')).map((item) => item.name));
  let apiKey = '';
  for (const script of scripts) {
    const response = await page.request.get(script);
    if (!response.ok()) continue;
    const text = await response.text();
    const match = text.match(/sb_publishable_[A-Za-z0-9_-]+/);
    if (match?.[0]) { apiKey = match[0]; break; }
  }
  expect(apiKey).toMatch(/^sb_publishable_/);
  const headers = { Authorization: `Bearer ${session.accessToken}`, apikey: apiKey };

  const profile = await page.request.get(`${restOrigin}/rest/v1/profiles?select=organization_id,role&id=eq.${session.userId}`, { headers });
  expect(profile.ok()).toBeTruthy();
  const profiles = await profile.json() as Array<{ organization_id: string; role: string }>;
  expect(profiles).toHaveLength(1);
  expect(['owner', 'admin', 'sales', 'warehouse']).toContain(profiles[0].role);

  const products = await page.request.get(`${restOrigin}/rest/v1/products?select=id,sku,name,status&organization_id=eq.${profiles[0].organization_id}&status=eq.active&limit=5`, { headers });
  expect(products.ok()).toBeTruthy();
  const productRows = await products.json() as Array<{ id: string; sku: string; name: string; status: string }>;
  expect(productRows.length).toBeGreaterThan(0);
  expect(productRows.every((row) => row.status === 'active')).toBeTruthy();

  const orders = await page.request.get(`${restOrigin}/rest/v1/orders?select=id,order_number,status,total,currency&organization_id=eq.${profiles[0].organization_id}&order=created_at.desc&limit=5`, { headers });
  expect(orders.ok()).toBeTruthy();
  const orderRows = await orders.json() as Array<{ id: string; order_number: number; status: string; total: number; currency: string }>;
  expect(orderRows.every((row) => row.total >= 0)).toBeTruthy();

  expect(pageErrors, `Merchant page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(consoleErrors, `Merchant console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
});
