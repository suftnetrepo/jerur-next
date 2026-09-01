import Church from '../models/church';

// Existing records with a blank or historical status are deliberately allowed
// so enabling enforcement does not lock out legacy production churches. Only
// explicit Stripe/non-payment states are denied.
const BLOCKED_SUBSCRIPTION_STATUSES = new Set([
  'inactive',
  'suspended',
  'cancelled',
  'canceled',
  'past_due',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
]);

export function subscriptionStatusAllowsAdminAccess(status) {
  if (typeof status !== 'string' || !status.trim()) return true;
  return !BLOCKED_SUBSCRIPTION_STATUSES.has(status.trim().toLowerCase());
}

export async function churchHasAdminEntitlement(churchId) {
  if (!churchId) return true;

  const church = await Church.findById(churchId).select('status').lean();
  if (!church) return false;

  return subscriptionStatusAllowsAdminAccess(church.status);
}

export { BLOCKED_SUBSCRIPTION_STATUSES };
