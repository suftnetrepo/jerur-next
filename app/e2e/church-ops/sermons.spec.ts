import { expect, test } from '@playwright/test';
import {
  baseUrl,
  cleanupChurchOpsFixtures,
  createSermonViaApi,
  deleteSermonViaApi,
  listSermonsViaApi,
  login,
  setupChurchOpsFixtures,
  updateSermonViaApi,
  type SetupData
} from './helpers';

let setupData: SetupData;

const createdTitle = `Playwright Sermon Created ${Date.now()}`;
const updatedTitle = `${createdTitle} Updated`;

const getFieldControl = (scope: any, label: string, selector = 'input, select, textarea') => {
  return scope.locator('label', { hasText: label }).locator('..').locator(selector).first();
};

const dismissCreateSuccessState = async (page: any, drawer: any) => {
  const popup = page.locator('.swal2-popup');
  const confirmCreation = page.locator('.swal2-confirm');
  const cancelCreation = page.locator('.swal2-cancel');

  await popup.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

  if (await confirmCreation.isVisible().catch(() => false)) {
    await confirmCreation.click();
    await popup.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null);
    return;
  }

  if (await cancelCreation.isVisible().catch(() => false)) {
    await cancelCreation.click();
    await popup.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null);
    return;
  }

  await drawer.getByRole('button', { name: 'Cancel' }).click();
};

const dismissUpdateSuccessState = async (page: any, drawer: any) => {
  const popup = page.locator('.swal2-popup');
  const confirmUpdate = page.locator('.swal2-confirm');

  await popup.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

  if (await confirmUpdate.isVisible().catch(() => false)) {
    await confirmUpdate.click();
    await popup.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null);
    return;
  }

  await drawer.getByRole('button', { name: 'Cancel' }).click();
};

const waitForSermonStatus = async (page: any, sermonId: string, expectedStatus: string) => {
  await page.waitForFunction(async ({ id, status }) => {
    const response = await fetch(`/api/sermon?action=getById&id=${id}`);
    const json = await response.json();

    return response.ok && json?.data?.status === status;
  }, { id: sermonId, status: expectedStatus }, { timeout: 15000 });
};

