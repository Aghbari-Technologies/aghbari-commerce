import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();

  const portal = page.getByRole('button', { name: 'الكتالوج', exact: true });
  const error = page.locator('.error-banner');
  await Promise.race([
    portal.waitFor({ state: 'visible', timeout: 5000 }),
    error.waitFor({ state: 'visible', timeout: 5000 })
  ]).catch(() => undefined);

  if (await error.isVisible().catch(() => false)) {
    const message = await error.innerText();
    throw new Error('Login/bootstrap failed: ' + message);
  }

  await expect(portal).toBeVisible();
  await expect(page.getByRole('button', { name: /السلة/ })).toBeVisible();
  await clearCustomerCart(page);
  await expect(page.getByRole('button', { name: /السلة/ })).toContainText('0');
}


async function clearCustomerCart(page: Page) {
  const cartButton = page.getByRole('button', { name: /السلة/ });
  await expect(cartButton).toBeVisible();
  await cartButton.click();
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const decrement = page.getByRole('button', { name: '−', exact: true }).first();
    if (!(await decrement.isVisible().catch(() => false))) break;
    await decrement.click();
  }
  const close = page.getByRole('button', { name: '×', exact: true }).last();
  if (await close.isVisible().catch(() => false)) await close.click();
}

const EXPECTED_VERCEL_TOOLBAR_CSP_ERROR =
  'Loading the script \'https://vercel.live/_next-live/feedback/feedback.js\' violates the following Content Security Policy directive: "script-src \'self\'". Note that \'script-src-elem\' was not explicitly set, so \'script-src\' is used as a fallback. The action has been blocked.';

function captureBrowserFailures(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text() !== EXPECTED_VERCEL_TOOLBAR_CSP_ERROR) {
      consoleErrors.push(message.text());
    }
  });
  page.on('response', (response) => { const status = response.status(); if (status >= 400 && !response.url().endsWith('/favicon.ico')) failedResponses.push(`${status} ${response.request().method()} ${response.url()}`); });
  return { pageErrors, consoleErrors, failedResponses };
}

async function assertCleanBrowser(failures: ReturnType<typeof captureBrowserFailures>, allowedResponse: RegExp | null = null) {
  const unexpectedResponses = allowedResponse
    ? failures.failedResponses.filter((entry) => !allowedResponse.test(entry))
    : failures.failedResponses;
  const hasAllowedResponse = allowedResponse ? failures.failedResponses.some((entry) => allowedResponse.test(entry)) : false;
  const unexpectedConsoleErrors = hasAllowedResponse
    ? failures.consoleErrors.filter((message) => !/^Failed to load resource: the server responded with a status of 400 \((?:Bad Request)?\)$/.test(message))
    : failures.consoleErrors;
  expect(failures.pageErrors, `Uncaught browser errors: ${failures.pageErrors.join(' | ')}`).toEqual([]);
  expect(unexpectedConsoleErrors, `Browser console errors: ${unexpectedConsoleErrors.join(' | ')}`).toEqual([]);
  expect(unexpectedResponses, `Unexpected HTTP responses >= 400: ${unexpectedResponses.join(' | ')}`).toEqual([]);
}

test('invalid login is rejected and does not expose the customer portal', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  expect(email).toBeTruthy();
  const failures = captureBrowserFailures(page);
  await page.goto('/');
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email!);
  await loginForm.locator('input[type="password"]').fill('definitely-wrong-password-20260918');
  const authResponsePromise = page.waitForResponse((response) => response.url().includes('/auth/v1/token') && response.request().method() === 'POST');
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();
  const authResponse = await authResponsePromise;
  expect([400, 401]).toContain(authResponse.status());
  await expect(page.getByRole('button', { name: 'دخول آمن' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'الكتالوج', exact: true })).toHaveCount(0);
  await expect(page.locator('.error-banner')).toBeVisible();
  await assertCleanBrowser(failures, /^(?:400|401)\s+POST\s+.*\/auth\/v1\/token/);
});

test('authenticated customer completes real search → catalog → cart → order → refresh → logout path', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');

  const failures = captureBrowserFailures(page);
  await login(page, email, password);
  await expect(page.locator('.customer-shell')).toBeVisible();

  const firstCard = page.locator('.product-card').first();
  await expect(firstCard).toBeVisible();
  const productName = (await firstCard.getByRole('heading').first().innerText()).trim();
  const search = page.getByRole('textbox', { name: 'البحث في الكتالوج' });
  await expect(search).toBeVisible();
  await search.fill(productName);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card').first().getByRole('heading', { name: productName, exact: true })).toBeVisible();
  await search.fill('');

  const addButton = page.getByRole('button', { name: 'إضافة للسلة', exact: true }).first();
  await expect(addButton).toBeEnabled();
  await addButton.click();
  await expect(page.getByRole('button', { name: /السلة/ })).toContainText('1');

  const quantityConfirmation = page.getByRole('button', { name: 'اعتماد الكمية', exact: true }).first();
  await expect(quantityConfirmation).toBeEnabled();
  await quantityConfirmation.click();
  await expect(page.getByRole('button', { name: '✓ معتمد', exact: true })).toBeVisible();

  const checkout = page.getByRole('button', { name: 'تأكيد وإرسال الطلب', exact: true });
  await expect(checkout).toBeEnabled();
  await checkout.click();

  const success = page.locator('.success').filter({ hasText: 'تم إرسال الطلب #' }).last();
  await expect(success).toBeVisible();
  const successText = await success.innerText();
  const orderNumberMatch = successText.match(/طلب #([^\s]+) بنجاح/);
  expect(orderNumberMatch, `Order number missing from success message: ${successText}`).not.toBeNull();
  const orderNumber = orderNumberMatch![1];

  await expect(page.getByRole('button', { name: 'طلباتي', exact: true })).toBeVisible();
  await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'طلباتي', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'طلباتي', exact: true }).click();
  await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'خروج', exact: true }).last().click();
  await expect(page.getByRole('button', { name: 'دخول آمن', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'الكتالوج', exact: true })).toHaveCount(0);
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
  const addButton = pageA.getByRole('button', { name: 'إضافة للسلة', exact: true }).first();
  await expect(addButton).toBeEnabled();
  await addButton.click();
  const quantityConfirmation = pageA.getByRole('button', { name: 'اعتماد الكمية', exact: true }).first();
  await expect(quantityConfirmation).toBeEnabled();
  await quantityConfirmation.click();
  await expect(pageA.getByRole('button', { name: '✓ معتمد', exact: true })).toBeVisible();
  await pageA.getByRole('button', { name: 'تأكيد وإرسال الطلب', exact: true }).click();
  const success = pageA.locator('.success').filter({ hasText: 'تم إرسال الطلب #' }).last();
  await expect(success).toBeVisible();
  const match = (await success.innerText()).match(/طلب #([^\s]+) بنجاح/);
  expect(match, 'Tenant A order number must be captured from the real persisted response.').not.toBeNull();
  const orderNumberA = match![1];

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  const failuresB = captureBrowserFailures(pageB);
  await login(pageB, emailB, passwordB);
  await pageB.getByRole('button', { name: 'طلباتي', exact: true }).click();
  await expect(pageB.getByText(`طلب #${orderNumberA}`, { exact: true })).toHaveCount(0);
  await assertCleanBrowser(failuresA);
  await assertCleanBrowser(failuresB);
  await contextB.close();
  await contextA.close();
});
