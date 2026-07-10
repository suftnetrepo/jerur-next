export const DONATION_TYPES = [
  { value: 'tithe', label: 'Tithe' },
  { value: 'offering', label: 'Offering' },
  { value: 'building_fund', label: 'Building Fund' },
  { value: 'mission', label: 'Mission' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'seed', label: 'Seed' },
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'special_project', label: 'Special Project' },
  { value: 'welfare_charity', label: 'Welfare / Charity' },
  { value: 'other', label: 'Other' }
];

export const DONATION_TYPE_VALUES = DONATION_TYPES.map((type) => type.value);

export const DONATION_TYPE_LABELS = DONATION_TYPES.reduce((accumulator, type) => ({
  ...accumulator,
  [type.value]: type.label
}), {});

export const DONATION_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Donation Types' },
  ...DONATION_TYPES
];

export const PAYMENT_METHOD_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Payment Methods' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' }
];

export const getDonationTypeLabel = (value) => {
  if (!value) {
    return 'Unknown';
  }

  if (DONATION_TYPE_LABELS[value]) {
    return DONATION_TYPE_LABELS[value];
  }

  return String(value)
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const getPaymentMethodLabel = (online) => (online ? 'Online' : 'Offline');