test.describe.serial('Sermons module', () => {
  test.beforeAll(async () => {
    setupData = await setupChurchOpsFixtures();
  });

  test.afterAll(async () => {
    await cleanupChurchOpsFixtures();
  });

  test('Sermons page loads and KPI cards display', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/sermons`);

    const kpiRow = page.locator('.row.mb-4').first();
    await expect(page.getByText('Sermons').first()).toBeVisible();
    await expect(kpiRow.getByText('Total Sermons')).toBeVisible();
    await expect(kpiRow.getByText('This Month')).toBeVisible();
    await expect(kpiRow.getByText('Published')).toBeVisible();
    await expect(kpiRow.getByText('Drafts')).toBeVisible();
    await expect(page.locator('table tbody')).toContainText(setupData.sermonTitles.draft);
  });

  test('Empty state displays when no sermons exist', async ({ page }) => {
    await login(page, setupData.email, setupData.password);

    const currentSermons = await listSermonsViaApi(page, { page: 1, limit: 100 });
    expect(currentSermons.ok).toBe(true);

    for (const sermon of currentSermons.body.data) {
      const result = await deleteSermonViaApi(page, sermon._id);
      expect(result.ok).toBe(true);
    }

    await page.goto(`${baseUrl}/protected/church/sermons`);
    await expect(page.getByText('No sermons found')).toBeVisible();
    await expect(page.getByText('Add your first sermon to begin building your church sermon library.')).toBeVisible();
    await expect(page.locator('table tbody').getByRole('button', { name: '+ Add Sermon' })).toBeVisible();
  });

  test('Add Sermon drawer opens and validation works for required fields', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/sermons`);

    await page.getByRole('button', { name: '+ Add Sermon' }).first().click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByText('Add Sermon', { exact: true })).toBeVisible();
    await drawer.getByRole('button', { name: 'Save Changes' }).click();

    await expect(drawer.getByText('title is required')).toBeVisible();
    await expect(drawer.getByText('speaker is required')).toBeVisible();
    await expect(drawer.getByText('service is required')).toBeVisible();
    await expect(drawer.getByText('date is required')).toBeVisible();
    await expect(drawer.getByText('at least one media URL is required')).toBeVisible();
  });

  test('Create sermon succeeds, created sermon appears in table, search finds sermon, and view drawer opens', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/sermons`);

    await page.getByRole('button', { name: '+ Add Sermon' }).first().click();
    const drawer = page.getByRole('dialog');

    await getFieldControl(drawer, 'Title', 'input').fill(createdTitle);
    await getFieldControl(drawer, 'Speaker', 'input').fill('Playwright Speaker');
    await getFieldControl(drawer, 'Service', 'select').selectOption(setupData.serviceIds.sunday);
    await getFieldControl(drawer, 'Date Preached', 'input').fill('2026-07-09');
    await getFieldControl(drawer, 'Duration', 'input').fill('47');
    await getFieldControl(drawer, 'Summary', 'textarea').fill('Created from Playwright.');
    await getFieldControl(drawer, 'YouTube URL', 'input').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await drawer.getByRole('button', { name: 'Save Changes' }).click();

    await dismissCreateSuccessState(page, drawer);
    await expect(drawer).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('table tbody')).toContainText(createdTitle);

    await page.getByPlaceholder('Search sermons').fill(createdTitle);
    const createdRow = page.locator('table tbody tr', { hasText: createdTitle }).first();
    await expect(createdRow).toContainText(createdTitle);
    await createdRow.locator('svg').first().click({ force: true });
    await expect(page.getByRole('dialog').getByText('View Sermon', { exact: true })).toBeVisible();
    await expect(page.getByText('Created from Playwright.')).toBeVisible();
    await expect(page.getByRole('link', { name: '▶ Play Sermon' })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Status filter works, edit sermon succeeds, publish succeeds, and archive succeeds', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/sermons`);

    await page.getByPlaceholder('Search sermons').fill(createdTitle);
    await expect(page.locator('table tbody')).toContainText(createdTitle);

    await page.getByRole('combobox').first().selectOption('DRAFT');
    await expect(page.locator('table tbody')).toContainText(createdTitle);

    const editRow = page.locator('table tbody tr', { hasText: createdTitle }).first();
    await editRow.locator('svg').nth(1).click({ force: true });

    const drawer = page.getByRole('dialog');
    await getFieldControl(drawer, 'Title', 'input').fill(updatedTitle);
    await getFieldControl(drawer, 'Summary', 'textarea').fill('Updated from Playwright.');
    await drawer.getByRole('button', { name: 'Save Changes' }).click();
    await dismissUpdateSuccessState(page, drawer);
    await expect(page.locator('table tbody')).toContainText(updatedTitle);

    const publishList = await listSermonsViaApi(page, { page: 1, limit: 25, search: updatedTitle });
    const updatedSermonId = publishList.body.data[0]._id;
    const publishResult = await updateSermonViaApi(page, updatedSermonId, {}, 'publish');
    expect(publishResult.ok).toBe(true);
    await waitForSermonStatus(page, updatedSermonId, 'PUBLISHED');

    await page.getByPlaceholder('Search sermons').fill(updatedTitle);
    await page.getByRole('combobox').first().selectOption('PUBLISHED');
    await expect(page.locator('table tbody')).toContainText(updatedTitle);

    const archiveResult = await updateSermonViaApi(page, updatedSermonId, {}, 'archive');
    expect(archiveResult.ok).toBe(true);
    await waitForSermonStatus(page, updatedSermonId, 'ARCHIVED');

    await page.getByRole('combobox').first().selectOption('ARCHIVED');
    await expect(page.locator('table tbody')).toContainText(updatedTitle);
  });

  test('Pagination does not break and delete sermon succeeds', async ({ page }) => {
    await login(page, setupData.email, setupData.password);

    for (let index = 0; index < 11; index += 1) {
      const response = await createSermonViaApi(page, {
        title: `Pagination Sermon ${index} ${Date.now()}`,
        speakerName: `Speaker ${index}`,
        serviceId: setupData.serviceIds.sunday,
        preachedAt: `2026-07-${String((index % 9) + 10).padStart(2, '0')}T09:00:00.000Z`,
        durationMinutes: 20 + index,
        status: 'DRAFT',
        summary: 'Pagination support sermon',
        media: {
          audioUrl: `https://cdn.example.com/sermon-${index}.mp3`,
          thumbnail: ''
        }
      });

      expect(response.ok).toBe(true);
    }

    await page.goto(`${baseUrl}/protected/church/sermons`);
    await page.getByPlaceholder('Search sermons').fill('');
    await page.getByRole('combobox').first().selectOption('ALL');
    await page.getByRole('button', { name: '>', exact: true }).click();
    await expect(page.getByText('Page 2 of')).toBeVisible();

    await page.getByRole('button', { name: '<', exact: true }).click();
    await page.getByPlaceholder('Search sermons').fill(updatedTitle);
    await expect(page.locator('table tbody')).toContainText(updatedTitle);

    const archivedRow = page.locator('table tbody tr', { hasText: updatedTitle }).first();
    page.once('dialog', (dialog) => dialog.accept()).catch?.(() => {});
    await archivedRow.locator('svg').nth(2).click({ force: true });
    await page.getByRole('button', { name: 'Yes, delete it!' }).click();
    await expect(page.locator('table tbody')).not.toContainText(updatedTitle, { timeout: 15000 });
  });
});