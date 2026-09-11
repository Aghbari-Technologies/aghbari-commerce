import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await expect(page.getByText('بوابة الأغبري', { exact: false }).first()).toBeVisible();
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByRole('link', { name: 'المنتجات' })).toBeVisible();
  await expect(page.getByRole('button', { name: /السلة/ })).toBeVisible();
}

function captureBrowserFailures(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400 && !response.url().endsWith('/favicon.ico')) {
      failedResponses.push(`${status} ${response.request().method()} ${response.url()}`);
    }
  });
  return { pageErrors, consoleErrors, failedResponses };
}

async function browserSupabaseSession(page: Page) {
  return page.evaluate(async () => {
    const entries = Object.values(localStorage);
    const authEntry = entries.find((value) => value.includes('access_token') && value.includes('refresh_token'));
    if (!authEntry) throw new Error('Supabase browser session token was not found');
    const parsed = JSON.parse(authEntry) as { access_token?: string };
    if (!parsed.access_token) throw new Error('Supabase access token was not found');
    const restRequest = performance.getEntriesByType('resource').find((entry) => entry.name.includes('/rest/v1/'))?.name;
    if (!restRequest) throw new Error('Supabase REST origin was not observed in browser runtime');

    const scripts = performance.getEntriesByType('resource').filter((entry) => entry.name.endsWith('.js')) as PerformanceResourceTiming[];
    let apiKey = '';
    for (const script of scripts) {
      try {
        const text = await fetch(script.name).then((response) => response.text());
        const match = text.match(/sb_publishable_[A-Za-z0-9_-]+/);
        if (match?.[0]) { apiKey = match[0]; break; }
      } catch {
        // Continue; a different loaded chunk may contain the Vite public key.
      }
    }
    if (!apiKey) throw new Error('Supabase publishable API key was not found in the browser bundle');
    return { accessToken: parsed.access_token, apiKey, restOrigin: new URL(restRequest).origin };
  });
}

test('authenticated customer completes real catalog → cart → order → refresh persistence path', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');

  const failures = captureBrowserFailures(page);
  await login(page, email, password);
  await expect(page.getByText('الكتالوج')).toBeVisible();

  const addButton = page.getByRole('button', { name: /إضافة|أضف/ }).first();
  await expect(addButton).toBeVisible();
  await expect(addButton).toBeEnabled();
  await addButton.click();
  await expect(page.getByRole('button', { name: /السلة، 1 أصناف/ })).toBeVisible();

  const checkout = page.getByRole('button', { name: 'إرسال الطلب' });
  await expect(checkout).toBeEnabled();
  await checkout.click();

  const success = page.getByRole('status').filter({ hasText: 'تم إرسال الطلب رقم' }).last();
  await expect(success).toBeVisible();
  const successText = await success.innerText();
  const orderNumberMatch = successText.match(/طلب رقم\s+(\d+)/);
  expect(orderNumberMatch, `Order number missing from success message: ${successText}`).not.toBeNull();
  const orderNumber = orderNumberMatch![1];

  await expect(page.getByText('طلباتي')).toBeVisible();
  await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('link', { name: 'المنتجات' })).toBeVisible();
  await expect(page.getByText('طلباتي')).toBeVisible();
  await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();

  expect(failures.pageErrors, `Uncaught browser errors: ${failures.pageErrors.join(' | ')}`).toEqual([]);
  expect(failures.consoleErrors, `Browser console errors: ${failures.consoleErrors.join(' | ')}`).toEqual([];
  expect(failures.failedResponses, `HTTP responses >= 400: ${failures.failedResponses.join(' | ')}`).toEqual([]);
});

test('authenticated order RPC is idempotent under duplicate submission', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for runtime idempotency proof.');

  const failures = captureBrowserFailures(page);
  await login(page, email, password);
  const session = await browserSupabaseSession(page);
  const headers = { Authorization: `Bearer ${session.accessToken}`, apikey: session.apiKey, 'Content-Type': 'application/json' };

  const profileResponse = await page.request.get(`${session.restOrigin}/rest/v1/profiles?select=customer_id,organization_id&id=eq.${await page.evaluate(() => JSON.parse(Object.values(localStorage).find((value) => value.includes('access_token') && value.includes('refresh_token'))!).user.id)}`, { headers });
  expect(profileResponse.ok()).toBeTruthy();
  const profiles = await profileResponse.json() as Array<{ customer_id: string; organization_id: string }>;
  expect(profiles).toHaveLength(1);
  const { customer_id: customerId, organization_id: organizationId } = profiles[0];

  const warehouseResponse = await page.request.get(`${session.restOrigin}/rest/v1/warehouses?select=id&organization_id=eq.${organizationId}&is_active=eq.true&limit=1`, { headers });
  expect(warehouseResponse.ok()).toBeTruthy();
  const warehouses = await warehouseResponse.json() as Array<{ id: string }>;
  expect(warehouses).toHaveLength(1);

  const productResponse = await page.request.get(`${session.restOrigin}/rest/v1/products?select=id&organization_id=eq.${organizationId}&status=eq.active&limit=1`, { headers });
  expect(productResponse.ok()).toBeTruthy();
  const products = await productResponse.json() as Array<{ id: string }>;
  expect(products).toHaveLength(1);

  const idempotencyKey = `e2e-idempotency-${Date.now()}`;
  const payload = { p_idempotency_key: idempotencyKey, p_warehouse_id: warehouses[0].id, p_lines: [{ product_id: products[0].id, quantity: 1 }] };
  const first = await page.request.post(`${session.restOrigin}/rest/v1/rpc/create_order`, { headers, data: payload });
  expect(first.ok()).toBeTruthy();
  const firstRows = await first.json() as Array<{ id: string; order_number: number }>;
  expect(firstRows).toHaveLength(1);

  const second = await page.request.post(`${session.restOrigin}/rest/v1/rpc/create_order`, { headers, data: payload });
  expect(second.ok()).toBeTruthy();
  const secondRows = await second.json() as Array<{ id: string; order_number: number }>;
  expect(secondRows).toEqual(firstRows);

  const persisted = await page.request.get(`${session.restOrigin}/rest/v1/orders?select=id,idempotency_key&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`, { headers });
  expect(persisted.ok()).toBeTruthy();
  const persistedRows = await persisted.json() as Array<{ id: string; idempotency_key: string }>;
  expect(persistedRows).toHaveLength(1);
  expect(persistedRows[0].id).toBe(firstRows[0].id);

  expect(failures.pageErrors, `Browser errors: ${failures.pageErrors.join(' | ')}`).toEqual([]);
  expect(failures.consoleErrors, `Console errors: ${failures.consoleErrors.join(' | ')}`).toEqual([]);
  expect(failures.failedResponses, `HTTP >=400: ${failures.failedResponses.join(' | ')}`).toEqual([]);
});

