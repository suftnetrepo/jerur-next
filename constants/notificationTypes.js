/**
 * Church.notification.type catalogue (see app/models/church.js) — the
 * single church-wide announcement configured on Settings -> Notification
 * and shown as a card in the mobile app's notification card.
 *
 * Same pattern as constants/mobileFeatures.js / constants/denominations.js:
 * `id` is what's stored in MongoDB and sent to the API, `label` is
 * display-only. `color` is used for the type badge in the live preview
 * (and, eventually, the mobile notification card itself) - NOT for the
 * type picker cards on the settings form, which use one neutral
 * selected/unselected treatment regardless of type (see
 * others/notification.jsx).
 */
export const NOTIFICATION_TYPES = [
  {
    id: 'announcement',
    label: 'Announcement',
    icon: 'campaign',
    color: '#7C3AED'
  },
  {
    id: 'event',
    label: 'Event',
    icon: 'event',
    color: '#2563EB'
  },
  {
    id: 'promotion',
    label: 'Promotion',
    icon: 'sell',
    color: '#EA580C'
  },
  {
    id: 'scripture',
    label: 'Scripture',
    icon: 'menu_book',
    color: '#059669'
  },
  {
    id: 'welcome',
    label: 'Welcome',
    icon: 'waving_hand',
    color: '#DB2777'
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: 'warning',
    color: '#DC2626'
  },
  {
    id: 'sermon',
    label: 'Sermon',
    icon: 'smart_display',
    color: '#0891B2'
  }
];

export const NOTIFICATION_TYPE_IDS = NOTIFICATION_TYPES.map((type) => type.id);

export const getNotificationType = (id) => NOTIFICATION_TYPES.find((type) => type.id === id) || NOTIFICATION_TYPES[0];

/**
 * Church.notification.priority catalogue. `color` drives the accent bar
 * on the live preview card (and, eventually, the mobile notification card).
 */
export const NOTIFICATION_PRIORITIES = [
  { id: 'low', label: 'Low', color: '#94A3B8' },
  { id: 'normal', label: 'Normal', color: '#2563EB' },
  { id: 'high', label: 'High', color: '#F59E0B' },
  { id: 'urgent', label: 'Urgent', color: '#DC2626' }
];

export const NOTIFICATION_PRIORITY_IDS = NOTIFICATION_PRIORITIES.map((priority) => priority.id);

export const getNotificationPriority = (id) =>
  NOTIFICATION_PRIORITIES.find((priority) => priority.id === id) || NOTIFICATION_PRIORITIES[1];

// {id, title, value} shape the shared Select component expects (same
// pattern as the Denomination dropdown on Settings -> About Us).
export const PRIORITY_OPTIONS = NOTIFICATION_PRIORITIES.map((priority) => ({
  id: priority.id,
  title: priority.label,
  value: priority.id
}));
