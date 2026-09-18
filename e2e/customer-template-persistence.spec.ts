import { expect, test } from '@playwright/test';

const email = process.env.E2E_EMAIL?.trim();
const password = process.env.E2E_PASSWORD;

test('customer order template survives reload, re-login, apply, and delete', async ({ page }) => {
  if (!email || !password) throw new Error('E2E_EMAIL/E2E_PASSWORD are required; never silently skip certification E2E.');
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(`pageerror:${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(`console:${message.text()}`); });
  page.on('response', (response) => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) failures.push(`http:${response.status()}:${response.url()}`); });

  await page.goto('/');
  await page.getByPlaceholder('البريد الإلكتروني').fill(email);
  await page.getByPlaceholder('كلمة المرور').fill(password);
  await page.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByText('بوابة الأغبري')).toBeVisible({ timeout: 15000 });
  const firstProduct = page.locator('.product-card').first();
  await expect(firstProduct).toBeVisible({ timeout: 15000 });
  const productName = (await firstProduct.locator('h3').textContent())?.trim() ?? '';
  await firstProduct.getByRole('button', { name: 'إضافة للسلة' }).click();
  await page.getByRole('button', { name: /السلة/ }).click();
  const templateName = `E2E مسحة ${Date.now()}`;
  await page.getByPlaceholder('حفظ كمسحة').fill(templateName);
  await page.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('status')).toContainText('تم حفظ المسحة', { timeout: 10000 });

  await page.getByRole('button', { name: 'المسحات' }).click();
  await expect(page.getByText('المسحات الجاهزة')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.template-card').filter({ hasText: templateName })).toHaveCount(1);

  await page.reload();
  await expect(page.getByText('بوابة الأغبري')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'المسحات' }).click();
  await expect(page.locator('.template-card').filter({ hasText: templateName })).toHaveCount(1);

  await page.locator('.template-card').filter({ hasText: templateName }).getByRole('button', { name: 'إعادة الطلب' }).click();
  await expect(page.getByRole('button', { name: /السلة/ })).toBeVisible();
  await page.getByRole('button', { name: /السلة/ }).click();
  await expect(page.getByText(productName)).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: '×' }).first().click();

  const finalTemplate = page.locator('.template-card').filter({ hasText: templateName });
  await finalTemplate.getByRole('button', { name: 'حذف' }).click();
  await expect(page.getByText('تم حذف المسحة.')).toBeVisible({ timeout: 10000 });
  await expect(finalTemplate).toHaveCount(0);
  if (failures.length) throw new Error(`runtime failures detected: ${failures.join(' | ')}`);
});
