import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();
  const portal = page.getByRole('complementary', { name: 'تنقل البوابة' }).getByRole('button', { name: /الكتالوج/ }).first();
  const error = page.locator('.error-banner');
  await Promise.race([portal.waitFor({ state: 'visible', timeout: 15000 }), error.waitFor({ state: 'visible', timeout: 15000 })]).catch(() => undefined);
  if (await error.isVisible().catch(() => false)) throw new Error('Login/bootstrap failed: ' + await error.innerText());
  await expect(portal).toBeVisible();
  await expect(page.locator('.portal-loading')).toHaveCount(0, { timeout: 15000 });
  await expect(page.getByRole('banner').getByRole('button', { name: /السلة/ })).toBeVisible();
  await clearCustomerCart(page);
}

async function clearCustomerCart(page: Page) {
  await expect(page.locator('.portal-loading')).toHaveCount(0, { timeout: 15000 });
  const cartButton = page.getByRole('banner').getByRole('button', { name: /السلة/ });
  await expect(cartButton).toBeVisible();
  await cartButton.click();
  const lines = page.locator('.cart-drawer .drawer-line');
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const lineCount = await lines.count();
    if (lineCount === 0) break;
    const line = lines.first();
    const quantityOutput = line.locator('.quantity span');
    const beforeQuantity = Number((await quantityOutput.innerText()).trim());
    expect(Number.isSafeInteger(beforeQuantity) && beforeQuantity > 0).toBeTruthy();
    const decrement = line.getByRole('button', { name: '−', exact: true });
    await expect(decrement).toBeVisible();
    await decrement.click();
    if (beforeQuantity > 1) {
      await expect.poll(async () => Number((await quantityOutput.innerText()).trim()), { timeout: 5000 }).toBeLessThan(beforeQuantity);
    } else {
      await expect.poll(() => lines.count(), { timeout: 5000 }).toBeLessThan(lineCount);
    }
  }
  await expect(lines).toHaveCount(0, { timeout: 5000 });
  const close = page.locator('.cart-drawer').getByRole('button', { name: '×', exact: true });
  if (await close.isVisible().catch(() => false)) await close.click();

  // Rehydrate from the server and verify cleanup persisted; never trust only client state.
  await page.reload();
  await expect(page.locator('.customer-shell')).toBeVisible();
  await expect(page.locator('.portal-loading')).toHaveCount(0, { timeout: 15000 });
  const verifyCartButton = page.getByRole('banner').getByRole('button', { name: /السلة/ });
  await verifyCartButton.click();
  await expect(page.locator('.cart-drawer .drawer-line')).toHaveCount(0, { timeout: 5000 });
  const verifyClose = page.locator('.cart-drawer').getByRole('button', { name: '×', exact: true });
  if (await verifyClose.isVisible().catch(() => false)) await verifyClose.click();
}

const EXPECTED_VERCEL_TOOLBAR_CSP_ERROR = 'Loading the script \'https://vercel.live/_next-live/feedback/feedback.js\' violates the following Content Security Policy directive: "script-src \'self\'". Note that \'script-src-elem\' was not explicitly set, so \'script-src\' is used as a fallback. The action has been blocked.';

function captureBrowserFailures(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && message.text() !== EXPECTED_VERCEL_TOOLBAR_CSP_ERROR) consoleErrors.push(message.text()); });
  page.on('response', (response) => { const status = response.status(); if (status >= 400 && !response.url().endsWith('/favicon.ico')) failedResponses.push(`${status} ${response.request().method()} ${response.url()}`); });
  return { pageErrors, consoleErrors, failedResponses };
}

async function assertCleanBrowser(failures: ReturnType<typeof captureBrowserFailures>, allowedResponse: RegExp | null = null) {
  const unexpectedResponses = allowedResponse ? failures.failedResponses.filter((entry) => !allowedResponse.test(entry)) : failures.failedResponses;
  const hasAllowedResponse = allowedResponse ? failures.failedResponses.some((entry) => allowedResponse.test(entry)) : false;
  const unexpectedConsoleErrors = hasAllowedResponse ? failures.consoleErrors.filter((message) => !/^Failed to load resource: the server responded with a status of 400 \((?:Bad Request)?\)$/.test(message)) : failures.consoleErrors;
  expect(failures.pageErrors, `Uncaught browser errors: ${failures.pageErrors.join(' | ')}`).toEqual([]);
  expect(unexpectedConsoleErrors, `Browser console errors: ${unexpectedConsoleErrors.join(' | ')}`).toEqual([]);
  expect(unexpectedResponses, `Unexpected HTTP responses >= 400: ${unexpectedResponses.join(' | ')}`).toEqual([]);
}

