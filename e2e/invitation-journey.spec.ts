import { expect, test } from '@playwright/test';

const staffEmail = process.env.E2E_EMAIL?.trim();
const staffPassword = process.env.E2E_PASSWORD;

test('real admin-to-customer invitation journey', async ({ page, context }) => {
  if (!staffEmail || !staffPassword) throw new Error('E2E credentials are required: E2E_EMAIL/E2E_PASSWORD');

  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(`pageerror:${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(`console:${message.text()}`); });
  page.on('response', (response) => { if (response.status() >= 500) failures.push(`http:${response.status()}:${response.url()}`); });

  await page.goto('/');
  await page.getByPlaceholder('البريد الإلكتروني').fill(staffEmail);
  await page.getByPlaceholder('كلمة المرور').fill(staffPassword);
  await page.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByText('مركز الإدارة')).toBeVisible({ timeout: 15000 });

  const unique = Date.now();
  const customerName = `E2E عميل ${unique}`;
  const inviteEmail = `aghbari-e2e-${unique}@example.invalid`;
  const invitedPassword = `Aghbari-${unique}-Secure!`;

  const customerSection = page.locator('#customers');
  await expect(customerSection.getByText('دورة العميل')).toBeVisible();
  await customerSection.getByLabel('اسم العميل').fill(customerName);
  await customerSection.getByLabel('هاتف العميل').fill(`700${String(unique).slice(-6)}`);
  await customerSection.getByRole('button', { name: 'حفظ العميل' }).click();
  await expect(customerSection.getByText(customerName)).toBeVisible({ timeout: 10000 });

  const customerRow = customerSection.locator('article.cart-line', { hasText: customerName });
  await customerRow.getByLabel(`بريد دعوة ${customerName}`).fill(inviteEmail);
  await customerRow.getByRole('button', { name: 'إرسال دعوة' }).click();
  await expect(customerRow.getByRole('link', { name: 'فتح رابط الدعوة' })).toBeVisible({ timeout: 15000 });

  const inviteUrl = await customerRow.getByRole('link', { name: 'فتح رابط الدعوة' }).getAttribute('href');
  expect(inviteUrl).toMatch(/\?invite=[0-9a-f]{64}$/i);
  const invitedPage = await context.newPage();
  await invitedPage.goto(inviteUrl!);
  await expect(invitedPage.getByText('تفعيل حساب العميل')).toBeVisible();
  await invitedPage.getByLabel('البريد المرتبط بالدعوة').fill(inviteEmail);
  await invitedPage.getByPlaceholder('كلمة المرور الجديدة').fill(invitedPassword);
  await invitedPage.getByPlaceholder('تأكيد كلمة المرور').fill(invitedPassword);
  await invitedPage.getByRole('button', { name: 'قبول الدعوة وتفعيل الحساب' }).click();
  await expect(invitedPage.getByRole('status')).toContainText('تم تفعيل حسابك', { timeout: 20000 });
  await invitedPage.waitForURL(/\/$/);
  await expect(invitedPage.getByText('بوابة الأغبري')).toBeVisible({ timeout: 15000 });
  await expect(invitedPage.getByText(customerName)).toBeVisible({ timeout: 15000 });

  if (failures.length) throw new Error(`runtime failures detected: ${failures.join(' | ')}`);
});
