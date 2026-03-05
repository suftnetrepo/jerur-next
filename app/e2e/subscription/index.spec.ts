import { test, expect } from '@playwright/test';

test.describe('SaaS Subscription Journey', () => {

    test('User can subscribe successfully', async ({ page }) => {

        // 1️⃣ Go to checkout page
        await page.goto('http://localhost:3000/checkout/price_1HDVRhJ9QQF7JMlNSdnkB7l4');

        // 2️⃣ Fill user form
        await page.getByTestId('church-name').fill('Test Church');
        await page.getByTestId('first-name').fill('John');
        await page.getByTestId('last-name').fill('Doe');
        await page.getByTestId('email').fill(`test${Date.now()}@mail.com`);
        await page.getByTestId('mobile').fill('07123456789');

        // Accept terms
        await page.getByTestId('terms').check();

        // 3️⃣ Click Pay
        await page.getByTestId('pay-button').click();

        // Wait for subscription API call
        await page.waitForResponse(resp =>
            resp.url().includes('/api') && resp.status() === 200
        );

        // 4️⃣ Fill Stripe card inside iframe
        await page.waitForSelector('iframe[title="Secure card payment input frame"]');

        const stripeFrame = page.frameLocator(
            'iframe[title="Secure card payment input frame"]'
        );

        await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
        await stripeFrame.locator('input[name="exp-date"]').fill('12 / 34');
        await stripeFrame.locator('input[name="cvc"]').fill('123');

        // 5️⃣ Wait for redirect to dashboard
        await page.waitForURL('**/protected/church/dashboard', {
            timeout: 20000
        });

        await expect(page).toHaveURL(/dashboard/);
    });

    test('User sees error when card is declined', async ({ page }) => {

        await page.goto('http://localhost:3000/checkout/price_1HDVRhJ9QQF7JMlNSdnkB7l4');

        // Fill form
        await page.getByTestId('church-name').fill('Test Church');
        await page.getByTestId('first-name').fill('John');
        await page.getByTestId('last-name').fill('Doe');
        await page.getByTestId('email').fill(`fail${Date.now()}@mail.com`);
        await page.getByTestId('mobile').fill('07123456789');
        await page.getByTestId('terms').check();

        await page.getByTestId('pay-button').click();

        // Wait for Stripe iframe
        await page.waitForSelector('iframe[title="Secure card payment input frame"]');

        const stripeFrame = page.frameLocator(
            'iframe[title="Secure card payment input frame"]'
        );

        // ❌ Use failing card
        await stripeFrame.locator('input[name="cardnumber"]').fill('4000000000009995');
        await stripeFrame.locator('input[name="exp-date"]').fill('12 / 34');
        await stripeFrame.locator('input[name="cvc"]').fill('123');

        // Wait for Stripe to respond
        await page.waitForTimeout(3000);

        // ✅ Ensure user is still on checkout page
        await expect(page).toHaveURL(/checkout/);

        // Wait for Stripe to respond
        await page.waitForTimeout(3000);

        // ✅ Ensure dashboard did NOT load
        await expect(page).not.toHaveURL(/dashboard/);
    });

    test('User can retry payment with same clientSecret after failure', async ({ page }) => {

        await page.goto('http://localhost:3000/checkout/price_1HDVRhJ9QQF7JMlNSdnkB7l4');

        // Fill form
        await page.getByTestId('church-name').fill('Retry Church');
        await page.getByTestId('first-name').fill('Retry');
        await page.getByTestId('last-name').fill('User');
        await page.getByTestId('email').fill(`retry${Date.now()}@mail.com`);
        await page.getByTestId('mobile').fill('07123456789');
        await page.getByTestId('terms').check();

        await page.getByTestId('pay-button').click();

        // Wait for Stripe iframe
        await page.waitForSelector('iframe[title="Secure card payment input frame"]');

        const stripeFrame = page.frameLocator(
            'iframe[title="Secure card payment input frame"]'
        );

        // ❌ First attempt: failing card
        await stripeFrame.locator('input[name="cardnumber"]').fill('4000000000009995');
        await stripeFrame.locator('input[name="exp-date"]').fill('12 / 34');
        await stripeFrame.locator('input[name="cvc"]').fill('123');

        // Close error modal
        await page.getByText('OK').click();

        // Wait for modal gone
        await page.waitForSelector('text=Your card has insufficient funds', { state: 'detached' });

        // Re-enter card details FIRST
        const retryFrame = page.frameLocator(
            'iframe[title="Secure card payment input frame"]'
        );

        // Clear & retype card
        await retryFrame.locator('input[name="cardnumber"]').click();
        await retryFrame.locator('input[name="cardnumber"]').pressSequentially('4242424242424242', { delay: 40 });

        await retryFrame.locator('input[name="exp-date"]').click();
        await retryFrame.locator('input[name="exp-date"]').pressSequentially('1234', { delay: 40 });

        await retryFrame.locator('input[name="cvc"]').click();
        await retryFrame.locator('input[name="cvc"]').pressSequentially('123', { delay: 40 });

        // 🔥 Now click Pay
        await page.getByTestId('pay-button').click();

        // Wait for redirect
        await page.waitForURL('**/protected/church/dashboard', { timeout: 30000 });

        await expect(page).toHaveURL(/dashboard/);
    });

});