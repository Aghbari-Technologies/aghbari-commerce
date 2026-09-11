import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/');
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(password);
  await form.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByRole('link', { name: 'المنتجات' })).toBeVisible();
}

test('expired browser session fails closed after refresh', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');

  await login(page, email, password);
  await expect(page.getByRole('button', { name: /السلة/ })).toBeVisible();

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'دخول آمن' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'المنتجات' })).toHaveCount(0);
});

test('malformed unauthenticated RPC request cannot mutate customer cart', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');

  await login(page, email, password);
  const supabaseOrigin = await page.evaluate(() => {
    const resource = performance.getEntriesByType('resource').find((entry) => entry.name.includes('/rest/v1/'))?.name;
    if (!resource) throw new Error('Supabase REST origin was not observed');
    return new URL(resource).origin;
  });

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const response = await page.request.post(`${supabaseOrigin}/rest/v1/rpc/set_cart_item`, {
    headers: { 'Content-Type': 'application/json' },
    data: { p_product_id: '00000000-0000-4000-8000-000000000001', p_quantity: 1 }
  });
  expect([401, 403, 404]).toContain(response.status());
});
