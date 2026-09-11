import { test, expect, type Browser, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(password);
  await form.getByRole('button', { name: 'دخول آمن' }).click();
}

function captureFailures(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) failedResponses.push(`${r.status()} ${r.request().method()} ${r.url()}`); });
  return { pageErrors, consoleErrors, failedResponses };
}

test('real customer invitation journey: creation → record → acceptance → activation → customer context', async ({ browser }) => {
  const staffEmail = process.env.E2E_STAFF_EMAIL;
  const staffPassword = process.env.E2E_STAFF_PASSWORD;
  const inviteEmail = process.env.E2E_INVITE_EMAIL;
  const invitePassword = process.env.E2E_INVITE_PASSWORD;
  if (!staffEmail || !staffPassword || !inviteEmail || !invitePassword) {
    throw new Error('E2E_STAFF_EMAIL/E2E_STAFF_PASSWORD and E2E_INVITE_EMAIL/E2E_INVITE_PASSWORD are required; invitation proof must not silently skip.');
  }

  const staffContext = await browser.newContext();
  const staffPage = await staffContext.newPage();
  const staffFailures = captureFailures(staffPage);
  await login(staffPage, staffEmail, staffPassword);
  await expect(staffPage.getByText('دورة العميل')).toBeVisible();

  const customerName = `E2E Invitation ${Date.now()}`;
  const createForm = staffPage.locator('form').filter({ hasText: 'عميل جديد' });
  await createForm.getByLabel('اسم العميل').fill(customerName);
  await createForm.getByRole('button', { name: 'حفظ العميل' }).click();
  await expect(staffPage.getByText(customerName, { exact: true })).toBeVisible();

  const customerCard = staffPage.locator('article.cart-line').filter({ hasText: customerName });
  const emailInput = customerCard.getByLabel(`بريد دعوة ${customerName}`);
  await emailInput.fill(inviteEmail);
  await customerCard.getByRole('button', { name: 'إرسال دعوة' }).click();
  const inviteLink = customerCard.getByRole('link', { name: 'فتح رابط الدعوة' });
  await expect(inviteLink).toBeVisible();
  const href = await inviteLink.getAttribute('href');
  expect(href).toMatch(/\?invite=[0-9a-f]{64}$/);

  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  const customerFailures = captureFailures(customerPage);
  await customerPage.goto(href!);
  await expect(customerPage.getByRole('heading', { name: 'تفعيل حساب العميل' })).toBeVisible();
  await customerPage.getByLabel('البريد المرتبط بالدعوة').fill(inviteEmail);
  await customerPage.getByLabel('كلمة المرور الجديدة').fill(invitePassword);
  await customerPage.getByLabel('تأكيد كلمة المرور').fill(invitePassword);
  await customerPage.getByRole('button', { name: 'قبول الدعوة وتفعيل الحساب' }).click();
  await expect(customerPage.getByText(/تم تفعيل حسابك وربطه بحساب العميل/)).toBeVisible();
  await expect(customerPage.getByText('الكتالوج')).toBeVisible({ timeout: 15000 });
  await expect(customerPage.getByText('بوابة الأغبري', { exact: false }).first()).toBeVisible();

  expect(staffFailures.pageErrors, `Staff browser errors: ${staffFailures.pageErrors.join(' | ')}`).toEqual([]);
  expect(staffFailures.consoleErrors, `Staff console errors: ${staffFailures.consoleErrors.join(' | ')}`).toEqual([]);
  expect(staffFailures.failedResponses, `Staff HTTP >=400: ${staffFailures.failedResponses.join(' | ')}`).toEqual([]);
  expect(customerFailures.pageErrors, `Customer browser errors: ${customerFailures.pageErrors.join(' | ')}`).toEqual([]);
  expect(customerFailures.consoleErrors, `Customer console errors: ${customerFailures.consoleErrors.join(' | ')}`).toEqual([]);
  expect(customerFailures.failedResponses, `Customer HTTP >=400: ${customerFailures.failedResponses.join(' | ')}`).toEqual([]);

  await customerContext.close();
  await staffContext.close();
});
