import { expect, test } from '@playwright/test';
import { baseUrl, cleanupChurchOpsFixtures, login, setupChurchOpsFixtures, type SetupData } from './helpers';

let setupData: SetupData;

test.describe.serial('Regression smoke checks', () => {
  test.beforeAll(async () => {
    setupData = await setupChurchOpsFixtures();
  });

  test.afterAll(async () => {
    await cleanupChurchOpsFixtures();
  });

  test('Login still works', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await expect(page).toHaveURL(/\/protected\/church\/dashboard/);
  });

  test('Dashboard still works', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await expect(page.getByText('Total Members')).toBeVisible();
    await expect(page.getByText('Recent Members')).toBeVisible();
  });

  test('Members still work', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/members`);
    await expect(page.getByText('Members').first()).toBeVisible();
    await expect(page.locator('table tbody')).toContainText('Alpha');
  });

  test('Attendance still works', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/attendance`);
    await expect(page.getByText('Attendance').first()).toBeVisible();
    await expect(page.locator('body')).toContainText('Expected Members');
  });

  test('Pastoral Care still works', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/pastoral-care`);
    await expect(page.getByText('Pastoral Care').first()).toBeVisible();
    await expect(page.locator('body')).toContainText('Open Cases');
  });
});