test('invalid login is rejected and does not expose the customer portal', async ({ page }) => {
  const email = process.env.E2E_EMAIL; expect(email).toBeTruthy(); const failures = captureBrowserFailures(page);
  await page.goto('/'); const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email!); await loginForm.locator('input[type="password"]').fill('definitely-wrong-password-20260918');
  const authResponsePromise = page.waitForResponse((response) => response.url().includes('/auth/v1/token') && response.request().method() === 'POST');
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click(); const authResponse = await authResponsePromise;
  expect([400, 401]).toContain(authResponse.status()); await expect(page.getByRole('button', { name: 'دخول آمن' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'الكتالوج', exact: true })).toHaveCount(0); await expect(page.locator('.error-banner')).toBeVisible();
  await assertCleanBrowser(failures, /^(?:400|401)\s+POST\s+.*\/auth\/v1\/token/);
});

test('authenticated customer completes real search → catalog → cart → order → refresh → logout path', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');
  const failures = captureBrowserFailures(page); await login(page, email, password); await expect(page.locator('.customer-shell')).toBeVisible();
  const firstCard = page.locator('.product-card').first(); await expect(firstCard).toBeVisible(); const productName = (await firstCard.getByRole('heading').first().innerText()).trim();
  const search = page.getByRole('textbox', { name: 'البحث في الكتالوج' }); await expect(search).toBeVisible(); await search.fill(productName); await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card').first().getByRole('heading', { name: productName, exact: true })).toBeVisible(); await search.fill('');
  const addButton = page.getByRole('button', { name: 'إضافة للسلة', exact: true }).first(); await expect(addButton).toBeEnabled(); await addButton.click(); await expect(page.getByRole('banner').getByRole('button', { name: /السلة/ })).toHaveText(/السلة\s+1/);
  const quantityConfirmation = page.getByRole('button', { name: 'اعتماد الكمية', exact: true }).first(); await expect(quantityConfirmation).toBeEnabled(); await quantityConfirmation.click(); await expect(page.getByRole('button', { name: '✓ معتمد', exact: true })).toBeVisible();
  const checkout = page.getByRole('button', { name: 'تأكيد وإرسال الطلب', exact: true }); await expect(checkout).toBeEnabled(); await checkout.click();
  const success = page.locator('.success').filter({ hasText: 'تم إرسال الطلب #' }).last(); await expect(success).toBeVisible(); const successText = await success.innerText(); const orderNumberMatch = successText.match(/طلب #([^\s]+) بنجاح/);
  expect(orderNumberMatch, `Order number missing from success message: ${successText}`).not.toBeNull(); const orderNumber = orderNumberMatch![1];
  await expect(page.getByRole('button', { name: 'طلباتي', exact: true })).toBeVisible(); await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible(); await page.reload();
  await expect(page.getByRole('button', { name: 'طلباتي', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'طلباتي', exact: true }).click(); await expect(page.getByText(`طلب #${orderNumber}`, { exact: true })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'قيد المراجعة' }).first()).toBeVisible(); await expect(page.locator('.order-progress').first()).toBeVisible();
  const orderDetailButton = page.getByRole('button', { name: 'عرض التفاصيل', exact: true }).first();
  await expect(orderDetailButton).toBeVisible();
  await orderDetailButton.click();
  const orderDialog = page.getByRole('dialog', { name: 'تفاصيل الطلب' });
  await expect(orderDialog).toBeVisible();
  await expect(orderDialog.getByText(productName, { exact: true })).toBeVisible();
  await expect(orderDialog.getByText('إجمالي الطلب')).toBeVisible();
  await page.getByRole('button', { name: 'إغلاق تفاصيل الطلب', exact: true }).click();
  await expect(orderDialog).toHaveCount(0);
  await page.getByRole('button', { name: 'خروج', exact: true }).last().click(); await expect(page.getByRole('button', { name: 'دخول آمن', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'الكتالوج', exact: true })).toHaveCount(0); await assertCleanBrowser(failures);
});

