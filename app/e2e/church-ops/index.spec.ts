import { expect, test } from '@playwright/test';
import {
  attendanceStatuses,
  baseUrl,
  cleanupChurchOpsFixtures,
  createAttendanceViaApi,
  createDuplicateCareCaseViaApi,
  login,
  setupChurchOpsFixtures,
  type SetupData
} from './helpers';

let setupData: SetupData;

test.describe.serial('Church operations validation', () => {
  test.beforeAll(async () => {
    setupData = await setupChurchOpsFixtures();
  });

  test.afterAll(async () => {
    await cleanupChurchOpsFixtures();
  });

  test('Attendance page loads, filters, search, pagination, member detail, and care columns work', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/attendance`);

    await expect(page.getByRole('heading', { name: 'Attendance' })).toBeVisible();
    await expect(page.getByText('Sunday Worship')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Expected Members')).toBeVisible();
    await expect(page.getByText('Attendance Submitted')).toBeVisible();
    await expect(page.getByText('Need Attention')).toBeVisible();
    await expect(page.getByText('Open Care Cases')).toBeVisible();
    await expect(page.getByText('Sunday Worship')).toBeVisible();
    await expect(page.getByRole('button', { name: /Present \(/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Online \(/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Absent \(/ })).toBeVisible();

    await expect(page.locator('table')).toContainText('Care Signal');
    await expect(page.locator('table')).toContainText('Care Case');
    await expect(page.locator('table')).toContainText('Urgent');
    await expect(page.locator('table')).toContainText('None');

    await page.getByRole('button', { name: /Absent \(/ }).click();
    await expect(page.locator('table tbody')).toContainText('Absent');

    await page.getByPlaceholder('Search attendance').fill(setupData.attendanceSearchName);
    await expect(page.locator('table tbody')).toContainText(setupData.attendanceSearchName);
    await expect(page.locator('table tbody')).not.toContainText(setupData.attendanceMemberNames[0]);

    await page.getByPlaceholder('Search attendance').fill('');
    await page.getByRole('button', { name: /All \(/ }).click();
    await page.getByRole('button', { name: '>', exact: true }).click();
    await expect(page.getByText('Page 2 of')).toBeVisible();

    await page.getByRole('button', { name: '<', exact: true }).click();
    await page.getByPlaceholder('Search attendance').fill(setupData.attendanceMemberNames[0]);
    await expect(page.locator('table tbody')).toContainText(setupData.attendanceMemberNames[0]);
    await page.getByRole('link', { name: setupData.attendanceMemberNames[0] }).click();
    await expect(page).toHaveURL(/\/protected\/church\/members\?memberId=/);
    await expect(page.getByLabel('First Name')).toBeVisible();
    await page.screenshot({ path: 'test-results/attendance-dashboard.png', fullPage: true });
  });

  test('Service selection refreshes the attendance dashboard', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/attendance`);

    await expect(page.getByText('Sunday Worship')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('table tbody')).toContainText('Lima Member');

    await page.getByText('Midweek Prayer').click();
    await expect(page.locator('table tbody')).toContainText(setupData.midweekAttendanceSearchName);
    await expect(page.locator('table tbody')).not.toContainText('Lima Member');
  });

  test('Attendance submission supports all statuses, prevents duplicates, and updates dashboard statistics', async ({ page }) => {
    await login(page, setupData.email, setupData.password);

    for (const status of attendanceStatuses) {
      const result = await createAttendanceViaApi(page, {
        memberId: setupData.submissionMembers[status],
        serviceId: setupData.serviceIds.submission,
        status,
        message: `Submitted via E2E for ${status}`,
        wantsPastorContact: status === 'SICK' || status === 'NEEDS_PRAYER'
      });

      expect(result.ok).toBeTruthy();
      expect(result.body.success).toBe(true);
    }

    const duplicate = await createAttendanceViaApi(page, {
      memberId: setupData.submissionMembers.PRESENT_IN_CHURCH,
      serviceId: setupData.serviceIds.submission,
      status: 'PRESENT_IN_CHURCH',
      message: 'Duplicate submission'
    });

    expect(duplicate.ok).toBeFalsy();
    expect(String(duplicate.body.error)).toContain('Attendance already submitted');

    await page.goto(`${baseUrl}/protected/church/attendance`);
    await expect(page.getByText('Attendance Submission Service')).toBeVisible({ timeout: 15000 });
    await page.getByText('Attendance Submission Service').click();
    await expect(page.locator('body')).toContainText('Attendance Submitted');
    await expect(page.locator('body')).toContainText('9');
    await expect(page.getByRole('button', { name: /Present \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Online \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Absent \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sick \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Needs Prayer \(1\)/ })).toBeVisible();
  });

  test('Care case creation drawer opens, save succeeds, duplicate validation blocks, and table refreshes', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/attendance`);

    await expect(page.getByText('Sunday Worship')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Absent \(/ }).click();
    await page.getByText('Create Care Case').first().click();

    await expect(page.getByText('Add Follow-up')).toBeVisible();
    await expect(page.getByLabel('Member')).toBeVisible();
    await expect(page.getByLabel('Service')).toBeVisible();
    await page.getByLabel('Notes').fill('Created during E2E validation');
    await page.getByRole('button', { name: 'Create Follow-up' }).click();

    await expect(page.getByText('Add Follow-up')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('table tbody')).toContainText('Open');

    const duplicate = await createDuplicateCareCaseViaApi(page, {
      attendanceId: setupData.creatableAttendance.attendanceId,
      memberId: setupData.creatableAttendance.memberId,
      reason: 'ABSENT',
      note: 'Duplicate follow-up',
      priority: 'MEDIUM'
    });
    expect(duplicate.ok).toBeFalsy();
    expect(String(duplicate.body.error)).toContain('already exists');
  });

  test('Pastoral Care dashboard, filters, search, pagination, open case, status update, notes update, assigned-to and priority filters work', async ({ page }) => {
    await login(page, setupData.email, setupData.password);
    await page.goto(`${baseUrl}/protected/church/pastoral-care`);

    await expect(page.getByRole('heading', { name: 'Pastoral Care' })).toBeVisible();
    await expect(page.getByText('Open Cases').first()).toBeVisible();
    await expect(page.getByText('Assigned To Me').first()).toBeVisible();
    await expect(page.getByText('Contacted').first()).toBeVisible();
    await expect(page.getByText('Closed').first()).toBeVisible();

    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(page.locator('table tbody')).toContainText('Open');

    await page.getByPlaceholder('Search member').fill(setupData.pastoralSearchName);
    await expect(page.locator('table tbody')).toContainText(setupData.pastoralSearchName);
    await page.getByPlaceholder('Search member').fill('');

    await page.locator('select').nth(0).selectOption('ME');
    await expect(page.locator('table tbody')).toContainText('Primary Pastor');
    await page.locator('select').nth(1).selectOption('HIGH');
    await expect(page.locator('table tbody')).toContainText('High');

    await page.locator('select').nth(0).selectOption('ALL');
    await page.locator('select').nth(1).selectOption('ALL');
    await page.getByRole('button', { name: '>', exact: true }).click();
    await expect(page.getByText('Page 2 of')).toBeVisible();
    await page.getByRole('button', { name: '<', exact: true }).click();

    await page.getByPlaceholder('Search member').fill(setupData.pastoralSearchName);
    const targetedCaseRow = page.locator('table tbody tr', { hasText: setupData.pastoralSearchName }).first();
    await expect(targetedCaseRow).toContainText(setupData.pastoralSearchName);
    await targetedCaseRow.getByText('Open Case').click();
    await expect(page.getByText('Pastoral Care Case')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Attendance Information')).toBeVisible({ timeout: 15000 });
    const caseDrawer = page.getByRole('dialog');
    await caseDrawer.getByRole('button', { name: 'Contacted', exact: true }).click();
    await page.waitForFunction(async (caseId) => {
      const response = await fetch(`/api/careFollowUp?action=getById&id=${caseId}`);
      const json = await response.json();

      return response.ok && json?.data?.status === 'CONTACTED';
    }, setupData.pastoralCaseId, { timeout: 15000 });

    const notesField = caseDrawer.getByRole('textbox');
    await notesField.fill('Updated internal notes from Playwright');
    await caseDrawer.getByRole('button', { name: 'Save Notes' }).click();
    await page.waitForFunction(async ({ caseId, expectedNote }) => {
      const response = await fetch(`/api/careFollowUp?action=getById&id=${caseId}`);
      const json = await response.json();

      return response.ok && json?.data?.note === expectedNote;
    }, { caseId: setupData.pastoralCaseId, expectedNote: 'Updated internal notes from Playwright' }, { timeout: 15000 });
    await expect(notesField).toHaveValue('Updated internal notes from Playwright');
    await page.screenshot({ path: 'test-results/pastoral-care-dashboard.png', fullPage: true });
  });
});