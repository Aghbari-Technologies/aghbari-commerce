import { expect, test } from '@playwright/test';

const email = process.env.E2E_CUSTOMER_EMAIL?.trim();
const password = process.env.E2E_CUSTOMER_PASSWORD;

test('customer order template survives reload and re-login', async ({ page }) => {
  test.skip(!email || !password, 'E2E_CUSTOMER_EMAIL/E2E_CUSTOMER_PASSWORD are required for customer runtime certification');
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(`pageerror:${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(`console:${message.text()}`); });
  page.on('response', (response) => { if (response.status() >= 500) failures.push(`http:${response.status()}:${response.url()}`); });

  await page.goto('/');
  await page.getByPlaceholder('البريد الإلكتروني').fill(email!);
  await page.getByPlaceholder('كلمة المرور').fill(password!);
  await page.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByText('بوابة الأغبري')).toBeVisible({ timeout: 15000 });

  const firstProduct = page.locator('.product-card').first();
  await expect(firstProduct).toBeVisible({ timeout: 15000 });
  await firstProduct.getByRole('button', { name: 'إضافة للسلة' }).click();
  await page.getByRole('button', { name: /السلة/ }).click();
  await page.getByPlaceholder('حفظ كمسحة').fill(`E2E مسحة ${Date.now()}`);
  await page.getByRole('button', { name: 'حفظ', exact: true }).click();
  await expect(page.getByText('تم حفظ المسحة في قاعدة البيانات.')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'الطلبات الدورية' }).click().catch(() => page.getByRole('button', { name: 'المسحات' }).click());
  await expect(page.getByText('المسحات الجاهزة')).toBeVisible({ timeout: 10000 });
  const templateText = await page.locator('.template-card strong').first().textContent();
  expect(templateText).toMatch(/^E2E مسحة /);

  await page.reload();
  await expect(page.getByText('المسحات الجاهزة')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.template-card strong').first()).toHaveText(templateText!);

  await page.getByRole('button', { name: 'خروج' }).click();
  await expect(page.getByRole('button', { name: 'دخول آمن' })).toBeVisible();
  await page.getByPlaceholder('البريد الإلكتروني').fill(email!);
  await page.getByPlaceholder('كلمة المرور').fill(password!);
  await page.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByText('بوابة الأغبري')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'المسحات' }).click();
  await expect(page.locator('.template-card strong').first()).toHaveText(templateText!, { timeout: 15000 });

  if (failures.length) throw new Error(`runtime failures detected: ${failures.join(' | ')}`);
});
