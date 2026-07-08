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
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
    await expect(page.locator('table tbody')).toContainText('Alpha');
  });

  test('Services still work', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/regular-services`);
    await expect(page.getByRole('heading', { name: 'Regular Services' })).toBeVisible();
    await expect(page.locator('table tbody')).toContainText('Sunday Worship');
  });

  test('Sermons API still works', async ({ page }) => {
    await login(page, setupData.email, setupData.password);

    const body = await page.evaluate(async () => {
      const response = await fetch('/api/sermon?action=latest&limit=5');
      const json = await response.json();

      return {
        ok: response.ok,
        body: json
      };
    });

    expect(body.ok).toBe(true);
    expect(body.body.success).toBe(true);
    expect(Array.isArray(body.body.data)).toBe(true);
  });
});