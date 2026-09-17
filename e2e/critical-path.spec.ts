import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByRole('button', { name: 'الكتالوج', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /السلة/ })).toBeVisible();
}

function captureBrowserFailures(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', (response) => { const status = response.status(); if (status >= 400 && !response.url().endsWith('/favicon.ico')) failedResponses.push(`${status} ${response.request().method()} ${response.url()}`); });
  return { pageErrors, consoleErrors, failedResponses };
}

async function assertCleanBrowser(failures: ReturnType<typeof captureBrowserFailures>) {
  expect(failures.pageErrors, `Uncaught browser errors: ${failures.pageErrors.join(' | ')}`).toEqual([]);
  expect(failures.consoleErrors, `Browser console errors: ${failures.consoleErrors.join(' | ')}`).toEqual([]);
  expect(failures.failedResponses, `HTTP responses >= 400: ${failures.failedResponses.join(' | ')}`).toEqual([]);
}

test('authenticated customer completes real search → catalog → cart → order → refresh path', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');

  const failures = captureBrowserFailures(page);
  await login(page, email, password);
  await expect(page.locator('.customer-app')).toHaveAttribute('dir', 'rtl');

  const firstCard = page.locator('.b2b-product-card').first();
  await expect(firstCard).toBeVisible();
  const productName = (await firstCard.getByRole('heading').first().innerText()).trim();
  const search = page.getByRole('textbox', { name: 'بحث المنتج' });
  await expect(search).toBeVisible();
  await search.fill(productName);
  await expect(page.locator('.b2b-product-card')).toHaveCount(1);
  await expect(page.locator('.b2b-product-card').first().getByRole('heading', { name: productName, exact: true })).toBeVisible();
  await search.fill('');

  const addButton = page.getByRole('button', { name: /\+ إضافة/ }).first();
  await expect(addButton).toBeEnabled();
  await addButton.click();
  await expect(page.getByRole('button', { name: /السلة/ })).toContainText('1');

  const checkout = page.getByRole('button', { name: 'تأكيد وإرسال الطلب' });
  await expect(checkout).toBeEnabled();
  await checkout.click();

  const success = page.locator('.success').filter({ hasText: 'تم إرسال الطلب #' }).last();
  await expect(success).toBeVisible();
  const successText = await success.innerText();
  const orderNumberMatch = successText.match(/طلب #([^\s]+) بنجاح/);
  expect(orderNumberMatch, `Order number missing from success message: ${successText}`).not.toBeNull();
  const orderNumber = orderNumberMatch![1];

  await expect(page.getByRole('button', { name: 'طلباتي' })).toBeVisible();
  await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'طلباتي' })).toBeVisible();
  await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();
  await assertCleanBrowser(failures);
});

test('tenant isolation: Tenant B cannot read Tenant A order through the real UI session', async ({ browser }) => {
  const emailA = process.env.E2E_EMAIL;
  const passwordA = process.env.E2E_PASSWORD;
  const emailB = process.env.E2E_EMAIL_B;
  const passwordB = process.env.E2E_PASSWORD_B;
  if (!emailA || !passwordA || !emailB || !passwordB) throw new Error('E2E_EMAIL/E2E_PASSWORD and E2E_EMAIL_B/E2E_PASSWORD_B are required for tenant-isolation runtime proof.');

  const contextA = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pageA = await contextA.newPage();
  const failuresA = captureBrowserFailures(pageA);
  await login(pageA, emailA, passwordA);
  await expect(pageA.locator('.customer-app')).toHaveAttribute('dir', 'rtl');
  const addButton = pageA.getByRole('button', { name: /\+ إضافة/ }).first();
  await expect(addButton).toBeEnabled();
  await addButton.click();
  await pageA.getByRole('button', { name: 'تأكيد وإرسال الطلب' }).click();
  const success = pageA.locator('.success').filter({ hasText: 'تم إرسال الطلب #' }).last();
  await expect(success).toBeVisible();
  const match = (await success.innerText()).match(/طلب #([^\s]+) بنجاح/);
  expect(match, 'Tenant A order number must be captured from the real persisted response.').not.toBeNull();
  const orderNumberA = match![1];

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  const failuresB = captureBrowserFailures(pageB);
  await login(pageB, emailB, passwordB);
  await expect(pageB.getByRole('button', { name: 'طلباتي' })).toBeVisible();
  await expect(pageB.getByText(`طلب #${orderNumberA}`, { exact: true })).toHaveCount(0);
  await assertCleanBrowser(failuresA);
  await assertCleanBrowser(failuresB);
  await contextB.close();
  await contextA.close();
});
