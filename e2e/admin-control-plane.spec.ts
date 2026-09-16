import { expect, test } from '@playwright/test';

test.describe('Admin control plane exact browser path', () => {
  test('admin can enter and operate the control plane', async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.goto('/');
    await page.getByLabel('البريد الإلكتروني').fill(email!);
    await page.getByLabel('كلمة المرور').fill(password!);
    await page.getByRole('button', { name: 'دخول آمن' }).click();

    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible();
    await expect(page.getByText('الصلاحيات تُفرض على الخادم أيضًا')).toBeVisible();
    await expect(page.getByText('إدارة الطلبات')).toBeVisible();
    await expect(page.getByText('إدارة التشغيل التفصيلي وإدارة البيانات')).toBeVisible();

    // The browser must expose operational controls rather than merely hiding them.
    await expect(page.getByRole('heading', { name: 'منتج جديد' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'تعديل المخزون' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'استيراد Excel آمن' })).toBeVisible();

    // No legacy product identity may leak into the control plane.
    await expect(page.getByText('العامري', { exact: false })).toHaveCount(0);
    await expect(page.getByText('الأغبري', { exact: false }).first()).toBeVisible();
  });
});
