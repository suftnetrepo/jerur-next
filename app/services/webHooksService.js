import dotenv from 'dotenv';
import { findSubscriptionPlanByPriceId } from '../../constants/subscriptionPlans';
import { updateChurchStatus } from './churchService';
import { sendEmail } from '../../lib/mail';
import { compileEmailTemplate } from '../templates/compile-email-template';
import { logger } from '../../utils/logger';
import { emailTemplates } from '../email';
import { getStripeClient } from '../../lib/stripe';

dotenv.config();

const stripeDate = (unixTimestamp) => (
  Number.isFinite(unixTimestamp) ? new Date(unixTimestamp * 1000) : null
);

const subscriptionPriceId = (subscription) => (
  subscription?.items?.data?.[0]?.price?.id || subscription?.plan?.id || ''
);

const eventCustomerId = (object) => (
  object?.metadata?.stripeCustomerId
  || (typeof object?.customer === 'string' ? object.customer : object?.customer?.id)
  || ''
);

const invoiceMetadata = (invoice) => ({
  ...(invoice?.parent?.subscription_details?.metadata || {}),
  ...(invoice?.subscription_details?.metadata || {}),
  ...(invoice?.lines?.data?.[0]?.metadata || {})
});

const sendEmailSafely = async (mailOptions, context) => {
  if (!mailOptions.to) {
    logger.warn({ context }, 'Skipping subscription email because no recipient was supplied');
    return;
  }

  try {
    await sendEmail(mailOptions);
  } catch (error) {
    // Billing state has already been persisted. Email delivery must not cause
    // Stripe to retry an otherwise successfully processed webhook.
    logger.error(error, `Failed to send ${context} email`);
  }
};