test('tenant isolation: Tenant B cannot read Tenant A order through the real UI session', async ({ browser }) => {
  const emailA = process.env.E2E_EMAIL; const passwordA = process.env.E2E_PASSWORD; const emailB = process.env.E2E_EMAIL_B; const passwordB = process.env.E2E_PASSWORD_B;
  if (!emailA || !passwordA || !emailB || !passwordB) throw new Error('E2E_EMAIL/E2E_PASSWORD and E2E_EMAIL_B/E2E_PASSWORD_B are required for tenant-isolation runtime proof.');
  const contextA = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pageA = await contextA.newPage(); const failuresA = captureBrowserFailures(pageA); await login(pageA, emailA, passwordA);
  const addButton = pageA.getByRole('button', { name: 'إضافة للسلة', exact: true }).first(); await expect(addButton).toBeEnabled(); await addButton.click();
  const quantityConfirmation = pageA.getByRole('button', { name: 'اعتماد الكمية', exact: true }).first(); await expect(quantityConfirmation).toBeEnabled(); await quantityConfirmation.click(); await expect(pageA.getByRole('button', { name: '✓ معتمد', exact: true })).toBeVisible();
  await pageA.getByRole('button', { name: 'تأكيد وإرسال الطلب', exact: true }).click(); const success = pageA.locator('.success').filter({ hasText: 'تم إرسال الطلب #' }).last(); await expect(success).toBeVisible();
  const match = (await success.innerText()).match(/طلب #([^\s]+) بنجاح/); expect(match, 'Tenant A order number must be captured from the real persisted response.').not.toBeNull(); const orderNumberA = match![1];
  const contextB = await browser.newContext(); const pageB = await contextB.newPage(); const failuresB = captureBrowserFailures(pageB); await login(pageB, emailB, passwordB); await pageB.getByRole('button', { name: 'طلباتي', exact: true }).click();
  await expect(pageB.getByText(`طلب #${orderNumberA}`, { exact: true })).toHaveCount(0); await assertCleanBrowser(failuresA); await assertCleanBrowser(failuresB); await contextB.close(); await contextA.close();
});

test('command center supports keyboard-first navigation and fast search', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for command-center runtime proof.');
  const failures = captureBrowserFailures(page); await login(page, email, password); await page.keyboard.press('Control+k'); const palette = page.getByRole('dialog', { name: 'أوامر الأغبري' }); await expect(palette).toBeVisible();
  await expect(palette.getByRole('menuitem', { name: /فتح الكتالوج/ })).toBeVisible(); await expect(palette.getByRole('menuitem', { name: /الطلب السريع/ })).toBeVisible();
  const commandSearch = palette.getByRole('textbox', { name: 'البحث في الأوامر' }); await expect(commandSearch).toBeFocused(); await commandSearch.fill('إعادة'); await expect(palette.getByRole('menuitem', { name: /إعادة تجهيز آخر طلب/ })).toBeVisible();
  await commandSearch.press('ArrowDown'); await commandSearch.press('Enter'); await expect(palette).toHaveCount(0); await page.keyboard.press('Control+k'); await expect(palette).toBeVisible();
  await expect(palette.getByRole('menuitem', { name: /فتح الكتالوج/ })).toBeVisible(); await page.keyboard.press('Escape'); await expect(palette).toHaveCount(0); await page.keyboard.press('/');
  await expect(page.getByRole('textbox', { name: 'البحث في الكتالوج' })).toBeFocused(); await assertCleanBrowser(failures);
});

test('quick order accepts scanner-style Enter submission', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for quick-order runtime proof.');
  const failures = captureBrowserFailures(page); await login(page, email, password); const sku = await page.locator('.product-card').first().locator('.sku').innerText();
  const quickButton = page.getByRole('button', { name: 'طلب سريع', exact: true }); await expect(quickButton).toBeVisible(); await quickButton.click();
  const skuInput = page.getByRole('textbox', { name: 'SKU / الباركود' }); const qtyInput = page.getByRole('spinbutton', { name: 'كمية الطلب' }); await expect(skuInput).toBeFocused(); await skuInput.fill(sku.trim()); await qtyInput.fill('1'); await qtyInput.press('Enter');
  await expect(page.getByRole('button', { name: /السلة/ })).toContainText('1'); await assertCleanBrowser(failures);
});

test('quick order accepts barcode identifiers', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for barcode quick-order proof.');
  const failures = captureBrowserFailures(page); await login(page, email, password);
  const barcode = (await page.locator('.product-card').first().getAttribute('data-barcode'))?.trim();
  expect(barcode, 'A barcode must be provisioned on the browser fixture product.').toBeTruthy();
  const quickButton = page.getByRole('button', { name: 'طلب سريع', exact: true }); await quickButton.click();
  const identifierInput = page.getByRole('textbox', { name: 'SKU / الباركود' }); const qtyInput = page.getByRole('spinbutton', { name: 'كمية الطلب' });
  await identifierInput.fill(barcode!); await qtyInput.fill('1'); await qtyInput.press('Enter');
  await expect(page.getByRole('button', { name: /السلة/ })).toContainText('1'); await assertCleanBrowser(failures);
});

