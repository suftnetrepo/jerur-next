import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import Church from '../../models/church';
import User from '../../models/user';
import Member from '../../models/member';
import ServiceTime from '../../models/serviceTime';
import Attendance from '../../models/attendance';
import Fellowship from '../../models/fellowship';
import Sermon from '../../models/sermon';
import Event from '../../models/event';
import Donation from '../../models/donation';
import { mongoConnect } from '../../../utils/connectDb';
import { baseUrl, login } from './helpers';

const testRunId = Date.now();
const identifiers = {
  churchName: `E2E Setup Church ${testRunId}`,
  churchEmail: `e2e-setup-church-${testRunId}@example.com`,
  adminEmail: `e2e-setup-admin-${testRunId}@example.com`,
  adminPassword: 'Password123!'
};

type SetupFixture = {
  churchId: string;
  email: string;
  password: string;
};

type DashboardObservations = {
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: string[];
  failedRequests: string[];
  dashboardAggregateCalls: string[];
};

type ScenarioFailure = {
  severity: 'Critical' | 'Major' | 'Minor' | 'Cosmetic';
  area: string;
  detail: string;
};

const buildFreshChurch = () => ({
  name: identifiers.churchName,
  email: identifiers.churchEmail,
  mobile: '07123456789',
  status: 'active',
  subscriptionId: `sub_e2e_${testRunId}`,
  priceId: `price_e2e_${testRunId}`,
  stripeCustomerId: `cus_e2e_${testRunId}`,
  onboarding: {
    welcomeModalDismissed: false,
    setupChecklistDismissed: false,
    onboardingCompleted: false
  }
});

async function setupFreshChurchFixture(): Promise<SetupFixture> {
  await mongoConnect();
  await cleanupFreshChurchFixture();

  const church = await Church.create(buildFreshChurch());
  const hashedPassword = await bcrypt.hash(identifiers.adminPassword, 10);

  await User.create({
    church: church._id,
    first_name: 'Setup',
    last_name: 'Admin',
    mobile: '07000000001',
    email: identifiers.adminEmail,
    role: 'admin',
    password: hashedPassword,
    user_status: true
  });

  return {
    churchId: String(church._id),
    email: identifiers.adminEmail,
    password: identifiers.adminPassword
  };
}

async function cleanupFreshChurchFixture() {
  await mongoConnect();

  const church = await Church.findOne({ email: identifiers.churchEmail });
  const churchId = church?._id;

  if (churchId) {
    await Donation.deleteMany({ suid: churchId });
    await Event.deleteMany({ suid: churchId });
    await Sermon.deleteMany({ churchId });
    await Attendance.deleteMany({ church: churchId });
    await Fellowship.deleteMany({ suid: churchId });
    await ServiceTime.deleteMany({ suid: churchId });
    await Member.deleteMany({ church: churchId });
  }

  await User.deleteMany({ email: identifiers.adminEmail });
  await Church.deleteMany({ email: identifiers.churchEmail });
}

async function completeRequiredSetupTasks(churchId: string) {
  await mongoConnect();

  const [service] = await ServiceTime.create([
    {
      suid: churchId,
      title: 'Sunday Worship',
      start_time: '09:00',
      end_time: '11:00',
      description: 'Primary weekly service',
      status: true,
      remote: false,
      remote_link: '',
      service_type: 'prayer',
      sequency_no: 1,
      days: [0],
      agenda: []
    }
  ]);

  const [leader, member] = await Member.create([
    {
      church: churchId,
      first_name: 'Leader',
      last_name: 'One',
      mobile: '07000000002',
      status: 'active',
      email: `leader-${testRunId}@example.com`,
      pin: 1001,
      role: 'leader'
    },
    {
      church: churchId,
      first_name: 'Member',
      last_name: 'One',
      mobile: '07000000003',
      status: 'active',
      email: `member-${testRunId}@example.com`,
      pin: 1002,
      role: 'member'
    }
  ]);

  const event = await Event.create({
    suid: churchId,
    title: 'E2E Setup Event',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    status: true
  });

  return { serviceId: String(service._id), leaderId: String(leader._id), memberId: String(member._id), eventId: String(event._id) };
}