const invoicePaymentSuccess = async (event) => {
  try {
    const { hosted_invoice_url, amount_paid, period_end } = event.data.object;

    const metadata = invoiceMetadata(event.data.object);
    const { contact, email } = metadata;
    const stripeCustomerId = metadata.stripeCustomerId || eventCustomerId(event.data.object);
    if (!stripeCustomerId) throw new Error('Invoice is missing a Stripe customer ID');
    const amountPaidInDollars = amount_paid * 0.01;
    const periodEndFormatted = stripeDate(period_end)?.toISOString();

    await updateChurchStatus(stripeCustomerId, { status: 'active' });

    const html = await compileEmailTemplate(
      emailTemplates.invoicePaymentSuccess({
        hosted_invoice_url,
        email: email,
        amount_paid: amountPaidInDollars,
        periodEnd: periodEndFormatted,
        contact,
        contactEmail: process.env.CONTACT_EMAIL,
        contactMobile: process.env.CONTACT_MOBILE,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: email,
      subject: 'Invoice paid Successfully',
      text: 'Invoice paid Successfully',
      html
    };

    await sendEmailSafely(mailOptions, 'invoice payment success');
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const setDefaultPaymentMethod = async (event) => {
  try {
    if (event.data.object.billing_reason === 'subscription_create') {
      const subscription_id = event.data.object.subscription;
      const payment_intent_id = event.data.object.payment_intent;

      if (payment_intent_id != null) {
        const stripe = getStripeClient();
        const payment_intent = await stripe.paymentIntents.retrieve(payment_intent_id);
        await stripe.subscriptions.update(subscription_id, {
          default_payment_method: payment_intent.payment_method
        });
      }
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const invoicePaymentFailed = async (event) => {
  try {
    const { hosted_invoice_url, period_end } = event.data.object;
    const metadata = invoiceMetadata(event.data.object);
    const { contact, email } = metadata;
    const stripeCustomerId = metadata.stripeCustomerId || eventCustomerId(event.data.object);
    if (!stripeCustomerId) throw new Error('Invoice is missing a Stripe customer ID');

    await updateChurchStatus(stripeCustomerId, { status: 'suspended' });

    const html = await compileEmailTemplate(
      emailTemplates.invoicePaymentFailed({
        hosted_invoice_url,
        period_end: stripeDate(period_end)?.toISOString(),
        contact,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Invoice Payment Failed',
      text: 'Invoice Payment Failed',
      html
    };

    await sendEmailSafely(mailOptions, 'invoice payment failure');
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const trialWillEnd = async (event) => {
  try {
    const { metadata, current_period_end } = event.data.object;
    const { contact, email } = metadata;

    const html = await compileEmailTemplate(
      emailTemplates.trialWillEnd({
        periodEnd: stripeDate(current_period_end)?.toISOString(),
        contact,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Trial Will Soon End',
      text: 'Trial Will Soon End',
      html
    };

    await sendEmailSafely(mailOptions, 'trial ending');
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const updateSubscription = async (event) => {
  try {
    const subscription = event.data.object;
    const { metadata = {}, current_period_end, current_period_start, id, status } = subscription;
    const { email, contact } = metadata;
    const stripeCustomerId = eventCustomerId(subscription);
    const priceId = subscriptionPriceId(subscription);
    const planDetails = findSubscriptionPlanByPriceId(priceId);

    if (!stripeCustomerId) throw new Error('Subscription is missing a Stripe customer ID');
    if (!planDetails) throw new Error(`Unknown Stripe subscription price ${priceId}`);

    const { price, billingCycle, planName } = planDetails;

    await updateChurchStatus(stripeCustomerId, {
      plan: planName,
      startDate: stripeDate(current_period_start),
      endDate: stripeDate(current_period_end),
      priceId,
      status,
      subscriptionId: id
    });

    const html = await compileEmailTemplate(
      emailTemplates.updateSubscription({
        contact,
        price,
        plan: planName,
        billingCycle,
        contactEmail: process.env.CONTACT_EMAIL,
        contactMobile: process.env.CONTACT_MOBILE,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Subscription Update',
      text: 'Subscription Update',
      html
    };

    if (status === 'active') {
      await sendEmailSafely(mailOptions, 'subscription update');
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const createSubscription = async (event) => {
  try {
    const subscription = event.data.object;
    const { metadata = {} } = subscription;
    const { email, contact } = metadata;
    const priceId = subscriptionPriceId(subscription);
    const planDetails = findSubscriptionPlanByPriceId(priceId);
    if (!planDetails) throw new Error(`Unknown Stripe subscription price ${priceId}`);
    const { price, billingCycle, planName, duration } = planDetails;

    const html = await compileEmailTemplate(
      emailTemplates.subscriptionWelcomeMessage({
        userName: email,
        contact,
        price,
        plan: planName,
        url: process.env.LOGIN_URL,
        billingCycle,
        contactEmail: process.env.CONTACT_EMAIL,
        team: process.env.TEAM,
        duration: duration,
        password: '12345!'
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Welcome to Jerur',
      text: 'Welcome to Jerur',
      html
    };

    await sendEmailSafely(mailOptions, 'subscription welcome');
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const cancelSubscription = async (event) => {
  try {
    const subscription = event.data.object;
    const { metadata = {}, current_period_end, current_period_start } = subscription;
    const { contact, email } = metadata;
    const stripeCustomerId = eventCustomerId(subscription);
    if (!stripeCustomerId) throw new Error('Subscription is missing a Stripe customer ID');

    await updateChurchStatus(stripeCustomerId, {
      startDate: stripeDate(current_period_start),
      endDate: stripeDate(current_period_end),
      status: 'cancelled'
    });

    const html = await compileEmailTemplate(
      emailTemplates.subscriptionCancellation({
        contact,
        periodEnd: stripeDate(current_period_end)?.toISOString(),
        contactEmail: process.env.CONTACT_EMAIL,
        contactMobile: process.env.CONTACT_MOBILE,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Subscription Cancelled',
      text: 'Subscription Cancelled',
      html
    };

    await sendEmailSafely(mailOptions, 'subscription cancellation');
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const cancelTrial = async (event) => {
  try {
    const subscription = event.data.object;
    const { metadata = {}, current_period_end } = subscription;
    const { contact, email } = metadata;
    const stripeCustomerId = eventCustomerId(subscription);
    if (!stripeCustomerId) throw new Error('Subscription is missing a Stripe customer ID');

    await updateChurchStatus(stripeCustomerId, {
      endDate: stripeDate(current_period_end),
      status: 'cancelled'
    });

    const html = await compileEmailTemplate(
      emailTemplates.trialCancellation({
        contact,
        periodEnd: stripeDate(current_period_end)?.toISOString(),
        contactEmail: process.env.CONTACT_EMAIL,
        contactMobile: process.env.CONTACT_MOBILE,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Trial Cancelled',
      text: 'Trial Cancelled',
      html
    };

    await sendEmailSafely(mailOptions, 'trial cancellation');
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  trialWillEnd,
  cancelTrial,
  cancelSubscription,
  createSubscription,
  updateSubscription,
  invoicePaymentFailed,
  setDefaultPaymentMethod,
  invoicePaymentSuccess
};