test('quick order resolves a server-authorized product outside the currently loaded catalog results', async ({ page }) => { const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for server-backed quick-order lookup proof.'); const failures = captureBrowserFailures(page); await login(page, email, password); const search = page.getByRole('textbox', { name: 'البحث في الكتالوج' }); await search.fill('NO-SUCH-CATALOG-MATCH'); await expect(page.locator('.product-card')).toHaveCount(0); const quickButton = page.getByRole('button', { name: 'طلب سريع', exact: true }); await quickButton.click(); const identifierInput = page.getByRole('textbox', { name: 'SKU / الباركود' }); const qtyInput = page.getByRole('spinbutton', { name: 'كمية الطلب' }); await expect(identifierInput).toBeFocused(); await identifierInput.fill('BROW-001'); await qtyInput.fill('1'); await identifierInput.press('Enter'); await expect(page.getByRole('button', { name: /السلة/ })).toContainText('1'); await assertCleanBrowser(failures); });

test('catalog progressive browsing exposes bounded loading when more products exist', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for catalog pagination proof.'); await login(page, email, password);
  const loadMore = page.getByRole('button', { name: 'تحميل المزيد' }); if (await loadMore.count()) { const before = await page.locator('.product-card').count(); await loadMore.click(); await expect.poll(async () => page.locator('.product-card').count()).toBeGreaterThan(before); }
});

test('inline product quantity controls preserve a single cart line', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for quantity-control proof.'); await login(page, email, password);
  const card = page.locator('.product-card').first(); await expect(card).toBeVisible(); const addButton = card.getByRole('button', { name: 'إضافة للسلة' }); if (await addButton.count()) {
    await addButton.click(); await expect(card.locator('.product-qty-control')).toBeVisible(); await expect(card.locator('.product-qty-control output')).toHaveText('1'); const drawerClose = page.locator('.cart-drawer').getByRole('button', { name: '×', exact: true }); await expect(drawerClose).toBeVisible(); await drawerClose.click(); await expect(page.locator('.cart-drawer')).toHaveCount(0); const inlineCard = page.locator('.product-card').first(); await inlineCard.getByRole('button', { name: /زيادة/ }).click(); await expect(card.locator('.product-qty-control output')).toHaveText('2'); await card.getByRole('button', { name: /إنقاص/ }).click(); await expect(card.locator('.product-qty-control output')).toHaveText('1');
  }
});


test('customer portal search reset and modal escape controls remain accessible', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for customer UI accessibility proof.');
  const failures = captureBrowserFailures(page); await login(page, email, password);
  const firstCard = page.locator('.product-card').first(); await expect(firstCard).toBeVisible();
  const productName = (await firstCard.getByRole('heading').first().innerText()).trim();
  const search = page.getByRole('textbox', { name: 'البحث في الكتالوج' }); await search.fill(productName);
  await expect(page.getByRole('button', { name: 'مسح البحث' })).toBeVisible();
  await page.getByRole('button', { name: 'مسح البحث' }).click(); await expect(search).toHaveValue(''); await expect(page.locator('.product-card').first()).toBeVisible();
  await page.locator('.product-card').first().getByRole('button', { name: 'عرض التفاصيل' }).click();
  await expect(page.getByRole('dialog', { name: 'تفاصيل المنتج' })).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog', { name: 'تفاصيل المنتج' })).toHaveCount(0);
  await page.getByRole('banner').getByRole('button', { name: /السلة/ }).click();
  await expect(page.getByRole('dialog', { name: /السلة/ })).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog', { name: /السلة/ })).toHaveCount(0);
  await assertCleanBrowser(failures);
});

test('product detail modal exposes customer-safe facts', async ({ page }) => {
  const email = process.env.E2E_EMAIL; const password = process.env.E2E_PASSWORD; if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for product detail proof.'); await login(page, email, password);
  const card = page.locator('.product-card').first(); await expect(card).toBeVisible(); await card.getByRole('button', { name: 'عرض التفاصيل' }).click();
  await expect(page.getByText('تفاصيل المنتج', { exact: true })).toBeVisible(); await expect(page.getByText('SKU', { exact: true })).toBeVisible(); await expect(page.getByText('الوحدة', { exact: true })).toBeVisible(); await expect(page.getByText('التوفر', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'إغلاق تفاصيل المنتج' }).click();
});