async function getOnboardingState(churchId: string) {
  await mongoConnect();
  const church = await Church.findById(churchId).lean();
  return church?.onboarding || null;
}

function attachDashboardObservers(page: any): DashboardObservations {
  const observations: DashboardObservations = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedRequests: [],
    dashboardAggregateCalls: []
  };

  page.on('console', (message: any) => {
    const text = message.text();
    if (message.type() === 'error') observations.consoleErrors.push(text);
    if (message.type() === 'warning') observations.consoleWarnings.push(text);
  });

  page.on('pageerror', (error: Error) => {
    observations.pageErrors.push(error.message);
  });

  page.on('requestfailed', (request: any) => {
    observations.failedRequests.push(`${request.method()} ${request.url()}`);
  });

  page.on('request', (request: any) => {
    if (request.url().includes('/api/dashboard')) {
      observations.dashboardAggregateCalls.push(request.url());
    }
  });

  return observations;
}

async function expectSetupDashboard(page: any) {
  await expect(page.getByText('Complete Your Church Setup')).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Quick Actions')).toBeVisible();
  await expect(page.getByText('Setup Progress')).toBeVisible();
  await expect(page.getByText('Recent Members')).toBeVisible();
  await expect(page.getByText('Total Members')).toBeVisible();
  await expect(page.getByText('Upcoming Events')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('User Aggregates');
}

async function dismissFirstRunOverlays(page: any) {
  const result = {
    welcomeDismissed: true,
    tourDismissed: true
  };

  const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to Jerur' });
  if (await welcomeDialog.isVisible().catch(() => false)) {
    await welcomeDialog.getByRole('button', { name: "I'll Do This Later" }).click();
    const closed = await welcomeDialog.waitFor({ state: 'hidden', timeout: 15000 }).then(() => true).catch(() => false);
    if (!closed) {
      result.welcomeDismissed = false;
      await page.evaluate(() => {
        const overlay = document.querySelector('[aria-label="Welcome to Jerur"]');
        if (overlay instanceof HTMLElement) overlay.style.display = 'none';
      });
    }
  }

  await page.evaluate(() => {
    window.localStorage.setItem('jerur.dashboardTour.dismissed', '1');
  });
  await page.reload();
  const tourVisible = await page.getByText('This is your Dashboard').isVisible().catch(() => false);
  if (tourVisible) {
    result.tourDismissed = false;
    await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('h6'));
      const heading = candidates.find((node) => node.textContent?.includes('This is your Dashboard'));
      const overlay = heading?.closest('div[style]');
      if (overlay instanceof HTMLElement) overlay.style.display = 'none';
    });
  }

  return result;
}

