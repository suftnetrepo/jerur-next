import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import Church from '../../models/church';
import User from '../../models/user';
import Member from '../../models/member';
import ServiceTime from '../../models/serviceTime';
import Event from '../../models/event';
import { mongoConnect } from '../../../utils/connectDb';
import { login } from './helpers';

const runId = Date.now();
const churchEmail = `e2e-completed-empty-${runId}@example.com`;
const adminEmail = `e2e-completed-empty-admin-${runId}@example.com`;
const password = 'Password123!';
let churchId = '';

test.describe('Permanent onboarding completion', () => {
  test.beforeAll(async () => {
    await mongoConnect();
    const church = await Church.create({
      name: `E2E Completed Empty Church ${runId}`,
      email: churchEmail,
      mobile: '07123456789',
      status: 'active',
      subscriptionId: `sub_completed_empty_${runId}`,
      priceId: `price_completed_empty_${runId}`,
      stripeCustomerId: `cus_completed_empty_${runId}`,
      onboarding: {
        welcomeModalDismissed: true,
        setupChecklistDismissed: true,
        onboardingCompleted: true
      }
    });
    churchId = String(church._id);

    await User.create({
      church: church._id,
      first_name: 'Completed',
      last_name: 'Admin',
      mobile: '07000000001',
      email: adminEmail,
      role: 'admin',
      password: await bcrypt.hash(password, 10),
      user_status: true
    });
  });

  test.afterAll(async () => {
    if (!churchId) return;
    await Promise.all([
      Event.deleteMany({ suid: churchId }),
      Member.deleteMany({ church: churchId }),
      ServiceTime.deleteMany({ suid: churchId }),
      User.deleteMany({ email: adminEmail }),
      Church.deleteOne({ _id: churchId })
    ]);
  });

  test('keeps the live dashboard when setup records are empty', async ({ page }) => {
    await login(page, adminEmail, password);
    await expect(page).toHaveURL(/\/protected\/church\/dashboard/);
    await expect(page.getByText('Total Members')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Recent Members')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Get your church workspace ready');

    const church = await Church.findById(churchId).lean();
    expect(church?.onboarding?.onboardingCompleted).toBe(true);
    expect(await Event.countDocuments({ suid: churchId })).toBe(0);
    expect(await Member.countDocuments({ church: churchId })).toBe(0);
    expect(await ServiceTime.countDocuments({ suid: churchId })).toBe(0);
  });
});
