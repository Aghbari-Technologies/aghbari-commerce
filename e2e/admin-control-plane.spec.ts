import { expect, test } from '@playwright/test';

test.describe('Admin control plane exact browser path', () => {
  test('admin can enter and operate the control plane', async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.goto('/');
    const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
    await loginForm.locator('input[type="email"]').fill(email!);
    await loginForm.locator('input[type="password"]').fill(password!);
    await loginForm.getByRole('button', { name: 'دخول آمن' }).click();

    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible();
    await expect(page.getByText('الصلاحيات تُفرض على الخادم أيضًا')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'إدارة الطلبات' })).toBeVisible();
    await expect(page.getByText('مركز التشغيل التفصيلي وإدارة البيانات')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'منتج جديد' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'تعديل المخزون' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'استيراد Excel آمن' })).toBeVisible();
    await expect(page.getByText('وصول سريع للمهام')).toBeVisible();
    const sectionRail = page.getByRole('navigation', { name: 'اختصارات مركز التشغيل' });
    await expect(sectionRail).toBeVisible();
    await expect(sectionRail.getByRole('button', { name: /إدارة الطلبات/ })).toBeVisible();
    await page.getByRole('button', { name: /أوامر الأغبري/ }).first().click();
    const palette = page.getByRole('dialog', { name: 'أوامر مركز الإدارة' });
    await expect(palette).toBeVisible();
    await expect(palette.getByRole('menuitem', { name: /إدارة الطلبات/ })).toBeVisible();
    await palette.getByRole('menuitem', { name: /إدارة الطلبات/ }).click();
    await expect(page.getByRole('textbox', { name: 'البحث في الطلبات' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'تصفية حالة الطلب' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'الهوية والمظهر' })).toBeVisible();
    await expect(page.locator('input[type="color"][aria-label="لون الواجهة الرئيسي"]')).toBeVisible();
    await expect(page.getByText('كثافة مدمجة', { exact: true })).toBeVisible();

    await expect(page.getByText('العامري', { exact: false })).toHaveCount(0);
    await expect(page.getByText('الأغبري', { exact: false }).first()).toBeVisible();
  });
});