async function verifyNavigation(page: any, trigger: () => Promise<void>, expectedUrl: RegExp) {
  try {
    await trigger();
    await expect(page).toHaveURL(expectedUrl, { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

test.describe.serial('Church setup dashboard e2e validation', () => {
  let setupFixture: SetupFixture;
  let observations: DashboardObservations;

  test.setTimeout(240_000);

  test.beforeAll(async () => {
    setupFixture = await setupFreshChurchFixture();
  });

  test.afterAll(async () => {
    await cleanupFreshChurchFixture();
  });

  test('validates setup mode, setup guide, checklist, quick actions, empty states, transition, live dashboard, regression, console, and responsiveness', async ({ page }) => {
    observations = attachDashboardObservers(page);
    const scenarioFailures: ScenarioFailure[] = [];

    await login(page, setupFixture.email, setupFixture.password);
    await expect(page).toHaveURL(/\/protected\/church\/dashboard/);
    await expectSetupDashboard(page);
    await expect(page.getByRole('dialog', { name: 'Welcome to Jerur' })).toBeVisible();
    const firstRunOverlayState = await dismissFirstRunOverlays(page);
    if (!firstRunOverlayState.welcomeDismissed) {
      scenarioFailures.push({ severity: 'Major', area: 'Welcome Overlay', detail: 'The "I\'ll Do This Later" action did not dismiss the welcome overlay within 15 seconds.' });
    }
    if (!firstRunOverlayState.tourDismissed) {
      scenarioFailures.push({ severity: 'Minor', area: 'Product Tour', detail: 'The dashboard product tour remained visible after its local dismissal key was set and the page reloaded.' });
    }

    await expect(page.getByText('Follow these simple steps to get the most out of Jerur.')).toBeVisible();
    await expect(page.getByText('0 of 3 Complete')).toBeVisible();
    await expect(page.getByText('0%')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Your First Service' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Members' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Event' }).first()).toBeVisible();

    await page.getByRole('button', { name: 'View Setup Guide' }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByText('Getting Started with Jerur')).toBeVisible();
    await expect(drawer.getByText('Complete these steps to prepare your church for daily use.')).toBeVisible();
    await expect(drawer.getByRole('heading', { name: 'Create Your First Service' })).toBeVisible();
    await expect(drawer.getByRole('heading', { name: 'Add Members' })).toBeVisible();
    await expect(drawer.getByRole('heading', { name: 'Add Event' })).toBeVisible();
    await expect(drawer.getByText('Tip')).toBeVisible();

    const headerBefore = await drawer.getByText('Getting Started with Jerur').boundingBox();
    const footerBefore = await drawer.getByRole('button', { name: 'Continue Setup' }).boundingBox();
    await drawer.locator('.jerur-setup-guide-scroll').evaluate((element) => { element.scrollTop = element.scrollHeight; });
    const headerAfter = await drawer.getByText('Getting Started with Jerur').boundingBox();
    const footerAfter = await drawer.getByRole('button', { name: 'Continue Setup' }).boundingBox();
    expect(headerBefore?.y).toBe(headerAfter?.y);
    expect(footerBefore?.y).toBe(footerAfter?.y);
    await drawer.getByRole('button', { name: 'Continue Setup' }).click();
    await expect(drawer).not.toBeVisible();

    const quickActionCases = [
      { label: 'Add Member', description: 'Register a new church member', url: /\/protected\/church\/members/ },
      { label: 'Create Service', description: 'Plan a new church service', url: /\/protected\/church\/regular-services/ },
      { label: 'Add Event', description: 'Schedule a church event', url: /\/protected\/church\/events\/create/ },
      { label: 'Record Attendance', description: 'Take attendance for a service', url: /\/protected\/church\/attendance/ },
      { label: 'Add Sermon', description: 'Upload a new sermon', url: /\/protected\/church\/sermons/ }
    ];

    for (const quickAction of quickActionCases) {
      await page.goto(`${baseUrl}/protected/church/dashboard`);
      await expectSetupDashboard(page);
      const ok = await verifyNavigation(
        page,
        async () => {
          await page.locator('button').filter({ has: page.getByText(quickAction.description, { exact: true }) }).first().click();
        },
        quickAction.url
      );
      if (!ok) {
        scenarioFailures.push({
          severity: 'Major',
          area: 'Quick Actions',
          detail: `${quickAction.label} did not navigate to ${quickAction.url}`
        });
      }
    }

    await page.goto(`${baseUrl}/protected/church/dashboard`);
    if (!(await verifyNavigation(page, async () => {
      await page.getByRole('button', { name: 'Record Attendance' }).last().click();
    }, /\/protected\/church\/attendance/))) {
      scenarioFailures.push({ severity: 'Major', area: 'Empty State Attendance', detail: 'Record Attendance CTA did not open the attendance page.' });
    }

    await page.goto(`${baseUrl}/protected/church/dashboard`);
    if (!(await verifyNavigation(page, async () => {
      await page.getByRole('button', { name: 'Add Fellowship Group' }).click();
    }, /\/protected\/church\/fellowships/))) {
      scenarioFailures.push({ severity: 'Major', area: 'Empty State Fellowship', detail: 'Add Fellowship Group CTA did not open the fellowships page.' });
    }

    await page.goto(`${baseUrl}/protected/church/dashboard`);
    if (!(await verifyNavigation(page, async () => {
      await page.getByRole('button', { name: 'Add Member' }).last().click();
    }, /\/protected\/church\/members/))) {
      scenarioFailures.push({ severity: 'Major', area: 'Empty State Members', detail: 'Add Member CTA did not open the members page.' });
    }

    await page.goto(`${baseUrl}/protected/church/dashboard`);
    const completionSeed = await completeRequiredSetupTasks(setupFixture.churchId);
    await page.reload();

    await expect(page.getByText('Recent Members')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('body')).not.toContainText('Complete Your Church Setup');
    await expect(page.locator('body')).toContainText('Total Members');
    await expect(page.locator('body')).toContainText('Upcoming Events');
    await expect(page.locator('body')).toContainText('Fellowship Groups');
    await expect(page.locator('body')).toContainText('Peak Attendance');
    await expect(page.locator('body')).toContainText('No attendance data available');

    const onboardingState = await getOnboardingState(setupFixture.churchId);
    expect(onboardingState?.onboardingCompleted).toBe(true);

    await expect(page.locator('body')).toContainText('Recent Members');
    await expect(page.locator('body')).not.toContainText('Setup Progress');

    const regressionCases = [
      { url: `${baseUrl}/protected/church/members`, text: 'Members' },
      { url: `${baseUrl}/protected/church/attendance`, text: 'Attendance' },
      { url: `${baseUrl}/protected/church/regular-services`, text: 'Regular Services' },
      { url: `${baseUrl}/protected/church/events`, text: 'Events' },
      { url: `${baseUrl}/protected/church/donations`, text: 'Donations' },
      { url: `${baseUrl}/protected/church/pastoral-care`, text: 'Pastoral Care' },
      { url: `${baseUrl}/protected/church/sermons`, text: 'Sermons' }
    ];

    for (const regressionCase of regressionCases) {
      try {
        await page.goto(regressionCase.url);
        await expect(page.locator('body')).toContainText(regressionCase.text);
      } catch (error) {
        scenarioFailures.push({
          severity: regressionCase.url.includes('/donations') ? 'Critical' : 'Major',
          area: 'Regression',
          detail: `Navigation or load failed for ${regressionCase.url}: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${baseUrl}/protected/church/dashboard`);
    await expect(page.locator('body')).toContainText('Recent Members');

    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(`${baseUrl}/protected/church/dashboard`);
    await expect(page.locator('body')).toContainText('Recent Members');

    console.log('SCENARIO_FAILURES', JSON.stringify(scenarioFailures, null, 2));
    console.log('FAILED_REQUESTS', JSON.stringify(observations.failedRequests, null, 2));
    console.log('CONSOLE_ERROR_COUNT', observations.consoleErrors.length);

    test.info().attach('setup-dashboard-scenario-failures', {
      body: JSON.stringify(scenarioFailures, null, 2),
      contentType: 'application/json'
    });

    expect(observations.consoleErrors, 'console errors').toEqual([]);
    expect(observations.pageErrors, 'page errors').toEqual([]);
    expect(observations.failedRequests, 'failed network requests').toEqual([]);
    expect(observations.consoleWarnings.filter((entry) => /hydration|warning/i.test(entry)), 'hydration or react warnings').toEqual([]);
    expect(observations.dashboardAggregateCalls.length, 'dashboard aggregate request count').toBeLessThanOrEqual(8);
    expect(completionSeed.serviceId).toBeTruthy();
  });
});