test('tenant isolation and direct API/RPC bypass reject foreign resources', async ({ browser }) => {
  const emailA = process.env.E2E_EMAIL;
  const passwordA = process.env.E2E_PASSWORD;
  const emailB = process.env.E2E_EMAIL_B;
  const passwordB = process.env.E2E_PASSWORD_B;
  if (!emailA || !passwordA || !emailB || !passwordB) {
    throw new Error('E2E_EMAIL/E2E_PASSWORD and E2E_EMAIL_B/E2E_PASSWORD_B are required for tenant-isolation runtime proof.');
  }

  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  const failuresA = captureBrowserFailures(pageA);
  await login(pageA, emailA, passwordA);
  const sessionA = await browserSupabaseSession(pageA);

  const addButton = pageA.getByRole('button', { name: /إضافة|أضف/ }).first();
  await expect(addButton).toBeEnabled();
  await addButton.click();
  await pageA.getByRole('button', { name: 'إرسال الطلب' }).click();
  const success = pageA.getByRole('status').filter({ hasText: 'تم إرسال الطلب رقم' }).last();
  await expect(success).toBeVisible();
  const match = (await success.innerText()).match(/طلب رقم\s+(\d+)/);
  expect(match, 'Tenant A order number must be captured from the real persisted response.').not.toBeNull();
  const orderNumberA = match![1];

  const orderResponseA = await pageA.request.get(`${sessionA.restOrigin}/rest/v1/orders?select=id,order_number&order_number=eq.${orderNumberA}`, {
    headers: { Authorization: `Bearer ${sessionA.accessToken}`, apikey: sessionA.apiKey }
  });
  expect(orderResponseA.ok()).toBeTruthy();
  const ordersA = await orderResponseA.json() as Array<{ id: string; order_number: number }>;
  expect(ordersA).toHaveLength(1);
  const orderIdA = ordersA[0].id;

  const productResponseA = await pageA.request.get(`${sessionA.restOrigin}/rest/v1/products?select=id&limit=1`, {
    headers: { Authorization: `Bearer ${sessionA.accessToken}`, apikey: sessionA.apiKey }
  });
  expect(productResponseA.ok()).toBeTruthy();
  const productsA = await productResponseA.json() as Array<{ id: string }>;
  expect(productsA).toHaveLength(1);
  const productIdA = productsA[0].id;

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  const failuresB = captureBrowserFailures(pageB);
  await login(pageB, emailB, passwordB);
  const sessionB = await browserSupabaseSession(pageB);

  await expect(pageB.getByText('طلباتي')).toBeVisible();
  await expect(pageB.getByText(`طلب #${orderNumberA}`, { exact: true })).toHaveCount(0);

  const foreignRead = await pageB.request.get(`${sessionB.restOrigin}/rest/v1/orders?select=id&id=eq.${orderIdA}`, {
    headers: { Authorization: `Bearer ${sessionB.accessToken}`, apikey: sessionB.apiKey }
  });
  expect(foreignRead.ok()).toBeTruthy();
  expect(await foreignRead.json()).toEqual([]);

  const foreignMutation = await pageB.request.post(`${sessionB.restOrigin}/rest/v1/rpc/set_cart_item`, {
    headers: { Authorization: `Bearer ${sessionB.accessToken}`, apikey: sessionB.apiKey, 'Content-Type': 'application/json' },
    data: { p_product_id: productIdA, p_quantity: 1 }
  });
  expect([400, 401, 403]).toContain(foreignMutation.status());

  expect(failuresA.pageErrors, `Tenant A browser errors: ${failuresA.pageErrors.join(' | ')}`).toEqual([]);
  expect(failuresA.consoleErrors, `Tenant A console errors: ${failuresA.consoleErrors.join(' | ')}`).toEqual([]);
  expect(failuresA.failedResponses, `Tenant A HTTP >=400: ${failuresA.failedResponses.join(' | ')}`).toEqual([]);
  expect(failuresB.pageErrors, `Tenant B browser errors: ${failuresB.pageErrors.join(' | ')}`).toEqual([]);
  expect(failuresB.consoleErrors, `Tenant B console errors: ${failuresB.consoleErrors.join(' | ')}`).toEqual([]);
  expect(failuresB.failedResponses, `Tenant B HTTP >=400: ${failuresB.failedResponses.join(' | ')}`).toEqual([]);

  await contextB.close();
  await contextA.close();
});
